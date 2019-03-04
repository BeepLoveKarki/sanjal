var rafID = null;
var analyser = null;
var c = null;
var cDraw = null;
var ctx = null;
var micropone = null;
var ctxDraw = null;

var loader;
var filename;
var renderer;
var skull;
var sunglasses;
var headphones;
var pivot;
var texts;
var cube_mesh;
var scene;
var camera;
var controls;
var fileChosen = false;
var RADIUS = 2;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var loadedVar = 0, totalVar = 0;
var likes;
var name;
var link;

const HIGHLIGHT_COLORS = [0x4200ff, 0x00ffff, 0xff0000, 0xff00ff];
const LOADING_WRAPPER_HEIGHT = 100;

const SAMPLE_URL = 'audio/music2.mp3';
//const SAMPLE_SUBTEXT = "Happy 3d visualizing";
var sampleURLIndex;

//handle different prefix of the audio context
var AudioContext = AudioContext || webkitAudioContext;
//create the context.
var context = new AudioContext();

//using requestAnimationFrame instead of timeout...
if (!window.requestAnimationFrame)
	window.requestAnimationFrame = window.webkitRequestAnimationFrame;

$(function () {
	    /*
		$.get("/page").then((data)=>{
          let doc=$.parseJSON(data);
	      link="https://www.facebook.com/"+doc["data"]["id"];
	      likes=doc["data"]["fan_count"].toString();
	      name=doc["data"]["name"];
       });*/
	   
	      link="https://www.facebook.com/182605855243255";
		  likes=18821;
		  name="LOCUS, IOE Pulchowk";
	
		/*$(".inputfile + label, .button").addClass("animated fadeInUp");
		$('.inputfile + label, .button').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                $('.inputfile + label, .button').removeClass('fadeInUp');
         });*/
		
		$('#loading_wrapper').css("top", ($(window).height() / 2 - LOADING_WRAPPER_HEIGHT));
			
		//handle different types navigator objects of different browsers
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
	            navigator.mozGetUserMedia || navigator.msGetUserMedia;
	    //eigene Init
	    loader = new BufferLoader();
            //loader.visualize = visualize;
            //init canvas
	    initBinCanvas();
		//start updating
		rafID = window.requestAnimationFrame(updateVisualization);

});

function handleFiles(files) {
    if(files.length === 0){
        return;
    }
	fileChosen = true;
    setupAudioNodes();
	
	var fileReader  = new FileReader();
    fileReader.onload = function(){
         var arrayBuffer = this.result;
         //console.log(arrayBuffer);
         //console.log(arrayBuffer.byteLength);
     };
     fileReader.readAsArrayBuffer(files[0]);
     var url = URL.createObjectURL(files[0]); 
	
	var request = new XMLHttpRequest();
	
	request.addEventListener("progress", updateProgress);
	request.addEventListener("load", transferComplete);
	request.addEventListener("error", transferFailed);
	request.addEventListener("abort", transferCanceled);
	
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

 	// When loaded decode the data
	request.onload = function() {
		// decode the data
		context.decodeAudioData(request.response, function(buffer) {
		// when the audio is decoded play the sound
		sourceNode.buffer = buffer;
		sourceNode.start(0);
		//on error
		$("#viewer_discretion").html("Congratulations on "+likes+" likes on your page <a id=\"link\" href="+link+" target=\"_blank\">"+name+"</a>!!! Happy Analyzing!!!");
		}, function(e) {
			console.log(e);
		});
	};
	request.send();
	
	camera.position.z = 375;
	camera.position.y = 0;
	
	$(".inputfile + label, .button").addClass("animated fadeOutDown");
}

function playSample() {
	
	fileChosen = true;
    setupAudioNodes();
	
	var request = new XMLHttpRequest();
	
	request.addEventListener("progress", updateProgress);
	request.addEventListener("load", transferComplete2);
	request.addEventListener("error", transferFailed);
	request.addEventListener("abort", transferCanceled);
	
	//console.log("SAMPLE URL INDEX: " + sampleURLIndex);
	
	request.open('GET', SAMPLE_URL, true);
	request.responseType = 'arraybuffer';

 	// When loaded decode the data
	request.onload = function() {
		// decode the data
		context.decodeAudioData(request.response, function(buffer) {
		// when the audio is decoded play the sound
		sourceNode.buffer = buffer;
		sourceNode.start(0);
		//on error
		$("#viewer_discretion").html("Congratulations on "+likes+" likes on your page <a id=\"link\" href="+link+" target=\"_blank\">"+name+"</a>!!! Happy Analyzing!!!");
		}, function(e) {
			console.log(e);
		});
	};
	request.send();
	
	camera.position.z = 375;
	camera.position.y = 0;
	
	$(".inputfile + label, .button").addClass("animated fadeOutDown");
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initBinCanvas () {

	//SCENE#######################################################################
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x00000);
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio( window.devicePixelRatio );
	document.body.appendChild(renderer.domElement);
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	
	controls.enabled = false;
		
	var geometry = new THREE.BoxGeometry(560, 560, 100000, 15, 55, 100);
	
	var cubeMat = new THREE.MeshBasicMaterial({color: '#4200ff', wireframe: true});
	var testMat = new THREE.MeshStandardMaterial({
		roughness: 0,
		color: 'white'
	});
	cube_mesh = new THREE.Mesh(geometry, cubeMat);
	scene.add(cube_mesh);
	
	
	//MATERIALS###################################################################
	var material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
	var objMat = new THREE.MeshStandardMaterial({
		color: 'yellow', 
		wireframe: true,
		roughness: .3
	});
	var newMat = new THREE.MeshPhongMaterial({
		color: '#6e3bff'
	});
	var headphoneMat = new THREE.MeshStandardMaterial({
		roughness: 0.4,
		color: 'yellow',
		wireframe: false
	});
	var box = new THREE.Box3();
	pivot = new THREE.Group(); //group objs and center pivot of skull
	
	
	//LOADING OBJs#################################################################
	var manager = new THREE.LoadingManager();
		manager.onProgress = function ( item, loaded, total ) {
			//console.log( item, loaded, total ); //loaded 1 total 3
			loadedVar = loaded;
			totalVar = total;
	};
	
	var percentComplete = [];
	for (var i = 0; i < 3; i++) percentComplete[i] = 0;
	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			percentComplete[loadedVar] = (xhr.loaded / xhr.total * 100);
			//console.log("percentComplete[" + loadedVar + "] = " + (xhr.loaded / xhr.total * 100));
			//console.log("########totalComplete = " + totalComplete);
			var totalComplete = (percentComplete[0] + percentComplete[1] + percentComplete[2]) / 3.0;
			//console.log("#############:" + totalComplete);
			$(".label").html(Math.round(totalComplete, 2) + '% loaded');
			if (totalComplete === 100 && loadedVar === 2) {
				$(".inputfile + label, .button").css("visibility", "visible");
				$(".inputfile + label, .button").addClass("animated fadeInUp");
				$('.inputfile + label, .button').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
						$('.inputfile + label, .button').removeClass('fadeInUp');
				});
				$("#loading_screen").addClass("animated fadeOut");
				$("#loading_screen").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
						$("#loading_screen").css("display", "none");
						$("#viewer_discretion").html("This music visualizer may be harmful to viewers who are prone to epilepsy. Please be careful.");
				});
			} 
		}
	};
	
	var onError = function ( xhr ) {
	};
	
	var loader3D = new THREE.OBJLoader( manager );
	// load a resource
	loader3D.load(
		// resource URL
		'objs/skull_lowpoly.obj',
		// Function when resource is loaded
		function ( object ) {
			object.traverse(function (child) {
				if ( child instanceof THREE.Mesh ) {

						child.material = newMat;
						child.shading = THREE.FlatShading;

					}
			});
			object.position.y = 0;
			object.position.x = 0;
			box.setFromObject( object );
			box.getCenter( object.position ); // this re-sets the mesh position
			object.position.multiplyScalar( - 1 );
			pivot.add( object );
			skull = object;
	}, onProgress, onError );
	
	loader3D.load(
		'objs/sunglasses.obj',
		function ( object ) {
			object.traverse(function( child ) {
				if (child instanceof THREE.Mesh) {
					child.material = objMat;
					child.shading = THREE.SmoothShading;
				}
			});
			object.position.x = 0;
			object.position.y = -3;
			object.position.z = 10;
			pivot.add( object );
			sunglasses = object;
	}, onProgress, onError );
	
	loader3D.load(
		'objs/headphones.obj',
		function ( object ) {
			object.traverse(function( child ) {
				if (child instanceof THREE.Mesh) {
					child.material = headphoneMat;
					child.shading = THREE.SmoothShading;
				}
			});
			object.position.x = 0;
			object.position.y = 3;
			object.position.z = 30;
			pivot.add( object );
			headphones = object;
	}, onProgress, onError );
	
	
	scene.add( pivot );
	

	//scene.add(skull);
	//camera.position.z = 375;
	camera.position.z = 500;
	camera.position.y = 500;

	var ambient = new THREE.AmbientLight( 0x101030 );
	scene.add( ambient );

	var directionalLight = new THREE.DirectionalLight( 0xffeedd );
	directionalLight.position.set( 0, 0, 1 );
	scene.add( directionalLight );
	
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	
	$('#loading_wrapper').css("top", ($(window).height() / 2 - LOADING_WRAPPER_HEIGHT));
	
	//console.log("Window.width" + $(window).width());
	

}

function onDocumentMouseMove( event ) {

	mouseX = ( event.clientX - windowHalfX ) / 3;
	mouseY = ( event.clientY - windowHalfY ) / 3;

}

function onDocumentTouchStart( event ) {
	
	if ( event.touches.length > 1 ) {
		event.preventDefault();
		mouseX = (event.touches[ 0 ].pageX - windowHalfX) / 3;
		mouseY = (event.touches[ 0 ].pageY - windowHalfY) / 3;
	}
	
}

function onDocumentTouchMove( event ) {
	
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		mouseX = (event.touches[ 0 ].pageX - windowHalfX) / 3;
		mouseY = (event.touches[ 0 ].pageY - windowHalfY) / 3;
	}
	
}

var audioBuffer;
var sourceNode;
function setupAudioNodes() {
	// setup a analyser
	analyser = context.createAnalyser();
	// create a buffer source node
	sourceNode = context.createBufferSource();	
	//connect source to analyser as link
	sourceNode.connect(analyser);
	// and connect source to destination
	sourceNode.connect(context.destination);
}


function reset () {
	if (typeof sourceNode !== "undefined") {
		sourceNode.stop(0);		
	}
	if (typeof microphone !== "undefined") {
		microphone = null;
	}
}


function updateVisualization () {
        
	// get the average, bincount is fftsize / 2
	if (fileChosen) {
		var array = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(array);
		
		drawBars(array);
	}
	camera.position.x += ( mouseX - camera.position.x) * .05;
	//console.log("Camer pos x: " + camera.position.x);
	camera.position.y += ( - mouseY - camera.position.y) * .05;
	camera.lookAt( scene.position );
	render();
	//renderer.render(scene, camera);
	

	rafID = window.requestAnimationFrame(updateVisualization);
	controls.update();
}

function render() {
	renderer.render( scene, camera );
	
}

function smoothenArr(array) 
{
	var smooth_array = new Array(array.length);
	for (var i = 0; i<array.length-2; i++)
	smooth_array[i]=(array[i] + array[i+1])/2;

	smooth_array[array.length-1]=array[array.length-1];
	
	return smooth_array;
}

// progress on transfers from the server to the client (downloads)
function updateProgress (oEvent) {
  if (oEvent.lengthComputable) {
    var percentComplete = oEvent.loaded / oEvent.total;
	$("#viewer_discretion").html("Loading music file... " + Math.floor(percentComplete * 100) + "%");
	$("#viewer_discretion").addClass("animated infinite flash");
  } else {
    // Unable to compute progress information since the total size is unknown
	  console.log("Unable to compute progress info.");
  }
}

function transferComplete(evt) {
  	console.log("The transfer is complete.");
	$("#viewer_discretion").removeClass("animated infinite flash");
  	$("#viewer_discretion").html("Enjoy Listening to your favourite song");
}

function transferComplete2(evt) {
  	console.log("The transfer is complete.");
	$("#viewer_discretion").removeClass("animated infinite flash");
  	$("#viewer_discretion").html(SAMPLE_SUBTEXTS[sampleURLIndex]);
}

function transferFailed(evt) {
  	console.log("An error occurred while transferring the file.");
	$("#viewer_discretion").html("An error occurred while loading the file.");
}

function transferCanceled(evt) {
  	console.log("The transfer has been canceled by the user.");
	$("#viewer_discretion").html("Loading has been canceled by the user.");
}

//var counterVar = 0; //decrease flashing frequency
function drawBars (array) {

	//just show bins with a value over the treshold
	var threshold = 0;
	//the max count of bins for the visualization
	var maxBinCount = array.length;
	//space between bins
	var space = 3;
        
    var bass = Math.floor(array[1]); //1Hz Frequenz 
	var snare = Math.floor(array[250]);
	//console.log("Array length " + array.length);
	console.log("BASS: " + bass);
    RADIUS = bass * .004; 
	RADIUS = RADIUS < .75 ? .75 : RADIUS;
	//console.log("Radius:" + RADIUS);
	pivot.scale.x = RADIUS;
	pivot.scale.y = RADIUS;
	pivot.scale.z = RADIUS;
    
	//var dx = Math.random()*10;
  	//var dy = Math.random()*10;
	
	//cube_mesh.position.x = bass >= 255 ? dx : 0;
	//cube_mesh.position.y = bass >= 255 ? dy : 0;
	
	if (snare > 0) {
		if (snare > 100) {
			if (snare > 230) {
				cube_mesh.rotation.z +=  .01;
			}
			else {
				cube_mesh.rotation.z +=  .005;
			}
		} else {
			cube_mesh.rotation.z +=  .001;
		}
	}
	
	if (bass > 230) {
		//counterVar++;
		//if (counterVar % 3 === 0) 
		cube_mesh.material.color.setHex( HIGHLIGHT_COLORS[Math.floor(Math.random() * HIGHLIGHT_COLORS.length)] );
		cube_mesh.position.z += 10;
		//cube_mesh.rotation.z +=  .01;
		if (cube_mesh.position.z >= 2800) {
			cube_mesh.position.z = 0;
		}
	} else {
		cube_mesh.material.color.setHex( HIGHLIGHT_COLORS[0] );
	}
	//cube_mesh.position.y = dy;
	//go over each bin
	for ( var i = 0; i < maxBinCount; i++ ){
                  
	}   
}

