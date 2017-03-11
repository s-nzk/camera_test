var http = require('http');
var path = require('path');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var fs = require('fs');

var express = require('express');

var router = express();
var server = http.createServer(router);

router.use(fileUpload());
router.use(bodyParser());

router.use(express.static(path.resolve(__dirname, 'dist')));
var messages = [];
var sockets = [];

router.post('/image', function(req, res){
  console.log(req.body);
  res.status(200).send('OK');
});

router.get('/imagelist', function(req, res){
  
  fs.readdir(__dirname + '/dist/static/uploads/', function(err, list){
    if(err){
      res.status(404).send('NG');
    } else {
        console.log(list);
        if(list.length > 3){
            fs.unlink(__dirname + '/dist/static/uploads/' + list[0]);
            list = list.slice(1);
        }
        
     res.set('Access-Control-Allow-Origin','*');
     res.json(list.reverse());
    }
  })
});

router.post('/upload', function(req, res) {
   console.log('upload');
  console.log(req.body);
   if (!req.body.file){
     return res.status(400).send('No files were uploaded.');
   }
   var base64 = req.body.file.replace(/^.*,/, '');
   fs.writeFile(__dirname + '/dist/static/uploads/file' + new Date().getTime(), new Buffer(base64,'base64'));
   res.set('Access-Control-Allow-Origin','*');
   res.status(200).send('OK');
});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
