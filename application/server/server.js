var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');
var mongoose = require('mongoose');
var path =require('path');
var util = require('util');
var os = require('os');
const { dirname } = require('path');

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

require('./controller.js')(app);
var connection= mongoose.connect('mongodb+srv://testuser:yhw1408@cluster0.ywkaq.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB connected...'))
.catch(error => console.log(error))
app.use("/",express.static(path.join(__dirname, '../client')));

var port = process.env.PORT || 8000;

app.listen(port,function(){
    console.log("Live in port: " + port);
});