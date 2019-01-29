let socket = io();
getgoods();
getretails();
//setInterval(getit,5000);

function getgoods(){
  socket.emit("good","ok");
  socket.on("goods",(data)=>{
    $(".bodyt").empty();
	if(data=="no"){
	  $(".data").show();
	}else{
	 data.forEach((val)=>{
	   val["costs"].forEach((val1,i)=>{
	       $(".bodyt").append("<tr><td>"+val["name"]+"</td><td>"+val["types"][i]+"</td><td>NRs. "+val1+"</td><td>"+val["units"][i]+"</td><td><i class=\"fa fa-pencil\"></i></td><td><i class=\"fa fa-trash\"></i></td></tr>");
	   });
	 });
	}
  });
}

function getretails(){
  socket.emit("retail","ok");
  socket.on("retailers",(data)=>{
    $(".bodyt1").empty();
	if(data=="no"){
	   $(".data1").show();
	}else{
	 data.forEach((val,index)=>{
	   let plink="http://localhost:8080/static/"+val["username"]+"_photo.jpg";
	   let clink="http://localhost:8080/static/"+val["username"]+"_cit.jpg";
	   let link="https://maps.google.com/?q="+val["latitude"]+","+val["longitude"];
	   $(".bodyt1").append("<tr><td>"+val["retailname"]+"</td><td>"+val["address"]+"</td><td>"+val["retailername"]+"</td><td>"+val["number"]+"\
	   \</td><td>"+val["email"]+"</td><td>"+val["username"]+"</td><td><a href=\""+plink+"\" target=\"_blank\">View Photo</a></td>\
	   \<td><a href=\""+clink+"\" target=\"_blank\">View Citizenship</a></td><td><a href=\""+link+"\" target=\"_blank\">View on Map</a></td>\
	   \</td><td><i class=\"fa fa-pencil\"></i></td><td><i class=\"fa fa-trash\"></i></td></tr>");
	 });
	}
  });
}

function getdelivery(){
  socket.emit("delivery","ok");
  socket.on("deliveries",(data)=>{
     $(".bodyt2").empty();
	if(data=="no"){
	   $(".data2").show();
	}else{
	
	}
  });
}


function show(a){
  switch(a){
    case 1:
	break;
	
	case 2:
	break;
	
	case 3:
	break;
	
	case 4:
	break;
	
	case 5:
	break;
	
	case 6:
	break;
  }
}
