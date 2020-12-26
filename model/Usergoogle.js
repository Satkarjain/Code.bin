const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://Test:Test@cluster0.xck0h.mongodb.net/ABC?retryWrites=true&w=majority';
const conn = mongoose.createConnection(mongoURI);

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

const Usergoogle = conn.model('Usergoogle', UserSchema);

module.exports = Usergoogle;