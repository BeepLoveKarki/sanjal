let mongoose=require('mongoose');
let bcrypt=require('bcryptjs');

let cartSchema=new mongoose.Schema({
   name:String,
   type:String,
   quantity:String,
   cost:Number,
   date:{ type : Date, default: Date.now }
});

let purchasedSchema=new mongoose.Schema({
   name:String,
   type:String,
   quantity:String,
   cost:Number,
   purchasedDate:{ type : Date, default: Date.now },
   deliveryDate:Date,
   delivered:Boolean
});

let userSchema=new mongoose.Schema({
  retailname:String,
  address:String,
  retailername:String,
  number:Number,
  email: String,
  username:String,
  password:String,
  latitude:Number,
  longitude:Number,
  credits:{
	 type:Number,
	 default:0
  },
  interest:{
	 type:Number,
	 default:0
  },
  carts:[cartSchema],
  purchases:[purchasedSchema]
});

userSchema.statics.findByCredentials=function(username){
  return this.findOne({username}).then((user)=>{
	if (!user){
      return 0;
    }else{
	  return user;
    }
  });
}

userSchema.statics.findByNumber=function(number){
  return this.find({number}).then((user)=>{
	if (!user){
      return 0;
    }else{
	  return user;
    }
  });
}

userSchema.methods.saveRecord=function(){
return   this.save().then((doc)=>{
    return doc;
  },(err)=>{
    return err;
  });
};

userSchema.pre('save',function(next){  
  if (this.isModified('password')){
    bcrypt.genSalt(10,(err,salt)=>{
      bcrypt.hash(this.password,salt,(err,hash)=>{
        this.password=hash;
		next();
      });
    });
  }else{
    next();
  }
});

let user=mongoose.model("user",userSchema);
let cart=mongoose.model("cart",cartSchema);
let purchase=mongoose.model("purchase",purchasedSchema);

module.exports={user,cart,purchase};
