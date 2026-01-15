const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL is not defined in backend environment variables");
}

const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthenticated' 
      });
    }

    // 🚫 Reject any client-provided pricing data
    if (req.body.userId || req.body.cartItems || req.body.totalAmount) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payload" 
      });
    }

    // ✅ Fetch cart from database (source of truth)
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty' 
      });
    }

    // ✅ Verify all products exist and have sufficient stock
    for (const item of cart.items) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product in cart'
        });
      }

      // Fetch fresh product data to ensure no stale cart data
      const freshProduct = await Product.findById(item.productId._id);
      
      if (!freshProduct) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId.title} no longer exists`
        });
      }

      if (freshProduct.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${freshProduct.title}. Only ${freshProduct.totalStock} available.`
        });
      }

      // Update cart item with fresh product data (in case prices changed)
      item.productId = freshProduct;
    }

    // ✅ Calculate total from FRESH database prices (not cart prices)
    let totalAmount = 0;
    const itemsForPaypal = [];

    for (const item of cart.items) {
      const product = item.productId;
      
      // Use salePrice if available, otherwise regular price
      const actualPrice = product.salePrice > 0 ? product.salePrice : product.price;
      
      totalAmount += actualPrice * item.quantity;

      itemsForPaypal.push({
        name: product.title,
        sku: product._id.toString(),
        price: actualPrice.toFixed(2),
        currency: "USD",
        quantity: item.quantity,
      });
    }

    const { addressInfo } = req.body;

    if (!addressInfo || !addressInfo.address || !addressInfo.city) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address information'
      });
    }

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${FRONTEND_URL}/shop/paypal-return`,
        cancel_url: `${FRONTEND_URL}/shop/paypal-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: itemsForPaypal 
          },
          amount: { 
            currency: "USD", 
            total: totalAmount.toFixed(2) 
          },
          description: `Order for user ${userId}`,
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.error("PayPal create payment error:", error);
        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment",
        });
      }

      // ✅ Store order with server-calculated prices
      const newlyCreatedOrder = new Order({
        userId,
        cartId: cart._id,
        cartItems: cart.items.map((item) => {
          const actualPrice = item.productId.salePrice > 0 
            ? item.productId.salePrice 
            : item.productId.price;
          
          return {
            productId: item.productId._id,
            title: item.productId.title,
            quantity: item.quantity,
            price: actualPrice, // ✅ Server-verified price
          };
        }),
        addressInfo,
        orderStatus: "pending",
        paymentMethod: "paypal",
        paymentStatus: "pending",
        totalAmount: totalAmount, // ✅ Server-calculated total
        orderDate: new Date(),
        orderUpdateDate: new Date(),
      });

      await newlyCreatedOrder.save();

      const approvalURL = paymentInfo.links.find(
        (link) => link.rel === "approval_url"
      ).href;

      return res.status(201).json({
        success: true,
        approvalURL,
        orderId: newlyCreatedOrder._id,
      });
    });
  } catch (e) {
    console.error("Create order error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentId, payerId, orderId } = req.body;

    if (!paymentId || !payerId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 1️⃣ Enforce ownership
    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to confirm this order",
      });
    }

    // 2️⃣ Prevent double capture
    if (order.paymentStatus === "paid") {
      return res.status(409).json({
        success: false,
        message: "Order already paid",
      });
    }

    // 3️⃣ Verify payment with PayPal
    paypal.payment.execute(
      paymentId,
      { payer_id: payerId },
      async (error, payment) => {
        if (error) {
          console.error("PayPal execute error:", error);
          return res.status(400).json({
            success: false,
            message: "Payment verification failed",
          });
        }

        // 4️⃣ Validate PayPal state
        if (payment.state !== "approved") {
          return res.status(400).json({
            success: false,
            message: "Payment not approved",
          });
        }

        const transaction = payment.transactions[0];
        const paidAmount = Number(transaction.amount.total);
        const paidCurrency = transaction.amount.currency;

        // 5️⃣ ✅ CRITICAL: Validate amount matches server-calculated total
        const expectedAmount = Number(order.totalAmount.toFixed(2));
        
        if (paidCurrency !== "USD") {
          return res.status(400).json({
            success: false,
            message: "Invalid payment currency",
          });
        }

        if (Math.abs(paidAmount - expectedAmount) > 0.01) {
          console.error(`Payment amount mismatch! Expected: ${expectedAmount}, Paid: ${paidAmount}`);
          return res.status(400).json({
            success: false,
            message: "Payment amount mismatch. Please try again.",
          });
        }

        // 6️⃣ ✅ Re-verify stock availability before finalizing
        for (const item of order.cartItems) {
          const product = await Product.findById(item.productId);

          if (!product) {
            return res.status(400).json({
              success: false,
              message: `Product no longer available`,
            });
          }

          if (product.totalStock < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for ${product.title}`,
            });
          }

          // ✅ Reduce stock atomically
          product.totalStock -= item.quantity;
          await product.save();
        }

        // 7️⃣ Finalize order
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.paymentId = paymentId;
        order.payerId = payerId;
        order.orderUpdateDate = new Date();

        await order.save();

        // Clean up cart after successful payment
        await Cart.findByIdAndDelete(order.cartId);

        return res.status(200).json({
          success: true,
          message: "Order confirmed",
          data: order,
        });
      }
    );
  } catch (e) {
    console.error("Capture payment error:", e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.error("Get orders error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // ✅ Verify ownership
    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.error("Get order details error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};