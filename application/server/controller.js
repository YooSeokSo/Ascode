var sdk  = require('./sdk.js');
module.exports = function(app){
    app.get('/api/getWallet', function(req,res){
        var walletid = req.query.walletid;
        let args = [walletid];
        sdk.send(false,'getWallet', args, res);
    });
    app.get('/api/setWallet',function(req,res){
        var name = req.query.name;
        var id = req.query.id;
        var coin = req.query.coin;
        let args = [name, id, coin];
        sdk.send(true,'setWallet', args, res);
    });
    app.get('/api/getMusic', function(req, res){
        var musickey = req.query.musickey;
        let args = [musickey];
        sdk.send(false,'getMusic', args, res);
    });
    app.get('/api/addCode',function(req, res){
        var title= req.query.title;
        var walletid = req.query.walletidl
        let args =[ title,walletid];
        sdk.send(true,'addCode',args, res);
    });
    app.get('/api/addCoin',function(req,res){
        var walletid = req.query.walletid;
        var coin = req.query.coin;
        let args = [walletid, coin];
        sdk.send(true, 'addCoin',args.res);
    });

}