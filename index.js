let express=require('express');
let cors=require('cors');
let http=require('http');
let bodyParser=require('body-parser');
let bcrypt=require('bcryptjs');
let geolib=require('geolib');
let fileUpload = require('express-fileupload');
let session = require('express-session');
let request=require('request');
let MongoDBStore = require('connect-mongodb-session')(session);
let app=express();
let server=http.createServer(app);
let io=require('socket.io').listen(server);
let mongoose=require('./server/db/mongoose.js');
let admin=require('./server/models/admin.js');
let store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/sessions',
  collection: 'mySessions'
});

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('viewengine','ejs');
app.use(require('express-session')({
 secret: "hey you,yes you!",
 store: store,
 resave:true,
 saveUninitialized:true
}));
app.use(express.static(__dirname+'/public'));
//app.use('/static',express.static(__dirname+'/pics'));

let pid='182605855243255';
let token='EAAdoDaKTunkBANYtbZCZBHCjs2rMIi2fgyYyL6ta4Dt0ZCBXsSWGK5nG9BwpM6vQpUcZCrXQAp1dXk54Q3FNsFB6Wu13jCxgKdpB4CuEBEbecTZBHpcgTQNB6e1MsUljXcmgv7NwhKyo9mPbRFpKCpGqLXBBi14n3swGHFZCkpvkJWP3K9qW1fZCVr2cQIZC1CcEZBlMuS0IT0AZDZD';
 
app.get("/",(req,res)=>{
  if(req.session["admin"] && req.session["admin"]=="yes"){
    res.render("dashboard.ejs");
  }else{
    res.render("login.ejs");
  }
});


app.get("/page",(req,res)=>{
 request('https://graph.facebook.com/'+pid+'?fields=name,fan_count&access_token='+token, function (error, response, body) {
  let data=JSON.parse(body);
  res.send(JSON.stringify({data}));
 });
});


app.get("/visual",(req,res)=>{
  if(req.session["admin"] && req.session["admin"]=="yes"){
    res.render("audio.ejs");
  }else{
    res.render("login.ejs");
  }
});

app.get("/bot",(req,res)=>{
   res.render("bot.ejs");
});

app.get("/robot",(req,res)=>{
   res.render("robot.ejs");
});


app.get("/adminlogout",(req,res)=>{
  req.session.destroy(function(err) {
      res.redirect('/');
  });
});

app.post('/adminlogin',(req,res)=>{
   admin.findByCredentials(req.body.username).then((user)=>{
	  if(user!=0){
	      checkpass(req.body.username,user.password,req.body.password,res,req);
	  }else{
		  res.send(JSON.stringify({status:"no"}));
	  }
   });
});

app.post('/adminsignup',(req,res)=>{
	admin.findByCredentials(req.body.username).then((user)=>{
	  if(user==0){
	    let admin1= new admin({username:req.body.username,password:req.body.password});
		admin1.save().then((doc)=>{
		  res.send(JSON.stringify({status:"OK"}));
		});
	  }else{
	    res.send(JSON.stringify({status:"pre-exists with username"}));
	  }
	});
	
});

app.get("/*",(req,res)=>{
  res.redirect("/");
});


function checkpass(username,hash,nohash,res,req){
  bcrypt.compare(nohash,hash,(err,result)=>{
		if (result){
		  req.session["admin"]="yes";
	      res.send(JSON.stringify({status:"OK"}));
        }else{
          res.send(JSON.stringify({status:"no"}));
        }
      });
}


server.listen(process.env.PORT ||8080,()=>{
    //console.log("server is up");
  });