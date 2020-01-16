'use strict';
var dragIndex = -1;
var selectedIndex = -1;
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
	if (pathMode && selectedIndex !== -1){
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
			r = depthSearch();
			break;
		case 'r':
			r = []
		break;

		case 'g':
			if (n !== false) {
				goalIndex = n;
			}
			r = depthSearch();
			break;

		case 's':
			if (n !== false) {
				startIndex = n;
			}
			r = depthSearch();
			break;
		
		case 'c':
			dragIndex 		= -1;
			selectedIndex 	= -1;
			startIndex 		= 0;
			goalIndex 		= numOfNodes - 1;
			r 				= [];
			dragging 		= false;
			mouseOver 		= false;
			allPaths		= [];
			allNodes		= [];
			numOfNodes		= 0;
			numOfPaths		= 0;
			nodeMode 		= true;
			pathMode 		= false;
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


function nodePressed(){
	for (var i = 0; i < numOfNodes; i++){
		var node = allNodes[i];
		if(
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
	if (nodeMode){
		if (n === false){
			new Node(mouseX, mouseY);
		} else{
			dragging = true;
			dragIndex = n;
			selectedIndex = n;
		}
	}
	if (pathMode){
		if (n !== false){
			if (selectedIndex === -1){
				selectedIndex = n;
			} else {
				var index1 = selectedIndex;
				var index2 = n;
				addPath(index1, index2);
				selectedIndex = -1;
			}
		}
	}
	r = depthSearch();
}

function mouseReleased(){
	dragging = false;
	var n = nodePressed();
	if (n !== false && pathMode && selectedIndex !== n && selectedIndex !== -1){
		var index1 = selectedIndex;
		var index2 = n;
		addPath(index1, index2);
		selectedIndex = -1;
	}
	r = depthSearch();
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
	var knownIndexes = [];
	var route = [startIndex];

	let search = (nodeIndex) => {
		if (!Number.isInteger(nodeIndex) || nodeIndex >= numOfNodes || nodeIndex < 0) {
			console.log("PATH NOT FOUND");
			return
		}

		var node = allNodes[nodeIndex];
		knownIndexes.push(nodeIndex);
		if (nodeIndex === goalIndex){
			route.push(goalIndex);
			return;
		}

		var closestIndex = -1;
		var closestGoalDistanceSquared = Infinity;
		for (var i = 0; i < node.paths.length; i++){
			var newIndex = node.paths[i];
			var newNode  = allNodes[newIndex];
			if (!knownIndexes.includes(newIndex)){
				var goalNode = allNodes[goalIndex];
				var dx = (goalNode.x - newNode.x)
				var dy = (goalNode.y - newNode.y)
				var distanceFromGoalSquared = dx*dx + dy*dy
				if (distanceFromGoalSquared < closestGoalDistanceSquared){
					closestIndex = newIndex;
					closestGoalDistanceSquared = distanceFromGoalSquared;
				}
			}
		}

		if (closestIndex === -1){
			route.pop();
			newIndex = route[route.length - 1];
			search(newIndex);
		} else {
			route.push(closestIndex);
			search(closestIndex);
			return;
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
