// var switchInfo = require('./models/empSwitchSchema').switchInfo;

// const testFolder = './uploads';
const fs = require('fs');
module.exports = function(express, app,upload) {

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
      upload(req, res, function (err) {
        console.log(req.files);
        console.log(req.body);
        if (err) {
          return res.end(err.toString());
        }
     
        res.send('File is uploaded');
      });
    });

    app.get('/api/getImage',function(req,res){
        /////////////////////
        var dir=__dirname + '/public/uploads';
        var arr=[];
        fs.readdir(dir,function(err, files){
           if (err) {
              return console.error(err);
           }
           files.forEach( function (file){
              console.log( file );
              arr.push('http://127.0.0.1:3000/uploads/'+file);
           });
           res.send(arr);
        });        
        //////////////////////
    });

}
