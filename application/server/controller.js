var sdk  = require('./sdk.js');
var Book = require('./models/book');
const { request } = require('http');
const { time } = require('console');
module.exports = function(app){
    app.get('/api/getWallet', function(req,res){
        var walletid = req.query.walletid;
        let args = [walletid];
        sdk.send(false,'getWallet', args, res);
    });
    app.get('/api/setWallet',function(req,res){
        var id = req.query.id;
        let args = [id];
        sdk.send(true,'setWallet', args, res);
    });
    app.get('/api/getAllCode', function(req, res){
        var codekey = req.query.codekey;
        let args = [];
        sdk.send(false,'getAllCode', args, res);
    });
    app.get('/api/addCode',function(req, res){
        var url= req.query.url;
        var uploader=req.query.uploader;
        var time = req.query.time;
        var country = req.query.country;
        var os = req.query.os;
        var walletid = req.query.walletid
        let args =[ url,uploader,time,country,os, walletid];
        sdk.send(true,'addCode',args, res);
    });
    app.get('/api/addCoin',function(req,res){
        var walletid = req.query.walletid;
        var coin = req.query.coin;
        let args = [walletid, coin];
        sdk.send(true, 'addCoin',args.res);
    });
    app.get('/api/books', function(req,res){
        Book.find(function(err, books){
            if(err) return res.status(500).send({error: 'database failure'});
            res.json(books);
        });
    });
    app.post('/api/books', function(req, res){
        var book = new Book();
        console.dir(req.body.title);
        book.title = req.body.title;
        book.author = req.body.a;
        book.published_date = "2020-12-12";
    
        book.save(function(err){
            if(err){
                console.error(err);
                res.json({result: 0});
                return;
            }
    
            res.json({result: 1});
    
        });
    });   
};