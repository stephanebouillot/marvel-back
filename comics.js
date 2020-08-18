const express = require("express");
const router = express.Router();
const MD5 = require("crypto-js/md5");
const encHex = require("crypto-js/enc-hex");
const axios = require("axios");
const { env } = require("process");

// creation d une route get pour recuperer les comics sur la bdd marvel
router.get("/", async (req, res) => {
  try {
    const timestamp = Date.now();

    const response = await axios.get(
      "https://gateway.marvel.com:443/v1/public/comics",
      {
        // parametre de connexion a la bdd de marvel
        params: {
          apikey: process.env.API_KEY,
          ts: timestamp,
          hash: MD5(
            timestamp + process.env.API_SECRET + process.env.API_KEY
          ).toString(encHex),

          limit: req.query.limit,
          offset: req.query.offset,
          // affichage des resutats par order alphabetique
          orderBy: "title",
          // props search gerer par la bdd marvel
          titleStartsWith: req.query.search,
        },
      }
    );
    // boucle sur les resultats envoyes par la bdd pour les comics
    const comics = response.data.data.results.map((comic) => ({
      id: comic.id,
      title: comic.title,
      description: comic.description,
      thumbnail: comic.thumbnail,
    }));

    res.json({
      // nombre de resultat envoyes par la bdd marvel
      count: response.data.data.total,
      comics: comics,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Error",
    });
  }
});

module.exports = router;
