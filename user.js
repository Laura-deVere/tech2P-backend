const mongoose = require('mongoose');

const user = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: false
    },
    website: String,
    linkedIn: String,
    summary:  {
        type: String,
        required: true
    },
    expertise:  {
        type: [ 
            {
                _id: String,
                name: String
            }
         ],
        required: true
    }
});

module.exports = mongoose.model('User', user);