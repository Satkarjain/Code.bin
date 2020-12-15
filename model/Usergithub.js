const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    id: {
        type: String,
        required: true
    },

    nodeId: {
        type: String,
        required: true
    },

    Date: {
        type: Date,
        default: Date.now
    }
});

const Usergithub = mongoose.model('Usergithub', UserSchema);

module.exports = Usergithub;