require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");

const { adminMiddleware } = require("./controllers/admin/admin-middleware");

//create a database connection -> u can also
//create a separate file for this and then import/use that file here
const mongoURI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_CLUSTER}/`
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("Failed to connect to MongoDB: ", error));

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://shopverse-kmmo.onrender.com",
  "https://myshopverse.vercel.app",
];

if (process.env.NODE_ENV === "development") {
  allowedOrigins.push("http://localhost:5173");
}
console.log("NODE_ENV =", process.env.NODE_ENV);

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      // ✅ DEV MODE: allow everything
      if (process.env.NODE_ENV === "development ") {
        return callback(null, true);
      }

      // ✅ PROD MODE: strict allowlist
      const allowedOrigins = [
        "https://shopverse-kmmo.onrender.com",
        "https://myshopverse.vercel.app",
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("Blocked by CORS:", origin);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
  })
);



const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
});

app.use(globalLimiter);
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminMiddleware, adminProductsRouter);
app.use("/api/admin/orders", adminMiddleware, adminOrderRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

app.use("/api/common/feature", commonFeatureRouter);

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
