var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;


var codeSchema = new Schema({
        url: { type: String},
        uploader: {type: String},
        time:  { type: String },
        Country: {type: String},
        os: {type: String},
        walletid: {type: String}
});
module.exports = mongoose.model('Code', codeSchema);