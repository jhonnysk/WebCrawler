// var switchInfo = require('./models/empSwitchSchema').switchInfo;
var ImageSchema = require('./models/myImgSchema').ImageSchema;
var mongoose=require('mongoose');
const fs = require('fs');
var Crawler = require("js-crawler");

var dataBase;

module.exports = function(express, app,upload) {

    function dbStart(){
     dataBase=mongoose.connect('mongodb://localhost:27017/my_img_info');
    }
  function dbDisconnect(){
    dataBase.disconnect();
  }
    app.use(express.static(__dirname + '/public/'));
    // var arrData=[{"title":"Android Internet Connection Using HTTP GET (HttpClient)","url":"http://hmkcode.com/android-internet-connection-using-http-get-httpclient/","categories":["Android"],"tags":["android","httpclient","internet"]},
    // 			{"title":" Android | Taking Photos with Android Camera ","url":"http://hmkcode.com/android-camera-taking-photos-camera/","categories":["Android"],"tags":["android","camera"]}];

    var arrData=[
        {id:1,text:"Dhaka"},
        {id:2,text:"Chittagong"},
        {id:3,text:"Barisal"},
        {id:4,text:"Shylet"},
        {id:5,text:"Mymensing"},
        {id:6,text:"Khulna"},
        {id:7,text:"Rajshahi"},
        {id:8,text:"Rangpur"}
    ];
    

     app.get('/api/getData/:id', function(req, res) {
      console.log()
      var url1="https://www.cricbuzz.com/cricket-match/live-scores";
      var url3="https://www.bioscopelive.com/en/channel/independent-tv";

      var mnsf="https://www.dsebd.org/displayCompany.php?name=MONNOSTAF";
      var batbc="https://www.dsebd.org/displayCompany.php?name=BATBC";
      var kq="https://www.dsebd.org/displayCompany.php?name=KAY&QUE";
      var watacem="https://www.dsebd.org/displayCompany.php?name=WATACHEM";
      var STYLECRAFT="https://www.dsebd.org/displayCompany.php?name=STYLECRAFT";
      var top20="https://www.dsebd.org/top_20_share.php";
      var mainUrl="";
      
      if(req.params.id=="mnsf"){
        mainUrl=mnsf;
      }
      else if(req.params.id==2){
         mainUrl=url3;
      }
      else if(req.params.id=="batbc"){
         mainUrl=batbc;
      }
      else if(req.params.id=="kq"){
         mainUrl=kq;
      }
      else if(req.params.id=="watacem"){
         mainUrl=watacem;
      }
      else if(req.params.id=="STYLECRAFT"){
         mainUrl=STYLECRAFT;
      }      
      else if(req.params.id=="top20"){
         mainUrl=top20;
      }      
        
        new Crawler().configure({ignoreRelative: false,depth: 1})
          .crawl(mainUrl, function onSuccess(page) {
            // console.log(page.url);
           res.send({
                articleList: page.content
            });            
          });      

    });

    //  app.post('/api/postData', function(req, res) {
    //  	console.log(req.body);
    //  	     res.send('kjhkjhkjh');
    // });

    app.get('/api/getImage',function(req,res){
    dbStart();     
      ImageSchema.find().exec(function(err, data) {
              res.send(data);
         dbDisconnect();
          });
    });

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

    app.post('/api/deleteImage', function (req, res) {
      console.log(req.body.imgObj.imgId+'   :'+req.body.imgObj.imgSrc);
      // res.send('asdasd');
      dbStart();
      ImageSchema.remove({
            _id: req.body.imgObj.imgId
        }, function(err, data) {

            if(fs.existsSync(__dirname+"/public"+req.body.imgObj.imgSrc)) {
                    fs.unlinkSync(__dirname+"/public"+req.body.imgObj.imgSrc);
                }
            dbDisconnect();    
            res.send({
                Delete: true
            });
        });
    });    

    app.post('/api/post123',function(req,res){
      console.log(req.body.obj.name);
      res.send(JSON.stringify("holaa"));
    });

}


