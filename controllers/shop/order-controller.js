const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ success:false, message: 'Unauthenticated' });

    if (req.body.userId || req.body.cartItems || req.body.totalAmount) {
  return res.status(400).json({ success: false, message: "Invalid payload" });
  }


    // Fetch cart server-side
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success:false, message: 'Cart is empty' });
    }

    // Build items list and compute total from DB product prices
    const itemsForPaypal = cart.items.map(it => {
      const prod = it.productId;
      return {
        name: prod.title,
        sku: prod._id.toString(),
        price: prod.price.toFixed(2),
        currency: "USD",
        quantity: it.quantity,
      };
    });

    const totalAmount = cart.items.reduce((sum, it) => {
      const price = Number(it.productId.price);
      return sum + price * it.quantity;
    }, 0);

    const { addressInfo } = req.body;

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "https://myshopverse.vercel.app/shop/paypal-return",
        cancel_url: "https:/myshopverse.vercel.app/shop/paypal-cancel",
      },
      transactions: [
        {
          item_list: {
            items: itemsForPaypal },
          amount: { currency: "USD", total: totalAmount.toFixed(2) },
          description: `Order for user ${userId}`,
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.error(error);

        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment",
        });
      } 
        
      const newlyCreatedOrder = new Order({
        userId,
        cartId: cart._id,
        cartItems: cart.items.map((it) => ({
          productId: it.productId._id,
          title: it.productId.title,
          quantity: it.quantity,
          price: it.productId.price,
        })),
          addressInfo,
          orderStatus: "pending",
          paymentMethod: "paypal",
          paymentStatus: "pending",
          totalAmount,
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
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;

      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    const orders = await Order.find({ userId });

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
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
