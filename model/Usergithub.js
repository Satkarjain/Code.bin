const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://Test:Test@cluster0.xck0h.mongodb.net/ABC?retryWrites=true&w=majority';
const conn = mongoose.createConnection(mongoURI);

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

const Usergithub = conn.model('Usergithub', UserSchema);

module.exports = Usergithub;