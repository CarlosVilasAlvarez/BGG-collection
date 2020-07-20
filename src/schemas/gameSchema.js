const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameId: Number,
    name: String,
    image: String,
    thumbnail: String,
    minPlayers: Number,
    maxPlayers: Number,
    isExpansion: Boolean,
    yearPublished: Number,
    bggRating: Number,
    description: String,
    playingTime: Number,
    mechanics: [String],
    designers: [String],
    publishers: [String],
    artists: [String],
});

const Game = mongoose.model('Games', gameSchema, 'Games');
module.exports = Game;