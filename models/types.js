const mongoose = require('mongoose');

const type = new mongoose.Schema({
    typeName: String,
    thumbnail: String,
    status: Boolean
},{ versionKey: null });

module.exports = mongoose.model('types', type);