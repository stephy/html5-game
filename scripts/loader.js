var jewel = {
	screens: { }
};
//wait until main document is loaded
window.addEventListener('load', function(){

//start dynamic loading
Modernizr.load([
	{
		load: [
			'scripts/sizzle.js',
			'scripts/dom.js',
			'scripts/game.js',
			'scripts/screen.splash.js',
			'scripts/screen.main-menu.js'
		],
		//called when all files have finished loading and executing
		complete: function(){
			//show the first screen
			jewel.game.showScreen("splash-screen");
		}
	}

]);


}, false);//end of load