const mongoose = require('mongoose');

const product = new mongoose.Schema({
    productName: String,
    description: Object,
    discount: Object,
    rating: Object
},{ versionKey: null });

module.exports = mongoose.model('products', product);
