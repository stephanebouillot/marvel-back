const express = require("express");
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");

("use strict");

router.post("/signUp", async (req, res) => {
  try {
    const signUpmail = req.fields.email;
    const signUpname = req.fields.username;

    const signUppassword = req.fields.password;
    const signUpconfirmpassword = req.fields.confirmpassword;

    if (signUpconfirmpassword !== signUppassword) {
      throw Error("passwords don't match");
    }

    if (signUpmail === undefined || signUpmail === null) {
      throw Error("please enter an email");
    }

    const existingMail = await User.findOne({
      email: signUpmail,
    });

    if (existingMail !== null) {
      throw Error("email already exists");
    }
    if (signUpname === undefined || signUpname === null) {
      throw Error("please enter an username");
    }

    const salt = uid2(16);
    const hash = SHA256(signUppassword + salt).toString(encBase64);
    const token = uid2(16);

    // Création d'un nouveau document
    const newUser = new User({
      email: signUpmail,
      salt: salt,
      hash: hash,
      token: token,
      account: {
        username: signUpname,
        password: signUppassword,
      },
    });

    // Sauvegarder en BDD
    // Serveur va faire une requête à la BDD
    await newUser.save();
    res.status(200).json({
      token: token,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        message: error.message,
      },
    });
  }
});

module.exports = router;
