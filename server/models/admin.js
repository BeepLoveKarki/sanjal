let mongoose=require('mongoose');
let bcrypt=require('bcryptjs');

let adminSchema=new mongoose.Schema({
  username:String,
  password:String
});

adminSchema.statics.findByCredentials=function(username){
  return this.findOne({username}).then((admin)=>{
	if (!admin){
      return 0;
    }else{
	  return admin;
    }
  });
}

adminSchema.pre('save',function(next){  
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

let admin=mongoose.model("admin",adminSchema);

module.exports=admin;