const express = require("express");
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");

router.post("/connexion", async (req, res) => {
  try {
    const signUpmail = req.fields.email;
    const signUppassword = req.fields.password;

    if (signUpmail === undefined || signUpmail === null) {
      throw Error("please enter an email");
    }
    if (signUppassword === undefined || signUppassword === null) {
      throw Error("please enter an password");
    }

    const account = await User.findOne({
      email: signUpmail,
    });

    if (account === null) {
      throw Error("email doesn't exist");
    }

    // const salt = uid2(16);
    const newhash = SHA256(signUppassword + account.salt).toString(encBase64);
    const token = uid2(16);

    if (newhash === account.hash) {
      account.token = token;
      await account.save();
      res.status(200).json({
        token: token,
      });
    }

    if (newhash !== account.hash) {
      throw Error("bad password");
    }
  } catch (error) {
    res.status(400).json({
      error: {
        message: error.message,
      },
    });
  }
});

module.exports = router;
