const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// handle errors
const handleErrors = (err) => {
  // console.log(err.message, err.code);
  let errors = {
    email: "",
    password: "",
  };

  if (err.message === "incorrect email") {
    errors.email = "email is not registered";
  }

  if (err.message === "incorrect password") {
    errors.password = "the password is incorrect";
  }

  if (err.code === 11000) {
    errors.email = "User is already registered";
    return errors;
  }

  if (err.message.includes("user validation failed:")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// create jwt token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWTSECRETKEY, {
    expiresIn: maxAge,
  });
};

exports.signup_get = async (req, res) => {
  res.render("Signup");
};

exports.login_get = async (req, res) => {
  res.render("Login");
};

exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const newUser = await User.create({ email, password });

    const token = createToken(newUser._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });

    res.status(201).json({
      status: "success",
      data: newUser._id,
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({
      status: "fail",
      message: errors,
    });
  }
};

exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });

    res.status(200).json({
      status: "success",
      data: user._id,
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({
      status: "fail",
      message: errors,
    });
  }
};

exports.logout_get = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
