const express = require("express");
const router = express.Router();
const MD5 = require("crypto-js/md5");
const encHex = require("crypto-js/enc-hex");
const axios = require("axios");
const { env } = require("process");

router.get("/", async (req, res) => {
  try {
    const timestamp = Date.now();

    const response = await axios.get(
      "https://gateway.marvel.com:443/v1/public/comics",
      {
        params: {
          apikey: process.env.API_KEY,
          ts: timestamp,
          hash: MD5(
            timestamp + process.env.API_SECRET + process.env.API_KEY
          ).toString(encHex),
          limit: req.query.limit,
          offset: req.query.offset,
          orderBy: "title",
          titleStartsWith: req.query.search,
        },
      }
    );

    const comics = response.data.data.results.map((comic) => ({
      id: comic.id,
      title: comic.title,
      description: comic.description,
      thumbnail: comic.thumbnail,
    }));

    res.json({
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
