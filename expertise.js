const mongoose = require('mongoose');

const expertise = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    users:  {
        type: [ String ]
    }
});

module.exports = mongoose.model('Expertise', expertise);