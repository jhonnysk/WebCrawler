
var mongoose = require('mongoose');

var ImageSchema = mongoose.Schema({
    
    caption: String,
    img:String,
    
});

var ImageSchema = mongoose.model('ImageSchema', ImageSchema);
var Models = {
    ImageSchema:ImageSchema,
};
module.exports = Models;