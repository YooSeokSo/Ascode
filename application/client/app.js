'use strict';
var app = angular.module('application', ['ngRoute']);
app.controller('AppCtrl', function($scope, appFactory){
        $("#success_getwallet").hide();
        $("#success_getwallet1").hide();
        $("#success_setmusic").hide();
        $("#success_getallcode").hide();
        $("#success_changemusicprice").hide();
        $("#success_create").hide();
        $("#success_getcomment").hide();
        $("#success_getdetail").hide();

        $scope.showSearch = function(){
                $("#success_getwallet1").hide();
                $("#success_create").hide();
                $("#success_searchcode").show();

        }
        $scope.showWallet = function(){
                $("#success_getwallet1").show();
                $("#success_getallcode").hide();
                $("#success_searchcode").hide();
                $("#success_create").hide();
                $("#success_getcomment").hide();
                $("#success_getdetail").hide();
                       
        }
        $scope.showAdd = function(){
                $("#success_create").show();
                $("#success_getallcode").hide();
                $("#success_searchcode").hide();
                $("#success_getwallet1").hide();
                $("#success_getcomment").hide();
                $("#success_getdetail").hide();
        }
        $scope.getWallet = function(){
                appFactory.getWallet($scope.walletid, function(data){
                        $scope.search_wallet = data;
                        $("#success_getwallet").show();
                });
        }
       $scope.getAllMusic = function(){
                appFactory.getAllMusic(function(data){
                        var array = [];
                        for (var i = 0; i < data.length; i++){
                                data[i].Key = $scope.url;
                                data[i].title = data[i].uploader;
                                data[i].singer = data[i].Singer;
                                data[i].price = data[i].Price;
                                data[i].walletid = data[i].walletid;
                                data[i].count = data[i].Count;
                                array.push(data[i]);
                        }
                        $scope.allMusic = array;
                        $("#success_getallcode").show();
                        $("#success_getcomment").hide();
                });
        }
        $scope.getMusic = function(){
                appFactory.getMusic($scope.url, function(data){
                        $("#success_getmusic").show();
                        var array = [];
                        for (var i = 0; i < data.length; i++){
                                data[i].Key = $scope.url;
                                data[i].title = data[i].uploader;
                                data[i].singer = data[i].Singer;
                                data[i].price = data[i].Price;
                                data[i].walletid = data[i].walletid;
                                data[i].count = data[i].Count;
                                array.push(data[i]);
                        }
                        $scope.allMusic = array;
                        $("#success_getallcode").show();
                });
        }
        $scope.getDetail = function(url){
                appFactory.getMusic(url, function(data){
                        $("#success_getdetail").show();
                        var array = [];
                        for (var i = 0; i < data.length; i++){
                                data[i].Key = url;
                                data[i].title = data[i].uploader;
                                data[i].singer = data[i].Singer;
                                data[i].price = data[i].Price;
                                data[i].walletid = data[i].walletid;
                                data[i].count = data[i].Count;
                                array.push(data[i]);
                        }
                        $scope.codeDetail = array;
                        $("#success_getcomment").show();
                });
        }
        $scope.setMusic = function(){
            appFactory.setMusic($scope.music, function(data){
                        $scope.create_music = data;
                        $("#success_setmusic").show();
            });
        }
        $scope.addComment = function(key){
                appFactory.addComment($scope.comment, function(data){
                            $scope.create_music = data;
                            $("#success_setmusic").show();
                });
            }
        $scope.getComment = function(_id){
                appFactory.getComment(_id, function(data){
                        var array = [];
                        for (var i = 0; i < data.length; i++){
                                data[i].comment = data[i].comment;
                                data[i].level = data[i].level;
                                data[i].commenter = data[i].commenter;
                                array.push(data[i]);
                        }
                        $scope.allComment = array;
                        $("#success_getcomment").show();
                });
        }
});
 app.factory('appFactory', function($http){
        var factory = {};
        factory.getWallet = function(key, callback){
            $http.get('/api/getWallet?walletid='+key).success(function(output){
                        callback(output)
                });
        }
        factory.getAllMusic = function(callback){
            $http.get('/api/getAllCode/').success(function(output){
                        callback(output)
                });
        }
        factory.getMusic = function(url, callback){
            $http.get('/api/findcode?url='+url).success(function(output){
                        callback(output)
                });
        }
        factory.setMusic = function(data, callback){
            $http.get('/api/addCode?url='+data.title+'&uploader='+data.singer+'&time='+data.price+'&country='+data.country+'&os='+data.os+'&walletid='+data.walletid).success(function(output){
                        callback(output)
                });
        }
        factory.addComment = function(data, callback){
                $http.get('/api/addComment?comment='+data.comment+'&level='+data.level+'&commenter='+data.commenter+'&id='+data.id).success(function(output){
                            callback(output)
                    });
            }
        factory.getComment = function(_id, callback){
            $http.get('/api/getComment?id='+_id).success(function(output){
                callback(output)
            });
        }
        factory.changeMusicPrice = function(data, callback){
            $http.get('/api/changeMusicPrice?musickey='+data.musickey+'&price='+data.price).success(function(output){
                        callback(output)
                });
        }
        factory.deleteMusic = function(key, callback){
            $http.get('/api/deleteMusic?musickey='+key).success(function(output){
                        callback(output)
                });
        }
        return factory;
});