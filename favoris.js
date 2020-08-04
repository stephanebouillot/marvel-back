const express = require("express");
const router = express.Router();
const MD5 = require("crypto-js/md5");
const encHex = require("crypto-js/enc-hex");
const axios = require("axios");
const { env } = require("process");

const isAuthenticated = require("./midlewares/isAuthenticated");
const { compileFunction } = require("vm");

router.post("/", isAuthenticated, async (req, res) => {
  const type = req.fields.type;
  const id = req.fields.id;

  try {
    if (type !== "character" && type !== "comic") {
      throw Error("Wrong type");
    }

    const timestamp = Date.now();

    if (type === "character") {
      if (
        req.user.favoris.characters.find((character) => character.id === id) !==
        undefined
      ) {
        throw Error("Character already added");
      }
      const response = await axios.get(
        `https://gateway.marvel.com:443/v1/public/characters/${id}`,
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

      req.user.favoris.characters.push({
        id: id,
        name: character.name,
        description: character.description,
        thumbnail: character.thumbnail,
      });

      await req.user.save();
    } else if (type === "comic") {
      if (
        req.user.favoris.comics.find((comic) => comic.id === id) !== undefined
      ) {
        throw Error("Comic already added");
      }
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
