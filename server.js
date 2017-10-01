var express=require('express');
var app=express();
var server=require('http').createServer(app);
var morgan=require('morgan');


var multer  =   require('multer');

var mongoose=require('mongoose');


var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');


var multipartMiddleware = multipart();

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
  	// console.log('fileeeeeeeeeee: '+JSON.stringify(file));
    callback(null, file.fieldname + '-' +file.originalname);
  }
});

var upload = multer({ storage : storage}).any();
mongoose.connect('mongodb://localhost:27017/my_img_info');
app.use(morgan('dev'));



app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  next();
});




// **********************ngf-upload**********************
// app.use(bodyParser.json({limit: '50mb'})); 
// app.use(bodyParser.urlencoded({ limit: '50mb',extended: true })); 
// **********************ngf-upload**********************

require('./routes')(express,app,upload);



server.listen(3000);
var date = new Date();
date.setDate(date.getDate());

console.log('Server Connected at 3000 on: ' +new Date(date).toISOString().split('T')[0]+' '+date.getHours()+':'+date.getMinutes());













