var sdk  = require('./sdk.js');
var Code = require('./models/code');
var User = require('./models/user');
var Comment = require('./models/comment');
// var Article = require('./models/article');
// var Comment = require('./models/comment');
const { request } = require('http');
const { time, log } = require('console');
const { url } = require('inspector');
const comment = require('./models/comment');
module.exports = function(app){

    app.get('/api/getWallet', function(req,res){
        var walletid = req.query.walletid;
        let args = [walletid];
        sdk.send(false,'getWallet', args, res);
    });
    app.get('/api/setWallet',function(req,res){
        var user = new User();
        user.collection.insertOne(req.query,onInsert);
        function onInsert(err, docs) {
            if (err) {
                // TODO: handle error
            } else {
                console.info('%d user were successfully stored.', docs.length);
            }
        }
        var name = req.query.name;
        var id = req.query.id;
        let args = [name, id];
        sdk.send(true,'setWallet', args, res);
    });
    // app.get('/api/getAllCode', function(req, res){
    //     let args = [];
    //     sdk.send(false,'getAllCode', args, res);
    // });
    app.get('/api/getAllCode', function(req, res){
        Code.find(function(err, codes){
            if(err) return res.status(500).send({error: 'database failure'});
            res.json(codes);
        });
    });
    app.get('/api/addUser', function(req, res){
        Code.find(function(err, codes){
            if(err) return res.status(500).send({error: 'database failure'});
            res.json(codes);
        });
    });
    app.get('/api/addCode',function(req, res){
        var book = new Code();
        book.collection.insertOne(req.query,onInsert);
        function onInsert(err, docs) {
            if (err) {
                // TODO: handle error
            } else {
                console.info('%d code were successfully stored.', docs.length);
            }
        }
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
    app.get('/api/findcode', function(req,res){
        Code.find({ url : req.query.url}, function(err, codes){
            if(err) return res.status(500).send({error: 'database failure'});
            res.json(codes);
        });
    });
    app.get('/api/addComment', function(req,res){
        var comment = new Comment();
        comment.comment = req.query.comment;
        comment.level = req.query.level;
        comment.commenter = req.query.commenter;
        comment.id = req.query.id

        comment.save(function(err){
            if(err){
                console.error(err);
                res.json({result: 0});
                return;
            }
            res.json({result: 1});
        });

    });
    app.get('/api/getComment', function(req,res){
        Comment.find({ id : req.query.id}, function(err, comments){
            if(err) return res.status(500).send({error: 'database failure'});
            res.json(comments);
        });
    });
    app.post('/api/books', function(req, res){
        var book = new Code();
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
    app.get('/api/codes',function(req,res){
        Code.find(function(err,codes){
            if(err) return res.status(500).send({error:'database failure'});
            res.json(codes);
        })
    })
}