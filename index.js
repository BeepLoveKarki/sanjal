let express=require('express');
let cors=require('cors');
let http=require('http');
let bodyParser=require('body-parser');
let bcrypt=require('bcryptjs');
let fs=require('fs');
let fileUpload = require('express-fileupload');
let app=express();
let server=http.createServer(app);
let io=require('socket.io').listen(server);
let mongoose=require('./server/db/mongoose.js');
let user=require('./server/models/user.js');

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('viewengine','ejs');
app.use(express.static(__dirname+'/public'));
app.use('/static',express.static(__dirname+'/pics'));

app.get("/",(req,res)=>{
   res.send("OK");
});

app.post('/login',(req,res)=>{
   user.findByCredentials(req.body.username).then((user)=>{
	  if(user!=0){
	      checkpass(req.body.username,user.password,req.body.password,res,req);
	  }else{
		  res.send(JSON.stringify({status:"no"}));
	  }
   });
});

app.post('/signup',(req,res)=>{
  let photo=req.files.pic;
  let cit=req.files.cit;
  let pplace=__dirname+'/pics/'+req.body.username+'_photo.jpg';
  let cplace=__dirname+'/pics/'+req.body.username+'_cit.jpg';
	   user.findByNumber(req.body.number).then((user1)=>{
		   if(user1==0){
				  user.findByCredentials(req.body.username).then((user2)=>{
				    if(user2==0){
					  	photo.mv(pplace,(err)=>{
				          cit.mv(cplace,(err1)=>{
					        let users=new user({retailname:req.body.retailname,address:req.body.address,retailername:req.body.retailername,number:req.body.number,email:req.body.email,username:req.body.username,password:req.body.password});
			                users.save().then((err,doc)=>{
                              res.send(JSON.stringify({status:"OK"}));
                           });  
					     });
				       });
					}else{
				       res.send(JSON.stringify({status:"uexist"}));	
					}
				  });
			 }else{
			       res.send(JSON.stringify({status:"nexist"}));	
			 }
	 });
	
});

function checkpass(username,hash,nohash,res,req){
  bcrypt.compare(nohash,hash,(err,result)=>{
		if (result){
	      res.send(JSON.stringify({status:"OK"}));
        }else{
          res.send(JSON.stringify({status:"no"}));
        }
      });
}


server.listen(process.env.PORT ||8080,()=>{
    //console.log("server is up");
  });