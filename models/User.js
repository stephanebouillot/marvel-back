const mongoose = require("mongoose");
const { setFlagsFromString } = require("v8");

//  modele du fichier authentification
const Authentification = mongoose.model("User", {
  email: {
    type: String,
    unique: true,
  },
  token: String,
  hash: String,
  salt: String,
  account: {
    username: {
      type: String,
      required: true,
    },
  },
  favoris: {
    comics: [
      {
        id: Number,
        name: String,
        description: String,
        thumbnail: {
          path: String,
          extension: String,
        },
      },
    ],
    characters: [
      {
        id: Number,
        name: String,
        description: String,
        thumbnail: {
          path: String,
          extension: String,
        },
      },
    ],
  },
});

// export du fichier
module.exports = Authentification;
