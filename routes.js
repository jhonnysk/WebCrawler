// var switchInfo = require('./models/empSwitchSchema').switchInfo;
var ImageSchema = require('./models/myImgSchema').ImageSchema;
var mongoose=require('mongoose');
const fs = require('fs');

var dataBase;

module.exports = function(express, app,upload,dataBase) {

    function dbStart(){
     dataBase=mongoose.connect('mongodb://localhost:27017/my_img_info');
    }
  function dbDisconnect(){
    dataBase.disconnect();
  }
    app.use(express.static(__dirname + '/public/'));
    var arrData=[{"title":"Android Internet Connection Using HTTP GET (HttpClient)","url":"http://hmkcode.com/android-internet-connection-using-http-get-httpclient/","categories":["Android"],"tags":["android","httpclient","internet"]},
    			{"title":" Android | Taking Photos with Android Camera ","url":"http://hmkcode.com/android-camera-taking-photos-camera/","categories":["Android"],"tags":["android","camera"]}];
     app.get('/api/getData', function(req, res) {
     	     res.send({
                articleList: arrData
            });
    });

    //  app.post('/api/postData', function(req, res) {
    //  	console.log(req.body);
    //  	     res.send('kjhkjhkjh');
    // });

    app.post('/api', function (req, res) {
      dbStart();
      upload(req, res, function (err) {
        // console.log(req.files);
        // console.log(req.body);
        if (err) {
          return res.end(err.toString());
        }
        var imgInfo = new ImageSchema();
        imgInfo.caption = req.body.data;
        imgInfo.img = 'http://127.0.0.1:3000/uploads/'+req.files[0].fieldname + '-' +req.files[0].originalname;
        imgInfo.save(function(err, data) {
             console.log(data);
            res.send(data);
            dbDisconnect();
        });

        
      });
    });

    app.get('/api/getImage',function(req,res){
    dbStart();     
      ImageSchema.find().exec(function(err, data) {
              res.send(data);
         dbDisconnect();
          });
    });

}


