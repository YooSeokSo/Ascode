var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commentSchema = require('./comment.js');

var userSchema = new Schema({
    ID:{
        type: String,
        required: true,
    },
    // PW:{
    //     type: String,
    //     required: true,
    // },
    Walletid:{
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('User', userSchema);