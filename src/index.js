require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const Game = require("./schemas/gameSchema");

async function synchronizeBggGames() {
  console.log("STARTED!");
  console.log("Connecting to Mongo...");
  const DB_PASSWORD = encodeURIComponent(`${process.env.DB_PASSWORD}`);
  await mongoose
    .connect(
      `mongodb://${process.env.DB_USERNAME}:${DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/strapicheyenne?authSource=${process.env.AUTHENTICATION_DATABASE}`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then((result) => {
      console.log("Succesfully connected to MongoDB!");
    })
    .catch((err) => {
      console.log(
        "Oops, something went wrong, this is the error log ==> " + err
      );
    });
  console.log("Counting your games...");
  let gameList = undefined;
  await axios
    .get(`http://localhost:57492/collection/${process.env.BGG_USER}`)
    .then((result) => {
      gameList = result.data;
    })
    .catch((err) => {
      console.log(
        "\x1b[41m" +
          "Whoops, something went wrong: " +
          err.request.res.statusCode +
          " " +
          err.request.res.statusMessage +
          "\x1b[0m"
      );
    });
  console.log(`You have ${gameList.length} games!`);
  for (let gameItem of gameList) {
    let result = await Game.findOne({ gameId: gameItem.gameId });
    if (!result) {
      await axios
        .get(`http://localhost:57492/thing/${gameItem.gameId}`)
        .then(async (result) => {
          let game = await new Game({
            gameId: gameItem.gameId,
            name: gameItem.name,
            image: gameItem.image,
            thumbnail: gameItem.thumbnail,
            minPlayers: gameItem.minPlayers,
            maxPlayers: gameItem.maxPlayers,
            isExpansion: gameItem.isExpansion,
            yearPublished: gameItem.yearPublished,
            bggRating: result.data.bggRating,
            description: result.data.description,
            playingTime: result.data.playingTime,
            mechanics: result.data.mechanics,
            designers: result.data.designers,
            publishers: result.data.publishers,
            artists: result.data.artists,
          });
          console.log("Saving this awesome game =>", gameItem.name);
          await game.save();
        })
        .catch((err) => {
          console.log(
            "\x1b[41m" + "Whoops, something went wrong: " + err + "\x1b[0m"
          );
          console.log(
            `Error info: id => ${gameItem.gameId} | name => ${gameItem.name}`
          );
        });
      await sleep(5000);
    } else {
      console.log("Skipping this game: " + gameItem.name);
      await sleep(10);
    }
  }
  process.exit();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

synchronizeBggGames();
