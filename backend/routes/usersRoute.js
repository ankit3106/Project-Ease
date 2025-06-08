const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");


router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).send({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const user = new User(req.body);
    await user.save();
    res.status(201).send({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User does not exist",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!passwordCorrect) {
      return res.status(400).send({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Remove password before sending user info
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).send({
      success: true,
      data: {
        token,
        user: userObj,
      },
      message: "User logged in successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.get("/get-logged-in-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId }).select("-password");
    res.status(200).send({
      success: true,
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
