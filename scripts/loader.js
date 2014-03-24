var jewel = {
	screens: { }
};
//wait until main document is loaded
window.addEventListener('load', function(){

//determine weather standalone mode is enabled
Modernizr.addTest("standalone", function(){
	return (window.navigator.standalone !== false);
});

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
		load: ['scripts/screen.main-menu.js']
	}
	]);
}


}, false);//end of load