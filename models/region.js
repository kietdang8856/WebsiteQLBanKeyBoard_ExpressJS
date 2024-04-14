const mongoose = require('mongoose');

const region = new mongoose.Schema({
    Id: String,
    Name: String,
    Districts: Array
},{ versionKey: null });

module.exports = mongoose.model('regions', region);
