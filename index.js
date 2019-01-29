let express=require('express');
let cors=require('cors');
let http=require('http');
let bodyParser=require('body-parser');
let bcrypt=require('bcryptjs');
let fs=require('fs');
let geolib=require('geolib');
let fileUpload = require('express-fileupload');
let app=express();
let server=http.createServer(app);
let io=require('socket.io').listen(server);
let mongoose=require('./server/db/mongoose.js');
let {user,cart,purchase}=require('./server/models/user.js');
let category=require('./server/models/category.js');
let delivery=require('./server/models/delivery.js');
let admin=require('./server/models/admin.js');

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('viewengine','ejs');
app.use(express.static(__dirname+'/public'));
app.use('/static',express.static(__dirname+'/pics'));

io.sockets.on('connection', function (socket) {
	 socket.on('retail',(data)=>{
	   sendretailers(socket);
	 });
	 socket.on('delivery',(data)=>{
	   senddeliveries(socket);
	 });
	 socket.on('good',(data)=>{
	   sendgoods(socket);
	 });
 });

 
app.get("/",(req,res)=>{
   res.render("login.ejs");
});

app.get("/dashboard",(req,res)=>{
   res.render("dashboard.ejs");
});

app.get("/retails",(req,res)=>{
   res.render("retails.ejs");
});


function sendretailers(socket){
  user.find({},(err,doc)=>{
     if(doc.length==0){
	   socket.emit("retailers","no"); 
	 }else{
	   socket.emit("retailers",doc);
	 }
   });
}

function senddeliveries(socket){
   delivery.find({},(err,doc)=>{
     if(doc.length==0){
	    socket.emit("deliveries","no"); 
	 }else{
	    socket.emit("deliveries",doc);
	 }
   });
}

function sendgoods(socket){
 category.find({},(err,doc)=>{
    if(doc.length==0){
	    socket.emit("goods","no"); 
	 }else{
	    socket.emit("goods",doc);
	 }
 });
}

app.post('/login',(req,res)=>{
   user.findByCredentials(req.body.username).then((user)=>{
	  if(user!=0){
	      checkpass(req.body.username,user.password,req.body.password,res,req);
	  }else{
		  res.send(JSON.stringify({status:"no"}));
	  }
   });
});

app.post('/deliverylogin',(req,res)=>{
   delivery.findByCredentials(req.body.username).then((user)=>{
	  if(user!=0){
	      checkpass(req.body.username,user.password,req.body.password,res,req);
	  }else{
		  res.send(JSON.stringify({status:"no"}));
	  }
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

app.post('/getuser',(req,res)=>{
   user.findByCredentials(req.body.username).then((user)=>{
     res.send(JSON.stringify({data:user}));
   });
});

app.post('/loginchange',(req,res)=>{
  if(req.body["a"]==0){
    user.findOneAndUpdate({username:req.body.username},{$set:{username:req.body.data}},(err,data)=>{
	  res.send(JSON.stringify({status:"OK"}));
	});
  }else{
    bcrypt.genSalt(10,(err,salt)=>{
      bcrypt.hash(req.body["data"],salt,(err,hash)=>{
         user.findOneAndUpdate({username:req.body.username},{$set:{password:hash}},(err1,data)=>{
	       res.send(JSON.stringify({status:"OK"}));
	     });
	  });
	});
  }
});


app.post('/deliverysignup',(req,res)=>{  //by admin
 delivery.findByCredentials(req.body.username).then((deliverys)=>{
  if(deliverys==0){
    let delivery1=new delivery({username:req.body.username,password:req.body.password,name:req.body.name,number:req.body.number});
	delivery1.save().then((err,doc)=>{
	  res.send(JSON.stringify({status:"OK"}));
	});
  }else{
    res.send(JSON.stringify({status:"exist"}));	
  }
 });
});

app.post('/adminsignup',(req,res)=>{  //by admin
 admin.findByCredentials(req.body.username).then((admins)=>{
  if(admins==0){
    let admin1=new admin({username:req.body.username,password:req.body.password});
	admin1.save().then((err,doc)=>{
	  res.send(JSON.stringify({status:"OK"}));
	});
  }else{
    res.send(JSON.stringify({status:"exist"}));	
  }
 });
});


app.post('/deliveryloginchange',(req,res)=>{ //by admin
  if(req.body["a"]==0){
    delivery.findOneAndUpdate({username:req.body.username},{$set:{username:req.body.data}},(err,data)=>{
	  res.send(JSON.stringify({status:"OK"}));
	});
  }else{
    bcrypt.genSalt(10,(err,salt)=>{
      bcrypt.hash(req.body["data"],salt,(err,hash)=>{
         delivery.findOneAndUpdate({username:req.body.username},{$set:{password:hash}},(err1,data)=>{
	       res.send(JSON.stringify({status:"OK"}));
	     });
	  });
	});
  }
});

app.post('/getrelevantpurchases',(req,res)=>{
  let d1={latitude: req.body["lat"], longitude: req.body["long"]};
  let range=req.body["range"];
  let d2={};
  let data=new Array();
  user.find({},(err,users)=>{
    users.forEach((val)=>{
	  if(val["purchases"].length!=0){
	    d2["latitude"]=val["latitude"];
		d2["longitude"]=val["longitude"];
		if(geolib.getDistance(d1,d2)<=range){
		  let purchases=val["purchases"];
		   purchases.forEach((datas1)=>{
			  let datas=datas1.toObject();
		      datas["by"]=val["retailername"];
		      datas["number"]=val["number"];
		      datas["email"]=val["email"];
		      data.push(datas);
		   });
		}
	  }
	});
	if(data.length!=0){
	  res.send(JSON.stringify({data:data}));
	}else{
	  res.send(JSON.stringify({data:"no"}));
	}
  });
});




app.post('/delivered',(req,res)=>{ //byadmin
  user.findByCredentials(req.body.username).then((users)=>{
      users.purchases.forEach((val)=>{
		if(new Date(val["purchasedDate"]).getMilliseconds()==new Date(req.body.date).getMilliseconds()){
		   let data=val.toObject();
		   data["delivered"]=true;
		   user.findOneAndUpdate({username:req.body.username},{$pull:{purchases:{purchasedDate:new Date(req.body.date)}}},(err,datas)=>{
			 user.findOneAndUpdate({username:req.body.username},{$push:{purchases:data}},(err1,datas1)=>{
			    res.send(JSON.stringify({"status":"OK"}));
			 });
		   });
		}
	  });
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
					        let users=new user({retailname:req.body.retailname,address:req.body.address,retailername:req.body.retailername,number:parseFloat(req.body.number),email:req.body.email,username:req.body.username,password:req.body.password,latitude:parseFloat(req.body.latitude),longitude:parseFloat(req.body.longitude)});
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

app.post('/addcategory',(req,res)=>{ //add category
	category.findByName(req.body.name).then((value)=>{
	 if(value==0){
	   let categories=new category({name:req.body.name,types:[],costs:[],units:[]});
       req.body.types.forEach((val,index)=>{
	     categories.types.push(val);
		 categories.costs.push(req.body.costs[index]);
		 categories.units.push(req.body.units[index]);
	   });
	   categories.save().then((doc)=>{
	      res.send(JSON.stringify({status:"OK"}));
	   });
     }else{
	    res.send(JSON.stringify({status:"exists"}));	
	 }
   });  
});

app.get('/getcategories',(req,res)=>{ //get all categories
  category.find({},(err,val)=>{
      res.send(JSON.stringify({data:val}));
  });
});

app.post('/addtocart',(req,res)=>{
	let carte=new cart({name:req.body.category,type:req.body.type,quantity:req.body.quantity,cost:req.body.tprice});
    user.findOneAndUpdate({username:req.body.username},{$push:{carts:carte}},(err,data)=>{
	  res.send(JSON.stringify({status:"OK"}));
	});
});

app.post('/getcarts',(req,res)=>{
   user.findOne({username:req.body.username},(err,user)=>{
	res.send(JSON.stringify({data:user.carts})); 
   });
});

app.post('/purchase',(req,res)=>{
  user.findOneAndUpdate({username:req.body.username},{$pull:{carts:{date:new Date(req.body.date)}}},(err,data)=>{
	 let date=new Date();
	 date.setHours(date.getHours()+24);
	 let purchased=new purchase({name:req.body.name,type:req.body.type,quantity:req.body.quantity,cost:req.body.cost,deliveryDate:date,delivered:false});
	 user.findOneAndUpdate({username:req.body.username},{$push:{purchases:purchased}},(err1,data)=>{
	   if(req.body.credits==true){
		 user.findOneAndUpdate({username:req.body.username},{$inc:{credits:parseFloat(req.body.cost)}},(err2,data2)=>{
		   res.send(JSON.stringify({status:"OK",date:date}));
		 });
	   }else{
	     res.send(JSON.stringify({status:"OK",date:date}));
	   }
	 });
  });
});

app.post('/getcredits',(req,res)=>{
   user.findOne({username:req.body.username},(err,user)=>{
	res.send(JSON.stringify({credits:user.credits,interest:user.interest})); 
   });
});

app.post('/removecart',(req,res)=>{
  user.findOneAndUpdate({username:req.body.username},{$pull:{carts:{date:new Date(req.body.date)}}},(err,data)=>{
	 res.send(JSON.stringify({status:"OK"}));
  });
});

app.post('/getpurchases',(req,res)=>{
  user.findOne({username:req.body.username},(err,user)=>{
	res.send(JSON.stringify({data:user.purchases})); 
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