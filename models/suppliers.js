const mongoose = require('mongoose');

const supplier = new mongoose.Schema({
    supplierName: String,
    status: Boolean
},{ versionKey: null });

module.exports = mongoose.model('suppliers', supplier);