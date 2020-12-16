var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    commenter:{
        type: String
    },
    comment:{
        type: String
    },
    level:{
        type: String
    },
    id:{
        type: String
    }

});

module.exports = mongoose.model('Comment', commentSchema);