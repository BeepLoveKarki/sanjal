let socket = io();
getit();
setInterval(getit,5000);

function getit(){
  let goods="";
  let goodsall=new Array();
  socket.emit("retail","ok");
  socket.on("retailers",(data)=>{
    $(".bodyt").empty();
	if(data=="no"){
	   $(".data").show();
	}else{
	 data.forEach((val,index)=>{
	   val["purchases"].forEach((val1)=>{
		  if(val1["delivered"]==true){
			let name=val1["type"];
		    let cost=(parseFloat(val1["cost"])/parseFloat(val1["quantity"].match(/\d/g))).toString();
			let unit=val1["quantity"].match(/[A-Za-z]/g).join("");
			goods=name+" - NRs."+cost+" per "+unit+"<br/>";
		  }
	   });
	   if(goods==""){
	     goodsall.push("No any Khudra goods yet");
	   }else{
	     goodsall.push(goods);
		 goods="";
	   }
	   let link="https://maps.google.com/?q="+val["latitude"]+","+val["longitude"];
	   $(".bodyt").append("<tr><td>"+val["retailname"]+"</td><td>"+val["address"]+"</td><td>"+goodsall[index]+"</td><td><a href=\""+link+"\" target=\"_blank\">View on Map</a></td></tr>");
	 });
	}
  });
}