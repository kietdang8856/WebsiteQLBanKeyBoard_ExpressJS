const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../configs/config'); // Import config file

const customerSchema = new mongoose.Schema({
    listProduct: Array,
    listFavorite: Array,
    fullNameCustomer: Object,
    dateOfBirth: String,
    sex: String,
    identityCardNumber: String,
    address: String,
    phoneNumber: String,
    email: String,
    loginInformation: {
        userName: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        type: {
            type: String,
            default: 'Customer'
        }
    },
    avatar: String
}, { versionKey: null });

// Middleware to hash password before saving to database
customerSchema.pre('save', async function(next) {
    const customer = this;

    // Check if password is modified or new
    if (customer.isModified('loginInformation.password')) {
        const salt = await bcrypt.genSalt(10);
        customer.loginInformation.password = await bcrypt.hash(customer.loginInformation.password, salt);
    }

    next();
});

// Method to generate JWT token
customerSchema.methods.generateAuthToken = function() {
    const customer = this;
    const token = jwt.sign({ customerId: customer._id }, config.JWT_SECRET, { expiresIn: config.JWT_EXP });
    return token;
};

// Method to compare password during login
customerSchema.methods.comparePassword = async function(candidatePassword) {
    const customer = this;
    return await bcrypt.compare(candidatePassword, customer.loginInformation.password);
};

module.exports = mongoose.model('customers', customerSchema);
