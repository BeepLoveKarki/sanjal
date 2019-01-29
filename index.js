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
let {user,cart,purchase}=require('./server/models/user.js');
let category=require('./server/models/category.js');

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