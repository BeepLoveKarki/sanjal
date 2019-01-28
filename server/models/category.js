let mongoose=require('mongoose');

let categorySchema=new mongoose.Schema({
  name:String,
  types:[String],
  costs:[Number],
  units:[String]
});

categorySchema.statics.findByName=function(name){
  return this.findOne({name}).then((user)=>{
	if (!user){
      return 0;
    }else{
	  return user;
    }
  });
}


module.exports=mongoose.model("category",categorySchema);