require("dotenv").config();
const express = require("express");
const cors = require("cors");
const formidable = require("express-formidable");
const mongoose = require("mongoose");

const app = express();

const characters = require("./characters");
const comics = require("./comics");
const favoris = require("./favoris");
const signUp = require("./routes/signUp");
const connexion = require("./routes/connexion");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.use(cors());
app.use(formidable());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/characters", characters);
app.use("/comics", comics);
app.use("/favoris", favoris);
app.use(signUp);
app.use(connexion);

app.listen(process.env.PORT || 3200, () => {
  console.log("Server started");
});
