const express = require("express");
const userRouter = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");

userRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, username } =
      req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      username,
    });

    const userData = {
      userId: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      username: newUser.username,
    };

    const token = jwt.sign(userData, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });
    res.status(200).json({
      success: true,
      message: "User Signed up Successfully",
      token: token,
      userData,
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({
      success: false,
      message: "Error in signup",
    });
  }
});

userRouter.post("/signin", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Check if the user exists with the provided email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in signin",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const userData = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      walletAddress: user.walletAddress,
    };

    const token = jwt.sign(userData, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });
    return res.status(200).json({
      success: true,
      message: "User Login successfull",
      token: token,
      userData,
    });
  } catch (err) {
    // console.error('Error during signin:', err);
    res.status(500).json({
      success: false,
      message: "Error in signin",
      error: err,
    });
  }
});

//edit profile details
userRouter.put("/update/profile/:id", async (req, res) => {
  try {
    const username = req.params.id;

    const user = await User.findOneAndUpdate(
      { username: username },
      { $set: req.body },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found in put id",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle Registration Done",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user details",
    });
  }
});

userRouter.get("/profile", auth, async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in profile",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User found",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
});

userRouter.put("/update-wallet", auth, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const id = req.user._id;
    const user = await User.findByIdAndUpdate(
      { _id: id },
      { walletAddress: walletAddress },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in put",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Wallet Address Updated",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update wallet address",
      data: err.message,
    });
  }
});

module.exports = userRouter;
