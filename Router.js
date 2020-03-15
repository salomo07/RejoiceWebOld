var {Mongo,app,express,bodyParser,cookieParser,http,path,server,bcrypt,saltRounds,admin} =require ("./init.js");

function sendMessage(idsender,idreceiver,messagedata){
	var tokens=[];var sender;	
	new Mongo().find("users",{"$or":[{_id:idsender},{_id:idreceiver}]},{},(res)=>{
		res.map((val,i)=>{
			if(val._id==idsender)
			{sender=val;}
			if(val._id==idreceiver)
			{	
				var token=val.token;tokens=[];
				if(token.web!=undefined && token.web!=""){tokens.push(token.web)}
				if(token.android!=undefined && token.android!=""){tokens.push(token.android)}
				if(token.ios!=undefined && token.ios!=""){tokens.push(token.ios)}
			}
		});
		tokens.map((token,i)=>{

			messagedata.time=messagedata.time.toString();
			delete messagedata._id;
			var message={"token" : token,"data":messagedata,
			    "notification" : {"title":sender.profile.firstname+" "+sender.profile.lastname,"body":messagedata.message},
			    "webpush": {
			      "fcm_options": {
			        "link": "https://rejoicesystemwebsite.herokuapp.com/chat"
			      }
			    }
			}
			admin.messaging().send(message).then((response) => {console.log('Successfully sent message:', response);}).catch((error) => {console.log('Error sending message:', error);});
		});
	})
}


server.listen(process.env.PORT || 3000,()=>{
});
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/',(req,returnAPI)=>{
	// new Mongo().streamMongo((err,res)=>{
	// 	console.log(res);
	// });

	if(req.cookies.userdata ==undefined)
	returnAPI.sendFile(path.join(__dirname + '/views/login.html'));
	else returnAPI.redirect('/chat')
});
app.post('/api',(req,returnAPI)=>{	
	returnAPI.send("Welcome to API. All request must be JSON type. 'Content-Type': 'application/json'");
});
app.get('/chat',(req,returnAPI)=>{

	if(req.cookies.userdata ==undefined)
	{returnAPI.redirect('/')}
	else returnAPI.render(path.join(__dirname + '/views/chat.html'), {"dataUser":req.cookies.userdata});
});
app.get('/demo',(req,returnAPI)=>{
	returnAPI.render(path.join(__dirname + '/views/demo.html'), {"dataUser":req.cookies.userdata});
});

app.post('/loginweb',(req,returnAPI)=>{
	var userData, reqPassword;
	if (req.body.username!=undefined) {
		req.body.username={'$eq' : req.body.username}
	}
	if (req.body.password!=undefined) {
		reqPassword=req.body.password;
		delete req.body.password
	}
	// bcrypt.hash(reqPassword, saltRounds, function(err, hash) {
	//   console.log(hash);
	// });
	new Mongo().findOne('users',req.body,(res)=>{
		// console.log(res)
		if(res==null)
		{returnAPI.redirect('/');}
		else
		{
			bcrypt.compare(reqPassword, res.password, function(e, r) {
				if(r==true)
				{
					new Mongo().findUserDetail(req.body,(res)=>{
						returnAPI.cookie('userdata',{_id:res._id,username:res.username,profile:res.profile,token:res.token},{maxAge: 3600000*8});
						if(res.username=="Demo")
						{returnAPI.redirect('/demo');}
						else{returnAPI.redirect('/chat');}
					});
				}
				else
				{returnAPI.json([]);}
			});
		}
	});
});
app.post('/api/getuserdetail/',(req,returnAPI)=>{ //Should have "password" on request and username must equals
	var userData, reqPassword;
	// console.log(req.protocol,typeof req.headers.accept);
	if (req.body.username!=undefined) {
		req.body.username={'$eq' : req.body.username}
	}
	if (req.body.password!=undefined) {
		reqPassword=req.body.password;
		delete req.body.password
	}

	// bcrypt.hash(reqPassword, saltRounds, function(err, hash) {
	//   console.log(hash);
	// });
	new Mongo().findOne('users',req.body,(res)=>{
		if(res==null)
		{returnAPI.json([]);}
		else
		{
			bcrypt.compare(reqPassword, res.password, function(e, r) {
				if(r==true)
				{
					new Mongo().findUserDetail(req.body,(res)=>{
						returnAPI.json(res);
					});
				}
				else
				{returnAPI.json([]);}
			});
		}
	});
});
app.post('/api/updateuser',(req,returnAPI)=>{
	new Mongo().update('users',req.body.filter,req.body.data);
	returnAPI.json([]);
});
app.post('/api/getdatajoin',(req,returnAPI)=>{
	new Mongo().aggregate(req.body.coll1,req.body.coll2,req.body.localfield,req.body.foreignfield,'data',req.body.filter,(res)=>{
		returnAPI.json(res);
	})
});
app.post('/api/findMany',(req,returnAPI)=>{
	new Mongo().find(req.body.coll,req.body.filter,req.body.sort,(res)=>{
		returnAPI.json(res);
	})
});
app.post('/api/findOne',(req,returnAPI)=>{
	new Mongo().findOne(req.body.coll,req.body.filter,(res)=>{
		returnAPI.json(res);
	})
});
app.post('/api/insertOne',(req,returnAPI)=>{
	new Mongo().insertOne(req.body.coll,req.body.document);
	if(req.body.sender!=undefined)
	{
		sendMessage(req.body.sender,req.body.receiver,req.body.document);
	}
	returnAPI.json([]);
});
app.get('/signout',(req,returnAPI)=>{
	returnAPI.clearCookie("userdata");
	returnAPI.redirect('/');
});
// app.get('/favicon.ico', (req, returnAPI) => {
// 	returnAPI.sendStatus(404);
// });
