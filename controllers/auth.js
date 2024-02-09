const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.registerUser = async (req, res) => {
  const { email, password, cPassword, name } = req.body;


  try {
    if (
      email === "" ||
      password === "" ||
      (name === "" && password === cPassword && password.length >= 4)
    )
      return res.status(400).json({ message: "Invalid field!" });

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({ message: "User already exist!" });

    let hashedPassword;
    if (password === cPassword) {
      hashedPassword = await bcrypt.hash(password, 12);
    } else {
      return res
        .status(400)
        .json({
          message: "please make sure the confirm password matches the password",
        });
    }

    const result = await User.create({ email, password: hashedPassword, name });

    res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "")
    return res.status(400).json({ message: "Invalid field!" });
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser)
      return res.status(404).json({ message: "User don't exist!" });

    const isPasswordOk = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordOk)
      return res.status(400).json({ message: "Invalid credintials!" });

    const token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser._id,
      },
      process.env.SECRET_KEY,
      { expiresIn: "48h" }
    );

    res.status(200).json({ existingUser, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
};


exports.getUser = async (req, res, next) => {
    try {
      const user = await User.findById(req.query.userId);
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ user });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };
  