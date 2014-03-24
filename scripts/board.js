jewel.board = (function(){
	/* game functions go here */
	var settings,
		jewels, //2D array representing current state of the board
		cols,
		rows,
		baseScore,
		numJewelTypes;

	/*
		if possible, swaps (x1,y1) and (x2, y2) and calls the callback function
		with the list of board events
	*/
	function swap(x1,y1, x2,y2, callback){
		var tmp,
			events;

		if(canSwap(x1,y1,x2,y2)){
			//swap the jewels
			tmp = getJewel(x1, y1);
			jewels[x1][y1] = jewels[x2][y2];
			jewels[x2][y2] = tmp;

			//check the board and get list of events
			events = check();
			callback(events);
		}else{
			callback(false);
		}
	}
    /*
    	create a copy of the jewel board
    */
    function getBoard(){
    	var copy = [],
    		x;

    	for(x = 0; x < cols; x++){
    		copy[x] = jewels[x].slice(0);
    	}

    	return copy;
    }
	/* 
		chains 

		there can only be the chains involving the two swapped jewels
		However, when those jewels are removed, other jewels fall down
		and more jewels enter the board from the top.
		This means that the board must be checked again, and now the 
		situation is not so simple anymore. The only way to be sure all chains
		are detected is to be be throrough and search the whole board.
		When you use checkChain() function, this taks is not so complicated

		Returns a two-dimensional map of chain-lengths 
	*/
    function getChains(){
    	var x, y,
    		chains = [];
    	for(x =0; x< cols; x++){
    		chains[x] = [];
    		for(y =0; y<rows; y++){
    			chains[x][y] = checkChain(x,y);
    		}
    	}
    	//two dimensional map of the board
    	//this map holds information about the chains in which the jewels take part
    	return chains;
    }

    //chains must be removed
    //this function removes jewels from the board and brings new ones when necessary
    function check(events){
    	var chains = getChains(),
    		hadChains = false, score = 0,
    		removed = [], moved = [], gaps =[];

    	//visit every position on the board
    	for(var x =0; x< cols; x++){
    		gaps[x] = 0;
    		//examine board from the bottom up instead of usual top down
    		//this approach lets you immediately start moving the other jewels down
    		//process columns
    		for(var y = rows-1; y >=0 ; y--){
    			if(chains[x][y] > 2){
    				hadChains = true;
    				gaps[x]++;
    				removed.push({
    					x: x, y: y,
    					type: getJewel(x,y)
    				});

    				//add points to score
    				//for every jewel that is part of a chain, a number of points 
    				//is added to score, the number depends on the length of the chain
    				//for every extra jewel in the chain, the multiplier is doubled
    				score += baseScore * Math.pow(e, (chains[x][y] - 3));
    			}else if(gaps[x] > 0){
    				moved.push({
    					toX: x, toY: y + gaps[x],
    					fromX: x, fromY: y,
    					type: getJewel(x,y)
    				});
    				jewels[x][y + gaps[x]] = getJewel(x,y); 
    			}//end if else
    		}//end for

    		//fill gaps on top
    		for(y=0; y< gaps[x]; y++){
    			jewels[x][y] = randomJewel();
    			moved.push({
    				toX: x, toY: y,
    				fromX: x, fromY: y - gaps[x],
    				type: jewels[x][y]
    			});
    		}
    	}//end for

    	//after check(), chains are now gone and the gaps are filled with new jewels
	    //it is possible for the new jewels to create new chains
	    //check the board recursively
	    events = events || [];
	    if(hadChains){
	    	//collect data
	    	events.push({
	    		type: "remove",
	    		data: removed
	    	},{
	    		type: "score",
	    		data: score
	    	},{
	    		type: "move",
	    		data: moved
	    	});

	    	//refill if no more moves
	    	if(!hasMoves()){
	    		fillBoard();
	    		events.push({
	    			type: "refill",
	    			data: getBoard()
	    		});
	    	}
	    	//call it again 
	    	return check(events);
	    }else{
	    	return events;
	    }

    }//end check

    /*
      To check weather a given jewel can be moved to from a new chain, the canJewelMove() function
      uses canSwap() to test weather the jewel can be swapped with one of its four neighbors
      each canSwap() call is performed only if the neighbor is withing the bounds of the board, that is
      canSwap() tires to swap the jewel with its left neighbor only if the jewel's x coordinate is at least 1 
      and less than (cols -1 )
      function returns true if (x,y) is a valid position and if the jewel at (x,y) can be swapped with a
      neighbor 
     */
    function canJewelMove(x,y){
    	return ((x > 0 && canSwap(x,y,x-1,y)) || 
    			(x < cols-1 && canSwap(x, y, x+1, y)) ||
    			(y > 0 && canSwap(x,y,x, y-1)) ||
    			(y < rows-1 && canSwap(x, y, x, y+1)));
    }

    /*
      check for available moves
      (if the game goes long enough, the player inevitabely faces a board that has no moves,
      the game needs to register this fact so the board can be refilled with fresh jewels and the 
      game can continue)
	  returns true if at least one match can be made
	*/
	function hasMoves(){
		for (var x=0; x< cols; x++){
			for(var y=0; y< rows; y++){
				if(canJewelMove(x,y)){
					return true;
				}
			}
		}
		return false;
	}

 
	//returns true if (x1,y1) is adjacent to (x2,y2)
	function isAdjacent(x1, y1, x2, y2){
		//calculate manhatam distance
		var dx = Math.abs(x1-x2),
			dy = Math.abs(y1-y2);

		//the sum of the two distances must be exaclty 1 if the positions are adjacent
		return (dx+dy ===1);
	}

	//determine chain at a given position
	function checkChain(x, y){
		var type = getJewel(x, y),
			left = 0, right = 0,
			down = 0, up = 0;

		//look right
		while(type === getJewel(x+right+1, y)){
			right++;
		}
		//look left
		while(type === getJewel(x-left-1, y)){
			left++;
		}
		//look up
		while(type === getJewel(x, y+up+1)){
			up++;
		}
		//look down
		while(type === getJewel(x, y-down-1)){
			down++;
		}

		//returns the number of jewels found in the largest chain
		return Math.max(left+1+right, up+1+down); 
	}

	//returns true if(x1, y1) can be swapped with (x2,y2) to form a new match
	function canSwap(x1, y1, x2, y2){
		var type1 = getJewel(x1, y1),
			type2 = getJewel(x2, y2),
			chain;

		if(!isAdjacent(x1,y1,x2,y2)){
			return false;
		}

		//temporarily swap jewels
		jewels[x1][y1] = type2;
		jewels[x1][y2] = type1;

		chain = (checkChain(x2, y2) > 2 || checkChain(x1, y1) > 2);

		//swap back
		jewels[x1][y1] = type1;
		jewels[x1][y2] = type2;

		return chain;

	}

	function getJewel(x, y){
		if(x<0 || x> cols-1 || y <0 || y> rows-1){
			return -1; //coordinates out of bounds
		}else{
			return jewels[x][y];
		}
	}

	function randomJewel(){
		return Math.floor(Math.random() * numJewelTypes);
	}

	function fillBoard(){
		var x, y;
		jewels = [];
		for(var x = 0; x < cols; x++){
			jewels[x] = [];
			for(var y = 0; y < rows; y++){
				type = randomJewel();
				//no chains allowed (more than two jewels that are the same adjacent to each other)
				while((type == getJewel(x-1, y) && type === getJewel(x-2, y)) ||
					  (type == getJewel(x, y-1) && type === getJewel(x, y-2))){
					type = randomJewel();
				}//end while
				jewels[x][y] = type;
			}//end for y
		}//end for x


		/*
			Refilling the board recursively 

		 	Simply calling fillBoard() doesnt garantee that new board has available moves
		 	There's a slight chance that the randomly piced jewels just produce another locked board
		 	A locked board, then should trigger another, silent refull, without the player knowing
	    */
	    if(!hasMoves()){
	    	fillboard();
	    }

	}//end fillboard()

	function initialize(callback){
		settings = jewel.settings;
		numJewelTypes = settings.numJewelTypes;
		baseScore = settings.baseScore;
		cols = settings.cols;
		rows = settings.rows;
		fillBoard();
		callback(); //to be used with webworkers
	}

	function print(){
		var str = "";
		for(var y = 0; y< rows; y++){
			for(var x = 0; x< cols; x++){
				str += getJewel(x,y) + " ";
			}
			str += "\r\n";
		}
		console.log(str);
	}
	return{
		/* exposed functions go here */
		initialize: initialize,
		print: print,
		canSwap: canSwap,
		getBoard: getBoard,
		swap: swap
	};
})();