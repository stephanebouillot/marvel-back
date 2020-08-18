const express = require("express");
const router = express.Router();
const MD5 = require("crypto-js/md5");
const encHex = require("crypto-js/enc-hex");
const axios = require("axios");
const { env } = require("process");

// variable de verification de l enregistrement du user
const isAuthenticated = require("./midlewares/isAuthenticated");
const { compileFunction } = require("vm");

// declaration de la route post qui va ajouter un favori en bdd
router.post("/", isAuthenticated, async (req, res) => {
  // variables precisant le type et l id emvoyes dans les champs concernes du front
  const type = req.fields.type;
  const id = req.fields.id;

  try {
    // verification des types et envoi des messages d erreurs
    if (type !== "character" && type !== "comic") {
      throw Error("Wrong type");
    }
    // variable de temps pour l'authentification
    const timestamp = Date.now();
    // si le type est charactere
    if (type === "character") {
      if (
        // si le favoris existe deja on envoie message erreur
        // on envoie une requete dans les favoris characters en cherchant le caractere et si l id du chacracter demade
        // existe deja envoi message erreur
        req.user.favoris.characters.find((character) => character.id === id) !==
        undefined
      ) {
        throw Error("Character already added");
      }

      // envoi d un get dans la base donnee marvel demandant le characetere en fonction de l id du charactere
      const response = await axios.get(
        `https://gateway.marvel.com:443/v1/public/characters/${id}`,
        {
          // authentification a la base de donnee
          params: {
            apikey: process.env.API_KEY,
            ts: timestamp,
            hash: MD5(
              timestamp + process.env.API_SECRET + process.env.API_KEY
            ).toString(encHex),
          },
        }
      );
      // variable des resultats de la recherche
      const character = response.data.data.results[0];
      // on envoie dans la base de donnees le resultat de la recherche
      req.user.favoris.characters.push({
        id: id,
        name: character.name,
        description: character.description,
        thumbnail: character.thumbnail,
      });
      // et enregistrement de l utilisateur apres ajout du favori
      await req.user.save();
      // si le type est comic
    } else if (type === "comic") {
      if (
        req.user.favoris.comics.find((comic) => comic.id === id) !== undefined
      ) {
        throw Error("Comic already added");
      }

      // idem que requete pour characteres
      const response = await axios.get(
        `https://gateway.marvel.com:443/v1/public/comics/${id}`,
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

      const comic = response.data.data.results[0];

      req.user.favoris.comics.push({
        id: id,
        title: comic.title,
        description: comic.description,
        thumbnail: comic.thumbnail,
      });
      await req.user.save();
    }

    res.json({
      message: "ok",
    });
  } catch (error) {
    res.status(400).json({
      error: {
        message: error.message,
      },
    });
  }
});

// idem requete que les deux precedentes mais on delete plutot que enregistre dans la bdd
router.delete("/", isAuthenticated, async (req, res) => {
  const type = req.fields.type;
  const id = req.fields.id;

  try {
    if (type !== "character" && type !== "comic") {
      throw Error("Wrong type");
    }

    if (type === "character") {
      const character = req.user.favoris.characters.find(
        (character) => character.id === id
      );
      if (character === undefined) {
        throw Error("Character not found");
      }
      const index = req.user.favoris.characters.indexOf(character);
      req.user.favoris.characters.splice(index, 1);
      await req.user.save();
    } else if (type === "comic") {
      const comic = req.user.favoris.comics.find((comic) => comic.id === id);
      if (comic === undefined) {
        throw Error("Comic not found");
      }
      const index = req.user.favoris.comics.indexOf(comic);

      req.user.favoris.comics.splice(index, 1);
      await req.user.save();
    }

    res.json({
      message: "ok",
    });
  } catch (error) {
    res.status(400).json({
      error: {
        message: error.message,
      },
    });
  }
});

router.get("/", isAuthenticated, async (req, res) => {
  const type = req.query.type;
  const limit = !req.query.limit ? 20 : req.query.limit;
  const offset = !req.query.offset ? 0 : req.query.offset;

  try {
    if (type !== "character" && type !== "comic") {
      throw Error("Wrong type");
    }

    let count = 0;
    let favoris = [];

    if (type === "character") {
      count = req.user.favoris.characters.length;
      favoris = req.user.favoris.characters.slice(offset, offset + limit);
    } else if (type === "comic") {
      count = req.user.favoris.comics.length;
      favoris = req.user.favoris.comics.slice(offset, offset + limit);
    }
    res.json({
      count: count,
      favoris: favoris,
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
