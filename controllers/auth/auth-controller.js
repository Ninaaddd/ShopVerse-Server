require('dotenv').config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");


// REGISTER
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ userName, email, password: hashedPassword, role: "user" });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "60m" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "prod", // use true in production (HTTPS)
      sameSite: process.env.NODE_ENV == "prod" ? "None" : "Lax",
      path: "/", // <-- make sure this is set
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    console.log(`created cookie: ${token}`)

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      user: {
        id: user._id,
        // role: user.role,
        email: user.email,
        userName: user.userName,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: `Server error during login. ${error}`,
    });
  }
};

// LOGOUT
const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};



const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorised user!" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch authoritative user record from DB
    const userFromDb = await User.findById(decoded.id).select("+role");
    if (!userFromDb) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Attach DB user and token-decoded user
    req.user = {
      id: userFromDb._id.toString(),
      email: userFromDb.email,
      userName: userFromDb.userName,
      role: userFromDb.role, // authoritative role
    };
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Unauthorised user!" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };