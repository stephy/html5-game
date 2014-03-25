var jewel = {
	screens: {},
	settings: {
		rows: 8, //grid
		cols: 8, //grid
		baseScore: 100, //determines the number of points awarded per jewel that takes part in a chaing
		numJewelTypes: 7 //number of different types of jewels
	},
	images: {}
};
//wait until main document is loaded
window.addEventListener('load', function(){

//determine jewel size
var jewelProto = document.getElementById("jewel-proto"),
	rect = jewelProto.getBoundingClientRect(); //returns the position and dimensions of an element

jewel.settings.jewelSize = rect.width;

//determine weather standalone mode is enabled
Modernizr.addTest("standalone", function(){
	return (window.navigator.standalone !== false);
});


var numPreload = 0,
	numLoaded = 0;
/* 
	loader prefix allows you to track 2 things:
	- how many files are being loaded
	- how many of those files have finished loading
*/
yepnope.addPrefix("loader", function(resource){
	//console.log("Loading : " + resource.url);
	var isImage = /.+\.(jpg|png|gif)$/i.test(resource.url);
	resource.noexec = isImage;
	numPreload++;

	resource.autoCallback = function(e){
		//console.log('Finished loading: ' + resource.url)
		numLoaded++;
		if(isImage){
			var image = new Image();
			image.src = resource.url;
			jewel.images[resource.url] = image;
		}
	};

	return resource;
})
/*
	extend yepnope with preloading
	this prefix lets you add "preload!" to the paths passed to 
	Modernizr.load(). If a file has the prefix, the script doesn't 
	execute.
*/
yepnope.addPrefix("preload", function(resource){
	resource.noexec = true;
	return resource;
});

/*
	Returns a value between 0 and 1 indicating how far the loading 
	has progressed
*/
function getLoadProgress(){
	if(numPreload > 0){
		return numLoaded / numPreload;
	}else{
		return 0;
	}
}

//stage 1
//start dynamic loading
Modernizr.load([
	{
		load: [
			'scripts/sizzle.js',
			'scripts/dom.js',
			'scripts/game.js',
		]
	}, {
		test: Modernizr.standalone,
		yep: 'scripts/screen.splash.js',
		nope: 'scripts/screen.install.js',
		complete: function(){
			jewel.game.setup();
			if(Modernizr.standalone){
				jewel.game.showScreen("splash-screen", getLoadProgress);
			}else{
				jewel.game.showScreen("install-screen");
			}
			
		}
	}

]);

//loading stage 2
//only activated if the gane is running in standalone mode
//ensuring that you don't waste bandwith loading unneeded resources
if(Modernizr.standalone){
	Modernizr.load([
	 {
		test: Modernizr.webworkers,
		yep: [ "loader!scripts/board.worker-interface.js",
			   "preload!scripts/board.js" ],
		// yep: "loader!scripts/board.js",
		nope: "loader!scripts/board.js"
	}, {
		load: [
			'loader!scripts/display.canvas.js',
			'loader!scripts/screen.main-menu.js',
			'loader!scripts/screen.game.js',
			'loader!images/jewels' + jewel.settings.jewelSize + ".png"
			]
	}

	]);
}


}, false);//end of load