const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://Test:Test@cluster0.xck0h.mongodb.net/ABC?retryWrites=true&w=majority';
const conn = mongoose.createConnection(mongoURI);
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    Date: {
        type: Date,
        default: Date.now
    }
});

const User = conn.model('User', UserSchema);

module.exports = User;