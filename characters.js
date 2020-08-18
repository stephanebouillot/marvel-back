const express = require("express");
const router = express.Router();
const MD5 = require("crypto-js/md5");
const encHex = require("crypto-js/enc-hex");

const axios = require("axios");
const { env } = require("process");

// / creation d une route get pour recuperer les characters sur la bdd marvel
router.get("/", async (req, res) => {
  try {
    const timestamp = Date.now();

    const response = await axios.get(
      "https://gateway.marvel.com:443/v1/public/characters",
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
          orderBy: "name",
          // props search gerer par la bdd marvel
          nameStartsWith: req.query.search,
        },
      }
    );
    // boucle sur les resultats envoyes par la bdd pour les characters
    const characters = response.data.data.results.map((character) => ({
      id: character.id,
      name: character.name,
      description: character.description,
      thumbnail: character.thumbnail,
    }));

    res.json({
      // nombre de resultat envoyes par la bdd marvel
      count: response.data.data.total,
      characters: characters,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Error",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const timestamp = Date.now();

    const response = await axios.get(
      `https://gateway.marvel.com:443/v1/public/characters/${req.params.id}`,
      {
        params: {
          apikey: process.env.API_KEY,
          ts: timestamp,
          hash: MD5(
            timestamp + process.env.API_SECRET + process.env.API_KEY
          ).toString(encHex),
        },
      }
    );

    const responsecomics = await axios.get(
      `https://gateway.marvel.com:443/v1/public/characters/${req.params.id}/comics`,
      {
        params: {
          apikey: process.env.API_KEY,
          ts: timestamp,
          hash: MD5(
            timestamp + process.env.API_SECRET + process.env.API_KEY
          ).toString(encHex),
        },
      }
    );

    const character = response.data.data.results[0];

    res.json({
      id: character.id,
      name: character.name,
      description: character.description,
      thumbnail: character.thumbnail,
      comics: responsecomics.data.data.results,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Error",
    });
  }
});

module.exports = router;
