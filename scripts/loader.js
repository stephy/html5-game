var jewel = {
	screens: {},
	settings: {
		rows: 8, //grid
		cols: 8, //grid
		baseScore: 100, //determines the number of points awarded per jewel that takes part in a chaing
		numJewelTypes: 7 //number of different types of jewels
	}
};
//wait until main document is loaded
window.addEventListener('load', function(){

//determine weather standalone mode is enabled
Modernizr.addTest("standalone", function(){
	return (window.navigator.standalone !== false);
});

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
				jewel.game.showScreen("splash-screen");
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
		load: [
			'scripts/screen.main-menu.js'
			]
	}, {
		test: Modernizr.webworkers,
		yep: [ "scripts/board.worker-interface.js",
			   "preload!scripts/board.js" ],
		nope: "scripts/board.js"
	}

	]);
}


}, false);//end of load