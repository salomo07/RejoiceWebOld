const Mongo =require ("./mongo.js");
var app = require('express')();
var express= require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var http = require('http').createServer(app);
var path = require('path');
const server = require('http').createServer(app);

const bcrypt = require('bcrypt');
const saltRounds = 10;

// var fcm = require('fcm-notification');
// var FCM = new fcm('./serviceAccountKey.json');

var admin = require('firebase-admin');
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = {Mongo,app,express,bodyParser,cookieParser,http,path,server,bcrypt,saltRounds,admin}
