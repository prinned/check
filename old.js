'use strict';
var dragIndex = -1;
var selectedIndex = 0;
var startIndex = 0;
var goalIndex = numOfNodes - 1;
const NODE_RADIUS = 10;
var r 			= [];
var dragging 	= false;
var mouseOver 	= false;
var allPaths	= [];
var allNodes	= [];
var numOfNodes	= 0;
var numOfPaths	= 0;
var nodeMode 	= true;
var pathMode 	= false;

function draw(){
	background(255);
	stroke(255,0,0);
	line(0,0,0,height);
	line(0,0,width,0);
	line(width,0, width, height);
	line(0, height, width, height)

	for (var i = 0; i < numOfNodes; i++){
		var myNode = allNodes[i];
		var col = myNode.colour
		noStroke();
		fill(col[0], col[1], col[2]);
		ellipse(myNode.x, myNode.y, NODE_RADIUS*2);
	}
	for (var i = 0; i < numOfPaths; i++){
		var path = allPaths[i];
		stroke(0,127,0);
		var node1 = allNodes[path[0]];
		var node2 = allNodes[path[1]];

		line(node1.x, node1.y, node2.x, node2.y);
	}

	if (dragging){
		allNodes[dragIndex].x = mouseX;
		allNodes[dragIndex].y = mouseY;
	}
	if (pathMode){
		stroke(0,0,127);
		line(allNodes[selectedIndex].x, allNodes[selectedIndex].y, mouseX, mouseY)
	}
	drawRoute(r);
	noStroke();
}

function setup(){
	createCanvas(windowWidth - 50, windowHeight - 50);
}

function keyPressed(){
	var n = nodePressed();
	switch(key){
		case 'd':
			r = ds2();
			break;
		case 'r':
			r = []
		break;

		case 'g':
			if (n !== false) {
				goalIndex = n;
			}
			r = ds2();
			break;

		case 's':
			if (n !== false) {
				startIndex = n;
			}
			r = ds2();
			break;
		
		case 'c':
			pathMode 		= false;
			nodeMode 		= true;
			dragIndex 		= -1;
			selectedIndex 	= 0;
			startIndex 		= 0;
			goalIndex 		= numOfNodes - 1;		
			dragging 		= false;
			mouseOver 		= false;
			allPaths		= [];
			allNodes		= [];
			numOfNodes		= 0;
			numOfPaths		= 0;
			r = [];
			break;
	}
	switch (keyCode){
		case ESCAPE:
			pathMode = !pathMode;
			nodeMode = !nodeMode;
			break;
		
		case CONTROL: 
			if (nodePressed() !== false){
				selectedIndex = n;
			} break;

		
		
		
		
		
		
		
		
		
		
		
		
		
	}
}

function kp2(){
	var n = nodePressed();
	if (key === 'n'){
		nodeMode = true;
		pathMode = false;
	} else if (key === 'p'){
		nodeMode = false;
		pathMode = true;
	} else if (key === 'd'){
		console.log(depthSearch())
	
	} else if (keyCode === ESCAPE){
		nodeMode = !nodeMode;
		pathMode = !pathMode;
	} else if (keyCode === ALT){
		dragIndex = -1;
		selectedIndex = 0;
		startIndex = 0;
		goalIndex = numOfNodes - 1;		
		dragging 	= false;
		mouseOver 	= false;
		allPaths	= [];
		allNodes	= [];
		numOfNodes	= 0;
		numOfPaths	= 0;

	}
	
	else if (n !== false){
		if (keyCode === CONTROL) selectedIndex = n;
		else if (key === 'g')  	 goalIndex	   = n;
		else if (key === 's')  	 startIndex	   = n;
	}
	
	else if (pathMode){
		if(keyCode === LEFT_ARROW
		|| keyCode === UP_ARROW){
			if (++selectedIndex >= numOfNodes){
				selectedIndex = 0;
			}
		} else if (
		   keyCode === RIGHT_ARROW
		|| keyCode === DOWN_ARROW){
			if (--selectedIndex < 0){
				selectedIndex = numOfNodes - 1;
			}
		}
	}
}

function nodePressed(){
	for (var i = 0; i < numOfNodes; i++){
		var node = allNodes[i];
		if(mouseX > node.x - NODE_RADIUS 
		&& mouseX < node.x + NODE_RADIUS
		&& mouseY > node.y - NODE_RADIUS 
		&& mouseY < node.y + NODE_RADIUS){
			return i;
		} 
		
		else if(
		   mouseX > node.x - NODE_RADIUS*2 
		&& mouseX < node.x + NODE_RADIUS*2
		&& mouseY > node.y - NODE_RADIUS*2 
		&& mouseY < node.y + NODE_RADIUS*2){
			return i;
		}
	}
	return false;
}



function mousePressed(event){
	var n = nodePressed();
//	if (event.ctrlKey){
//		if (nodePressed() === false) return
//		selectedIndex = nodePressed()
//	}
	if (nodeMode){
		if (n === false){
			new Node(mouseX, mouseY);
		} else{
			dragging = true;
			dragIndex = n;
		}
	}

	if (pathMode){
		if (n !== false){
			var index1  = selectedIndex;
			var index2 = n;
			addPath(index1, index2);
		}
	}
}

function mouseReleased(){
	dragging = false;
}



class Node{
	constructor(x,y){
		this.x 			 = x;
		this.y 			 = y;
		this.paths = [];
		this.index = numOfNodes++;
		allNodes.push(this);
	}

	get colour(){
		if (this.index === goalIndex){
			return [0,127,0];
		} else if (this.index === startIndex){
			return [180,180,0] //YELLOW
		} else {
			return  [0,0,0]
		}
	}
	__addPath(index){
		this.paths.push(index);
	}
}

function addPath(index1, index2){
	if(index1 === index2
	|| allPaths.includes([index1,index2])
	|| allPaths.includes([index2,index1])) return;
	
	allNodes[index1].__addPath(index2);
	allNodes[index2].__addPath(index1);
	allPaths.push([index1, index2]);
	numOfPaths++;
}



function depthSearch(){
	var knownIndexes = [startIndex]
	var choiceSteps = [0];
	var placeHolders = [0];
	var route = [startIndex];
	let search = (nodeIndex) => {
		node = allNodes[nodeIndex];

		if (node.paths.length >= 3) placeHolders.push(0);
		
		if (node.paths.length === 1){ 
			if (nodeIndex === goalIndex) {
				return goalIndex
			}
			else{ //BACKTRACKING
				var lastPlaceHolder = placeHolders[placeHolders.length - 1]
				var moveBack = choiceSteps.pop();
				route.splice(route.length - moveBack, moveBack);
				var lastChoice = allNodes[route[route.length - 1]];
				
				if (lastPlaceHolder > lastChoice.paths.length){
					placeHolders.pop();
					var lastPlaceHolder = placeHolders[placeHolders.length - 1]
					var moveBack = choiceSteps.pop();
					route.splice(route.length - moveBack, moveBack);
					var lastChoice = allNodes[route[route.length - 1]];
				}
				
				search(lastChoice.paths[lastPlaceHolder++])
			}
			
		}
		
		if (route.length > 50){
			console.log("AAAAAAAAAAAHHHHHHH");
			return;
		}
		route.push(nodeIndex)
		if (node.paths[0] === previousIndex){
			placeHolders[placeHolders.length - 1]++;
			search(node.paths[1]);
		}
		else search(node.paths[0])
	}
	search(startIndex);
	return route;
}


var megar = []
function ds2(){
	megar = []
	var knownIndexes = []
	var route = [startIndex];

	let search = (nodeIndex) => {
		var routeCopy = [];
		var kic = [];
		Object.assign(routeCopy, route);
		Object.assign(kic, knownIndexes);
		megar.push([routeCopy, kic]);
		if (!Number.isInteger(nodeIndex) || nodeIndex >= numOfNodes || nodeIndex < 0) {
			console.log("PATH NOT FOUND");
			return
		}

		if (route.length > 50){
			console.log("AAAAAAAAAAAHHHHHHH");
			return;
		}

		var node = allNodes[nodeIndex];
		knownIndexes.push(nodeIndex);
		
		var foundIndex = false;
		for (var i = 0; i < node.paths.length; i++){
			var newIndex = node.paths[i];
			if (newIndex === goalIndex){
				foundIndex = true;
				route.push(goalIndex);
				return;
			}
			if (!knownIndexes.includes(newIndex)){
				foundIndex = true;
				route.push(newIndex);
				search(newIndex);
				return;
			}

		}
		if (!foundIndex){
			route.pop();
			newIndex = route[route.length - 1];
			search(newIndex);
		}
	}
	search(startIndex);
	return route;
}

function drawRoute(route){
	for (var j = 0; j < route.length - 1; j++){
		stroke(255,0,0);
		var i = route[j];
		var ni= route[j+1]
		line(allNodes[i].x, allNodes[i].y, allNodes[ni].x, allNodes[ni].y);
	}
}