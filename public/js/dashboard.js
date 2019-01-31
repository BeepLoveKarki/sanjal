$(document).ready(()=>{
  show(1);
});

let socket = io();
let good;
function getgoods(){
  socket.emit("good","ok");
  socket.on("goods",(data)=>{
    $(".bodyt").empty();
	if(data=="no"){
	  $(".data").show();
	}else{
	 data.forEach((val)=>{
	   val["costs"].forEach((val1,i)=>{
	       $(".bodyt").append("<tr><td>"+val["name"]+"</td><td>"+val["types"][i]+"</td><td>NRs. "+val1+"</td><td>"+val["units"][i]+"</td><td><i class=\"fa fa-pencil\"></i></td><td><i class=\"fa fa-trash\" onclick=\"deletegoods("+i+")\"></i></td></tr>");
	   });
	 });
	}
  });
}


function getsales(){
  $.get("/sales").then((data)=>{
    let d=$.parseJSON(data);
	let vals={};
	vals["x"]=d["locs"];
	vals["y"]=d["datas"];
	vals["type"]='bar';
	let graph=new Array();
	graph.push(vals);
	Plotly.newPlot('graph', graph);
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
	   data.forEach((val,index)=>{
	     $(".bodyt2").append("<tr><td>"+val["name"]+"</td><td>"+val["username"]+"</td><td>"+val["number"].toString()+"</td><td><i class=\"fa fa-pencil\"></i></td><td><i class=\"fa fa-trash\ id=\"deld"+index+"\"></i></td></tr>");
	   });
	}
  });
}


function show(a){
  if(a!=5 && a!=6){
    $("#"+a.toString()).addClass("active");
  }
  for(let i=1;i<4;i++){
     if(i!=a){
	   $("#"+i.toString()).removeClass("active");
	 }
  }
  switch(a){
    case 1:
	$("#goods").show();
	$("#retails").hide();
	$("#deliveries").hide();
	$("#sales").hide();
	getgoods();

	break;
	
	case 2:
	$("#goods").hide();
	$("#retails").show();
	$("#deliveries").hide();
	$("#sales").hide();
	getretails();
    setInterval(getretails,5000);
	break;
	
	case 3:
	$("#goods").hide();
	$("#retails").hide();
	$("#deliveries").show();
	$("#sales").hide();
	getdelivery();
	break;
	
	case 4:
	$("#goods").hide();
	$("#retails").hide();
	$("#deliveries").hide();
	$("#sales").show();
	getsales();
	setInterval(getsales,5000);
	break;
	
	case 5:
	$("#up").modal('show');
	break;
	
	case 6:
	window.location.replace("/logout");
	break;
  }
}
