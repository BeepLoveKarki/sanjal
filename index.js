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

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('viewengine','ejs');
app.use(express.static(__dirname+'/public'));
//app.use('/static',express.static(__dirname+'/pics'));

app.get("/",(req,res)=>{
  //res.render('login.ejs');
});

server.listen(process.env.PORT ||8080,()=>{
    //console.log("server is up");
  });