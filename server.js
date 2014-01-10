var express = require('express');

var http = require('http');
var path = require('path');
var app = express();

app.configure(function() {
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.bodyParser());
    app.use(express.logger("short"));
});
 



app.get('/', function (req, res) {
    res.sendfile('./index.html');
});

app.listen(3000);
