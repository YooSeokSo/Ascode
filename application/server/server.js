var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');
var Fabric_Client =require('fabric-client');
var path =require('path');
var util = require('util');
var os =require('os');
const { dirname } = require('path');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var app = express();

require('./controller.js')(app);

app.use(express.static(path.join(_/dirname, '../client')));

var port = pocess.env.PORT || 8000;

app.listen(pory,function(){
    console.log("Live in port: " + port);
});