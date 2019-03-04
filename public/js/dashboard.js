$(document).ready(()=>{
  show(1);
});

function visual(){
  window.open("/visual","_blank");
}


function show(a){
  if(a!=6){
    $("#"+a.toString()).addClass("active");
  }
  for(let i=1;i<5;i++){
     if(i!=a){
	   $("#"+i.toString()).removeClass("active");
	 }
  }
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
	window.location.replace("/adminlogout");
	break;
  }
}
