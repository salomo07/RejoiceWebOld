var appDesc =require("./appDesc.js").appDesc;
var url = appDesc.urldb;
var dbName =appDesc.dbName;
var MongoClient = require('mongodb').MongoClient;

class Mongo {
  constructor(){
    
  }
  update(coll,filter,data)
  {
    MongoClient.connect(url,{useNewUrlParser: true}, function(err, client) {
      if (err) {console.log("Cannot connect to database : ",err);}
      else
      {
        client.db(dbName).collection(coll).updateOne(filter,{ $set: data }, (err, res) =>{console.log('Data updated')});
        client.close();
      }
    });
  }
  streamMongo(callback){
    MongoClient.connect(url,{useNewUrlParser: true}, function(err, client) {
      if (err) {console.log("Cannot connect to database : ",err);}
      else
      {
        var collection=client.db(dbName).collection('users');
        var pipeline = [{"$match": { "fullDocument._id": "q4sKzvQtDdvpyFihM"}}];

        const changeStream = collection.watch(pipeline);
        changeStream.on('change', next => { 
          console.log("Changed",next);
        });
        changeStream.on('error', error => {
          console.log("Error Streaming MongoDB",error);
        });
      }
    });
  }
  findUserDetail(filter,callback)
  {
    MongoClient.connect(url,{useNewUrlParser: true}, function(err, client) {
      if (err) {console.log("Cannot connect to database : ",err);}
      else
      {
        var users=client.db(dbName).collection('users');
        users.aggregate(
          [            
            {'$lookup': {from:'accessmenu1',localField:'profile.idrole',foreignField:'idrole',as:'accessmenu1'}},
            {'$lookup': {from:'accessmenu2',localField:'profile.idrole',foreignField:'idrole',as:'accessmenu2'}},
            {'$lookup': {from:'menu1',localField:'accessmenu1.idmenu1',foreignField:'_id',as:'menu1'}},
            {'$lookup': {from:'menu2',localField:'accessmenu2.idmenu2',foreignField:'_id',as:'menu2'}},
            {'$project': {accessmenu1:0,accessmenu2:0}},
            {'$match':filter}
          ]
        ).toArray((err2,data)=>{
          if (err2) {console.log("Cannot convert to array : ",err2);}
          else
          {
            callback(data[0]);
          }
        });
        client.close();
      }
    });
  }
  findOne(coll,filter,callback)
  { 
    MongoClient.connect(url,{useNewUrlParser: true}, function(err, client) {
      if (err) {console.log("Cannot connect to database (findOne): ",err);}
      else
      {
        client.db(dbName).collection(coll).findOne(filter,(err, data) =>{
          callback(data);
        });
        client.close();
      }
    });
  }
  find(coll,filter,sort,callback)
  { 
    MongoClient.connect(url,{useNewUrlParser: true}, function(err, client) {
      if (err) {console.log("Cannot connect to database : ",err);}
      else
      {
        client.db(dbName).collection(coll).find(filter).sort(sort).toArray((err, data) =>{
          callback(data);
        });
        client.close();
      }
    });
  }
  insertOne(coll,doc){
    MongoClient.connect(url,{useNewUrlParser: true}, function(err, client) {
      if (err) {console.log("Cannot connect to database : ",err);}
      else
      {
        doc.time=new Date();
        client.db(dbName).collection(coll).insertOne(doc);
        client.close();
      }
    });
  }
  aggregate(coll1,coll2,localfield,foreignfield,aka,filter,callback)
  {
    MongoClient.connect(url,{useNewUrlParser: true}, function(err, client) {
      if (err) {console.log("Cannot connect to database : ",err);}
      else
      {
        var label="$"+aka;
        client.db(dbName).collection(coll1).aggregate(
          [           
            {'$lookup': {from:coll2,localField:localfield,foreignField:foreignfield,as:aka}},
            {'$match':filter},
            {'$unwind': label}
          ], 
          (err, cursor)=> {
            cursor.toArray((err, data)=> {
              callback(data);
            });
          }
        );
      }
    });
  }
}
module.exports = Mongo;