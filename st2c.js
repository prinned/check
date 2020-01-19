'use strict';
var dragIndex 		= -1;
var selectedIndex 	= -1;
var startIndex 		= 0;
var goalIndex 		= 0;
const NODE_RADIUS 	= 10;
var r 				= [];
var dragging 		= false;
var mouseOver 		= false;
var numOfNodes		= 0;
var numOfPaths		= 0;
var nodeMode 		= true;
var pathMode 		= false;
var allPaths		= [];
var nodePaths		= [];
var nodePositions	= [];
var numberMode 		= false;
var deleteMode		= false;

function draw(){
	background(255);
	stroke(255,0,0);
	line(0,0,0,height);
	line(0,0,width,0);
	line(width,0, width, height);
	line(0, height, width, height)

	for (var i = 0; i < numOfNodes; i++){
		if (nodePositions[i] === undefined) continue;
		noStroke();
		var x = nodePositions[i][0];
		var y = nodePositions[i][1];
		if (i === goalIndex && i === startIndex){

			fill(0,127,0);
			arc(x, y, NODE_RADIUS*2, NODE_RADIUS*2,  -HALF_PI, HALF_PI);
  			fill(180,180,0);
			arc(x, y, NODE_RADIUS*2, NODE_RADIUS*2,  HALF_PI, -HALF_PI);  
		} else{
			if 		(i === goalIndex)		var col = [0,  127,  0];
			else if (i === startIndex) 		var col = [180,180,  0];
			else if (i === selectedIndex) 	var col = [128,128,128];
			else 							var col = [0,  0,    0];
			
			fill(...col);
			ellipse(x, y, NODE_RADIUS*2);
		}
		if (numberMode){
			fill(127,0,0);
			if (i < 10) 		{
				textSize(17);
				textAlign(CENTER, CENTER);
			} else if (i < 100)	{
				textSize(13);
				textAlign(CENTER, CENTER)
			} else				{
				textSize(7);
			}
			//rect(x-NODE_RADIUS,  y-NODE_RADIUS, 20, 20);
			fill(255);
			//text(i , x-NODE_RADIUS,  y-NODE_RADIUS, 20, 20);
			text(i , x,  y);
			
		}
	}
	for (var i = 0; i < numOfPaths; i++){
		var path = allPaths[i];
		stroke(0,127,0);
		var pos1 = nodePositions[path[0]];
		var pos2 = nodePositions[path[1]]

		line(pos1[0], pos1[1], pos2[0], pos2[1]);
	}

	if (dragging && dragIndex >= 0 && dragIndex < numOfNodes){
		nodePositions[dragIndex] = [mouseX,mouseY];
	}
	if (pathMode && selectedIndex !== -1){
		stroke(0,0,127);
		if (deleteMode) stroke(127, 0, 0);
		line(nodePositions[selectedIndex][0], nodePositions[selectedIndex][1], mouseX, mouseY);
	}
	drawRoute(r);
	noStroke();
}

function setup(){
	createCanvas(windowWidth - 20, windowHeight - 20);
}

function deleteNode(deleteIndex){
	if (deleteIndex === startIndex && deleteIndex === goalIndex){
		var indexFound = false;
		for (var i = 0; i < numOfNodes; i++){
			if (nodePositions[i] !== undefined && i !== deleteIndex){
				goalIndex  = i;
				startIndex = i;
				indexFound = true;
				break;
			}
		}
		if (!indexFound){
			goalIndex  = -1;
			startIndex = -1;
		}

	} else if (deleteIndex === goalIndex) {
		goalIndex = startIndex;
	} else if (deleteIndex === startIndex){
		startIndex = goalIndex;
	} 
	

	//deleting in allpaths
	for (var i = allPaths.length - 1; i >= 0; i--){
		var path = allPaths[i];
		if (path[0] === deleteIndex || path[1] === deleteIndex) {
			allPaths.splice(i,1);
			numOfPaths--;
		}
	}
	//deleting in neighbours paths
	nodePaths[deleteIndex].forEach(neighbour => {
		nodePaths[neighbour].splice(nodePaths[neighbour].indexOf(deleteIndex), 1);
	})
	//deleting node position and paths
	if (deleteIndex === numOfNodes - 1){
		nodePositions.pop();
		nodePaths.pop();
		numOfNodes--;
	} else {
		delete nodePositions[deleteIndex];
		delete nodePaths[deleteIndex];
	}
}

function deletePath(firstIndex, secondIndex){
	//checking if there is a path
	if (!nodePaths[firstIndex].includes(secondIndex)) return;
	//deleting from allPaths
	for (var i = allPaths.length - 1; i >= 0; i--){
		var path = allPaths[i];
		if ((path[0] === firstIndex && path[1] === secondIndex)
		||  (path[1] === firstIndex && path[0] === secondIndex)) {
			allPaths.splice(i,1);
			numOfPaths--;
		}
	}
	//deleting in each others memories
	nodePaths[firstIndex ].splice(nodePaths[firstIndex].indexOf(secondIndex), 1);
	nodePaths[secondIndex].splice(nodePaths[secondIndex].indexOf(firstIndex ), 1);
}

function keyPressed(){
	var n = nodePressed();
	switch(key){
		case 'D':
			deleteMode = !deleteMode;
			break;

		case 'n':
			numberMode = !numberMode;
			break;
		
		case 'r':
			if (r.length === 0) r = aStar()
			else r = [];
			break;

		case 'g':
			if (n !== false) {
				goalIndex = n;
			}
			r = aStar();
			break;

		case 's':
			if (n !== false) {
				startIndex = n;
			}
			r = aStar();
			break;
		
		case 'c':
			dragIndex 		= -1;
			selectedIndex 	= -1;
			startIndex 		= 0;
			goalIndex 		= 0;
			r 				= [];
			dragging 		= false;
			mouseOver 		= false;
			numOfNodes		= 0;
			numOfPaths		= 0;
			nodeMode 		= true;
			pathMode 		= false;
			deleteMode		= false;
			allPaths		= [];
			nodePaths		= [];
			nodePositions	= [];
			break;
	}
	switch (keyCode){
		case ESCAPE:
			pathMode = !pathMode;
			nodeMode = !nodeMode;
			selectedIndex = -1;
			break;
		
		case CONTROL: 
			if (nodePressed() !== false){
				selectedIndex = n;
			} break;

		case DELETE:
		case BACKSPACE:
			if (n !== false){
				if (nodeMode) deleteNode(n);
				else if (pathMode) {
					if (selectedIndex === -1) selectedIndex = n;
					else {
						deletePath(selectedIndex, n);
						selectedIndex = -1;
					}
					r = aStar();
				}
			}
			break;
	}
}


function nodePressed(){
	for (var i = 0; i < numOfNodes; i++){
		if (nodePositions[i] === undefined) continue;
		var pos = nodePositions[i];
		if(
		   mouseX > pos[0] - NODE_RADIUS*2 
		&& mouseX < pos[0] + NODE_RADIUS*2
		&& mouseY > pos[1] - NODE_RADIUS*2 
		&& mouseY < pos[1] + NODE_RADIUS*2){
			return i;
		}
	}
	return false;
}



function mousePressed(event){
	var n = nodePressed();
	if (nodeMode){
		if (n === false && !deleteMode){
		//CREATING NEW NODE
			nodePositions.push([mouseX, mouseY]);
			nodePaths.push([]);
			numOfNodes++;
			if (startIndex === -1){
				goalIndex  = numOfNodes - 1;
				startIndex = numOfNodes - 1;
			}
			
		} else if (n !== false && deleteMode){
			deleteNode(n);
		} else {
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
		} else {
			selectedIndex = -1;
		}
	}
	r = [];
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
	r = aStar();
}

function addPath(index1, index2){
	if(index1 === index2
	|| nodePaths[index1].includes(index2)
	|| nodePaths[index2].includes(index2)) return;
	
	nodePaths[index1].push(index2);
	nodePaths[index2].push(index1);
	allPaths.push([index1, index2]);
	numOfPaths++;
}



function drawRoute(route){
	for (var j = 0; j < route.length - 1; j++){
		stroke(255,0,0);
		var i = route[j];
		var ni= route[j+1]
		if (nodePositions[i] === undefined || nodePositions[ni] === undefined) return;
		line(nodePositions[i][0], nodePositions[i][1], nodePositions[ni][0], nodePositions[ni][1]);
	}
}

function distanceBetween(nodeIndex1, nodeIndex2){
	var pos1 = nodePositions[nodeIndex1];
	var pos2 = nodePositions[nodeIndex2];
	return ~~Math.sqrt((pos1[0] - pos2[0])*(pos1[0] - pos2[0]) + (pos1[1] - pos2[1])*(pos1[1] - pos2[1]));
}
function aStar(){
	if(goalIndex < 0 || goalIndex >= numOfNodes
	|| startIndex === goalIndex
	|| Number.isNaN(goalIndex)
	|| nodePaths[goalIndex].length === 0) return [];
	var queue 			= [[startIndex]];
	var startDistances 	= [0];
	var extendedList 	= [];
	let extend = (queueIndex) => {
		var route = queue[queueIndex];
		var distanceFromStart = startDistances[queueIndex];
		var lastNodeIndex = route[route.length - 1];
		if (extendedList.includes(lastNodeIndex)){
			queue.splice(queueIndex, 1);
			startDistances.splice(queueIndex, 1);
			return;
		}
		extendedList.push(lastNodeIndex);
		var nextNodeIndexes = nodePaths[lastNodeIndex];
		var count = 1;
		var firstIndex = 0;
		var goalFoundHere = false;
		for (var j = 0; j < nextNodeIndexes.length; j++){
			var i = nextNodeIndexes[j];
			if (route.includes(i)) {
				continue;
			}
			if (i === goalIndex){
				goalFoundHere = true;
			}
			if (count === 1)	firstIndex = i;
			else {
				queue.push(route.concat(i));
				var totDist = distanceFromStart + distanceBetween(lastNodeIndex, i);
				startDistances.push(totDist)
			}
			count++;
		}
		if (count === 1 && !goalFoundHere){
			queue.splice(queueIndex, 1);
			startDistances.splice(queueIndex, 1);
			return;
		}
		route.push(firstIndex);
		startDistances[queueIndex] += distanceBetween(lastNodeIndex, firstIndex);
	}
	let search = () => {
		var j = 0;
		while (true){
			var shortestIndex = -1;
			var shortestDistance = Infinity;
			for (var i = 0; i < queue.length; i++){
				var route = queue[i];
				var lastNodeIndex = route[route.length - 1];
				var totDist = startDistances[i] + distanceBetween(lastNodeIndex, goalIndex)
				if (totDist < shortestDistance){
					shortestIndex = i;
					shortestDistance = totDist; 
				}
			}
			if (queue[shortestIndex][queue[shortestIndex].length - 1] === goalIndex){
				return queue[shortestIndex];
			}
			extend(shortestIndex);
			if (queue.length === 0){
				return []
			}
			j++; 
		}
	}
	return search();
}

