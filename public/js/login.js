function login(){
  if($("#uname").val().length==0 || $("#upass").val().length==0){
     $(".p-t").text("Either of the inputs is empty");
  }else{
  $.post("/adminlogin",{
	  username:$("#uname").val(),
	  password:$("#upass").val()
  }).then((data)=>{
     let d=$.parseJSON(data);
	 if(d["status"]=="no"){
	   $(".p-t").text("No any account found with entered credentials");
	 }else{
	    window.location.href="/";
	 }
  });
  }
}