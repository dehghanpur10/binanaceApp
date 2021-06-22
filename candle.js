const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Candle = new Schema({
    price: {
        type: String,
        required: true
    },
    date: {
        type: String,
        require: true
    },

}, {timestamps: true});
module.exports = mongoose.model('Candle', Candle);
