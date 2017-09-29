var mongoose = require('mongoose');

var switchInfo = mongoose.Schema({
    name: String,
    post:String,
    mobile: {type:String, default:"null"},
    ip: {type:String, default:"null"},
    switchNo:String,
    portNo:String
});

var switchInfo = mongoose.model('switchInfo', switchInfo);

var Models = {
    switchInfo:switchInfo
};
module.exports = Models;