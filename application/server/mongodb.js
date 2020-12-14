var express = require('express'); //express는 기본적으로 쿠키의 기능을 가지고 있지 않다.//
var bodyParser = require('body-parser'); //POST방식//
var assert = require('assert'); //NULL 유효검증 모듈//
var async = require('async'); //비동기 순차처리를 위한 모듈//
//데이터베이스 관련 모듈//
//사용자 중요정보 - RDBMS 사용 / 다양하고 형식이 지정되지 않은 정보 - NoSQL//
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var app = express();
var url = 'mongodb://127.0.0.1:27017/test'; //Mongodb URL(IP:PORT/Database)//

//POST설정//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     //to support URL-encoded bodies (url-encoded방식)//
    extended: true
}));

//입력변수//
var name;
var age;
var address;
var search_condition_name; //검색 조건변수//
var update_condition_name; //수정 조건변수//
var update_age_value; //수정할 나이//
var remove_condition_name; //제거 조건변수//

app.post('/connect_mongodb', function(request, response){
    console.log('connect mongodb...');

    //몽고디비 연결//
    connect_mongodb(response);
});

app.post('/insert_mongodb', function(request, response){
    name = request.body.name; //전송할 메세지를 받는다.//
    age = request.body.age;
    address = request.body.address;

    console.log('name: ' + name + "/ age: " + age + "/ address: " + address);

    //몽고디비에 저장//
    insert_mongodb(name, age, address, response);

    //response.send('success...');
});

app.post('/find_mongodb', function(request, response){
    console.log('find mongodb');

    //몽고디비 컬렉션의 전체 document 조회//
    find_mongodb(response);
});

app.post('/search_mongodb', function(request, response){
    search_condition_name = request.body.search_name;

    console.log('search mongodb' + '[' + search_condition_name + ']');

    //몽고디비 조건절을 이용하여 특정 컬렉션의 document 조회//
    search_mongodb(search_condition_name, response);
});

app.post('/update_mongodb', function(request, response){
    update_condition_name = request.body.update_name;
    update_age_value = request.body.update_age;

    console.log('update mongodb' + '[' + update_condition_name + ']');

    //몽고디비 조건절을 이용하여 특정 컬렉션의 document 수정//
    update_mongodb(update_condition_name, update_age_value, response);
});

app.post('/remove_mongodb', function(request, response){
    remove_condition_name = request.body.remove_name;

    console.log('remove mongodb' + '[' + remove_condition_name + ']');

    //몽고디비 조건절을 이용하여 특정 컬렉션의 document 삭제//
    remove_mongodb(remove_condition_name, response);
});

app.get('/createindex_mongodb', function(request, response){
    //get - request.query.~ / post - request.body.~//
    console.log('create index name field');

    //컬렉션에서 검색조건으로 많이 사용되는 필드를 인덱스 추가. 보통에 인덱스의 생성은 컬렉션 생성 시 이루어진다.//
    //Index - 검색질의 수행능력 향상, B-Tree자료구조 사용.//
    createindex_mongodb(response);
});

app.get('/dropindex_mongodb', function(requeest, response){
    console.log('drop index name field');

    //컬렉션에서 기존 인덱스로 활용되는 필드를 제거.//
    dropindex_mongodb(response);
});

app.get('/getdoc_count_mongodb', function(request, response){
    console.log('get document count');

    //컬렉션의 문서들의 개수를 가져온다.//
    get_doc_count(response);
});

app.listen(3000, function(){
    console.log('Connected 3000 port')
    console.log('--------------------------');
});
//////////////////////////
function connect_mongodb(response)
{
    async.waterfall([
        //파일이 현재 저장소에 저장되어있는지 검사//
        function(callback) //첫 시작은 하나의 callback으로 시작한다.//
        {
            MongoClient.connect(url, function(err, db){
                assert.equal(null, err);

                console.log('Connected correctly to server');

                db.close(); //개방했으니 사용 후 닫아준다.//

                callback(null, 'connect mongodb'); //콜백호출//
            });
        }
    ],
    //Final Task : send
    function(callback, message)
    {
        response.send(message);

        console.log('--------------------------');
    });
}
//////////////////////////
function insert_mongodb(name, age, address, response)
{
    async.waterfall([
        //파일이 현재 저장소에 저장되어있는지 검사//
        function(callback) //첫 시작은 하나의 callback으로 시작한다.//
        {
            MongoClient.connect(url, function(err, db){
                assert.equal(null, err);

                //Connection으로 몽고디비 자원을 가지고 있는 db변수를 넘김//
                callback(null, db, name, age, address);
            });
        },
        //Task 2 : insert//
        function(db, name, age, address, callback)
        {
            db.collection('users')
            .insertOne( {
                "name": name,
                "age":age,
                "address":address
            }, function(err, result) {
                assert.equal(err, null);
                
                console.log("Inserted a document into the restaurants collection.");

                db.close(); //개방했으니 사용 후 닫아준다.//
                
                callback(null, 'insert succcess mongodb'); //콜백호출//
            });
        }
    ],
    //Final Task : send
    function(callback, message)
    {
        response.send(message);

        console.log('--------------------------');
    });
}
//////////////////////////////
function find_mongodb(response)
{
    async.waterfall([
        //파일이 현재 저장소에 저장되어있는지 검사//
        function(callback) //첫 시작은 하나의 callback으로 시작한다.//
        {
            MongoClient.connect(url, function(err, db){
                assert.equal(null, err);

                callback(null, db);
            });
        },

        //Task 2 : find()
        function(db, callback)
        {
            //조회는 커서(Cursor)의 개념을 이용한다.//
            //조건절은 find()내부에 JSON형태로 작성한다.//
            //정렬조건은 find()외부에 JSON형태로 작성한다. (1은 오름차순, -1은 내림차순)//
            db.collection('users', function(err, collection) {
                collection
                .find()
                .sort({
                    "age":1
                })
                //toArray를 이용해서 Document의 배열로 반환//
                .toArray(function(err, items) {
                    assert.equal(err, null);

                    console.log(items);

                    db.close(); //개방했으니 사용 후 닫아준다.//

                    callback(null, 'find ok...', items);
                });
            });
        }
    ],
    //Final Task : send//
    function(callback, message, doc)
    {
        console.log(message);

        response.send(doc);

        console.log('--------------------------');
    });
}
//////////////////////////
function search_mongodb(search_condition_name, response)
{
    async.waterfall([
        //파일이 현재 저장소에 저장되어있는지 검사//
        function(callback) //첫 시작은 하나의 callback으로 시작한다.//
        {
            MongoClient.connect(url, function(err, db){
                assert.equal(null, err);

                callback(null, db);
            });
        },

        //Task 2 : find()
        function(db, callback)
        {
            //조회는 커서(Cursor)의 개념을 이용한다.//
            /*조건절은 find()내부에 JSON형태로 작성한다. 기존 연속된 조건은 RDBMS에서는 and를 이용하였지만 MongoDB에서는 key를 붙
            //여주면 된다.*/
            db.collection('users', function(err, collection) {
                collection
                .find({
                    "name":search_condition_name
                })
                .sort({
                    "age":1
                })
                //toArray를 이용해서 Document의 배열로 반환//
                .toArray(function(err, doc) {
                    assert.equal(err, null);

                   console.log(doc);

                    db.close(); //개방했으니 사용 후 닫아준다.//

                    callback(null, 'search ok(if value is not exist that send [])...', doc);
                });
            });
        }
    ],
    //Final Task : send//
    function(callback, message, doc)
    {
        console.log(message);

        response.send(doc);

        console.log('--------------------------');
    });
}
////////////////////////////
function update_mongodb(update_condition_name, update_age_value, response)
{
    async.waterfall([
        //파일이 현재 저장소에 저장되어있는지 검사//
        function(callback) //첫 시작은 하나의 callback으로 시작한다.//
        {
            MongoClient.connect(url, function(err, db){
                assert.equal(null, err);

                callback(null, db);
            });
        },
        //Task 2 : 업데이트//
        function(db, callback)
        {
            //업데이트절의 조건과 값은 updateOne()내부에 JSON형태로 작성//
            //여러개의 document를 수정 : updateMany()//
            //업데이트절은 '$set'//
            db.collection('users').updateOne(
                {"name":update_condition_name},
                {$set: {"age":update_age_value}}, 
            function(err, results){
                assert.equal(null, err);
                    
                //console.log(results);

                db.close(); //개방했으니 사용 후 닫아준다.//

                callback(null, 'update ok(if value is not exist that no adjust)...');
            });
        }
    ],
    //Final Task : send//
    function(callback, message)
    {
        console.log(message);

        response.send(message);

        console.log('--------------------------');
    });
}
/////////////////////////////
function remove_mongodb(remove_condition_name, response)
{
    async.waterfall([
        //파일이 현재 저장소에 저장되어있는지 검사//
        function(callback) //첫 시작은 하나의 callback으로 시작한다.//
        {
            MongoClient.connect(url, function(err, db){
                assert.equal(null, err);

                callback(null, db);
            });
        },
        //Task 2 : remove//
        function(db, callback)
        {
            //단일 document 제거 : deleteOne(), 전체 document 제거 : deleteMany(), collection 제거 : drop()//
            db.collection('users').deleteOne({
                "name":remove_condition_name
            }, function(err, results){
                assert.equal(null, err);
                    
                //console.log(results);

                db.close(); //개방했으니 사용 후 닫아준다.//

                callback(null, 'remove ok(if value is not exist that no adjust)...');
            });
        }
    ],
    //Final Task : send//
    function(callback, message)
    {
        console.log(message);

        response.send(message);

        console.log('--------------------------');
    });
}
////////////////////////////
function createindex_mongodb(response)
{
    async.waterfall([
        //파일이 현재 저장소에 저장되어있는지 검사//
        function(callback) //첫 시작은 하나의 callback으로 시작한다.//
        {
            MongoClient.connect(url, function(err, db){
                assert.equal(null, err);

                callback(null, db);
            });
        },
        //Task 2 : 인덱스 생성//
        function(db, callback)
        {
            //createIndex()시 인덱스 생성, compoundIndex시 ','로 연결//
            db.collection('users').createIndex({
                "name":1
            }, null, function(err, results){
                assert.equal(null, err);

                db.close(); //개방했으니 사용 후 닫아준다.//

                callback(null, 'create index success...');
            });
        }
    ],
    //Final Task : send//
    function(callback, message)
    {
        console.log(message);

        response.send(message);

        console.log('--------------------------');
    });
}
///////////////////////////
function dropindex_mongodb(response)
{
    async.waterfall([
        //파일이 현재 저장소에 저장되어있는지 검사//
        function(callback) //첫 시작은 하나의 callback으로 시작한다.//
        {
            MongoClient.connect(url, function(err, db){
                assert.equal(null, err);

                callback(null, db);
            });
        },
        //Task 2 : 인덱스 생성//
        function(db, callback)
        {
            //createIndex()시 인덱스 생성, compoundIndex시 ','로 연결//
            db.collection('users').dropIndex({
                "name":1
            }, null, function(err, results){
                assert.equal(null, err);

                db.close(); //개방했으니 사용 후 닫아준다.//

                callback(null, 'drop index success...');
            });
        }
    ],
    //Final Task : send//
    function(callback, message)
    {
        console.log(message);

        response.send(message);

        console.log('--------------------------');
    });
}
////////////////////////////
function get_doc_count(response)
{
    async.waterfall([
        //파일이 현재 저장소에 저장되어있는지 검사//
        function(callback) //첫 시작은 하나의 callback으로 시작한다.//
        {
            MongoClient.connect(url, function(err, db){
                assert.equal(null, err);

                callback(null, db);
            });
        },
        //Task 2 : get count document//
        function(db, callback)
        {
            db.collection('users').count({}, function(err, numOfDocs){
                assert.equal(null, err);

                db.close(); //개방했으니 사용 후 닫아준다.//

                callback(null, numOfDocs);
            });
        }
    ],
    //Final Task : send//
    function(callback, numOfDocs)
    {
        console.log('users collection count: ' + numOfDocs);

        response.send(''+numOfDocs);

        console.log('--------------------------');
    });
}