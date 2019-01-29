let mongoose=require('mongoose');
let bcrypt=require('bcryptjs');

let deliverySchema=new mongoose.Schema({
  name:String,
  number:Number,
  username:String,
  password:String
});

deliverySchema.statics.findByCredentials=function(username){
  return this.findOne({username}).then((boy)=>{
	if (!boy){
      return 0;
    }else{
	  return boy;
    }
  });
}

deliverySchema.methods.saveRecord=function(){
return   this.save().then((doc)=>{
    return doc;
  },(err)=>{
    return err;
  });
};

deliverySchema.pre('save',function(next){  
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

let delivery=mongoose.model("delivery",deliverySchema);

module.exports=delivery;