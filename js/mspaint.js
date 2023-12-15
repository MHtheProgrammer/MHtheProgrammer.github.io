// JavaScript source code

// Initialize a stack for the undo / redo commands
// Things in the undoStack will appear on screen, and if an undo is done, they will be moved to the redo stack
// In that redo stack they will not appear on screen, from here we can move them back into the undo stack on a redo
// the redo stack clears after a new thing is added to the screen
var undoStack = [];
var redoStack = [];
var mPosX = 0;
var mPosY = 0;
var mLastX = 0;
var mLastY = 0;
var strokeStyle = "black";
var width = 5;
var height = 1;
var currentToolArray = [];
var action = "brushTool";
var red = 0;
var blue = 0;
var green = 0;
var colorCode = "#000000";
var backgroundColor = "#FFFFFF";
var fillBoolean = false;
var oldImageObject;
var lastButton = "brushButton";

//Adding a comment to JS file so git will do an actual redeploy of the site, ignore me!

// Mouse Active is a boolean that represents whether the mouse is being held down,
// and therefore whether things should happen
var mouseActive = false;

var canvas;
var ctx;
var edges;

window.addEventListener("load", () => {
	canvas = document.querySelector("#canvas");
	ctx = canvas.getContext("2d");
	edges = canvas.getBoundingClientRect();
	canvas.height = document.documentElement.clientHeight - edges.top - 16; //margin set to 8 in HTML file, 16 is double since 2 sides
	canvas.width = document.documentElement.clientWidth - edges.left - 16; //margin set to 8 in HTML file, 16 is double since 2 sides
	oldImageObject = ctx.getImageData(0,0,canvas.width,canvas.height);
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,canvas.width,canvas.height);
});

window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
	canvas.height = document.documentElement.clientHeight - edges.top - 16;
	canvas.width = document.documentElement.clientWidth - edges.left - 16;
	drawStack();
}

window.addEventListener("mousedown", event => {
	mPosX = event.clientX - edges.left - canvas.clientLeft;
	mPosY = event.clientY - edges.top - canvas.clientTop;
	if (mPosX < 0 || mPosX > canvas.width) {
		return;
	}
	if (mPosY < 0 || mPosY > canvas.height) {
		return;
	}
	mLastX = event.clientX - edges.left - canvas.clientLeft;
	mLastY = event.clientY - edges.top - canvas.clientTop;
	mouseActive = true
	oldImageObject = ctx.getImageData(0,0,canvas.width,canvas.height);
	if (action == "brushTool") {
		currentToolArray.push("brushTool");
		currentToolArray.push(colorCode);
		currentToolArray.push(width);
		currentToolArray.push(mPosX,mPosY);
		brushTool();
	} else if (action == "squareTool") {
		currentToolArray.push("squareTool");
		currentToolArray.push(colorCode);
		currentToolArray.push(width);
		currentToolArray.push(fillBoolean);
		currentToolArray.push(mLastX,mLastY,mPosX,mPosY);
		squareTool();
	} else if (action == "triangleTool") {
		currentToolArray.push("triangleTool");
		currentToolArray.push(colorCode);
		currentToolArray.push(width);
		currentToolArray.push(fillBoolean);
		currentToolArray.push(mLastX,mLastY,mPosX,mPosY);
		triangleTool();
	} else if (action == "pipetteTool") {
		var pixel = ctx.getImageData(mPosX,mPosY,1,1);
		var pixelData = pixel.data;
		document.getElementById("sliderRed").value = pixelData[0];
		red = pixelData[0];
		document.getElementById("sliderGreen").value = pixelData[1];
		green = pixelData[1];
		document.getElementById("sliderBlue").value = pixelData[2];
		blue = pixelData[2];
		updateColorCode();
		changeColorBox();
		mouseActive = false;
	} else if (action == "lineTool") {
		currentToolArray.push("lineTool");
		currentToolArray.push(colorCode);
		currentToolArray.push(width);
		currentToolArray.push(fillBoolean);
		currentToolArray.push(mLastX,mLastY,mPosX,mPosY);
		lineTool();
	} else if (action == "eraserTool") {
		currentToolArray.push("eraserTool");
		currentToolArray.push(backgroundColor);
		currentToolArray.push(width);
		currentToolArray.push(mPosX,mPosY);
		eraserTool();
	} else if (action == "fillTool") {
		currentToolArray.push("fillTool");
		currentToolArray.push(canvas.width);
		currentToolArray.push(canvas.height);
		fillTool();
		//var imageCopy = ctx.createImageData(oldImageObject.width,oldImageObject.height);
		//imageCopy.data.set(oldImageObject.data);
		//currentToolArray.push(imageCopy);
		//mouseActive = false;
		//undoStack.push(currentToolArray);
		//currentToolArray = [];
		//redoStack = [];
	} else if (action == "starTool") {
		currentToolArray.push("starTool");
		currentToolArray.push(colorCode);
		currentToolArray.push(width);
		currentToolArray.push(fillBoolean);
		currentToolArray.push(mLastX,mLastY,mPosX,mPosY);
		triangleTool();
	} else if (action == "watercolorTool") {
		currentToolArray.push("watercolorTool");
		currentToolArray.push(colorCode);
		currentToolArray.push(width);
		currentToolArray.push(mPosX,mPosY);
		ctx.globalAlpha = 0.1;
		brushTool();
	} else if (action == "circleTool") {
		currentToolArray.push("circleTool");
		currentToolArray.push(colorCode);
		currentToolArray.push(width);
		currentToolArray.push(fillBoolean);
		currentToolArray.push(mLastX,mLastY,mPosX,mPosY);
		circleTool();
	}
});

window.addEventListener("mouseup", event => {
	if(mouseActive == true) {
		undoStack.push(currentToolArray);
		currentToolArray = [];
		redoStack = [];
		mouseActive = false;
		ctx.globalAlpha = 1;
	}
});

window.addEventListener("mousemove", event => {
	mPosX = event.clientX - edges.left - canvas.clientLeft;
	mPosY = event.clientY - edges.top - canvas.clientTop;
	if (mouseActive == true) {
		drawController();
	}
});

window.addEventListener("keydown", () => {
	if (event.which == "90") { // 90 is the code for the Z key
		undo();
	}
	if (event.which == "89") { // 89 is the code for the Y key
		redo();
	}
});

document.getElementById("sliderRed").oninput = function(event) {
	red = event.target.value;
	updateColorCode();
	changeColorBox();
};
document.getElementById("sliderGreen").oninput = function(event) {
	green = event.target.value;
	updateColorCode();
	changeColorBox();
};
document.getElementById("sliderBlue").oninput = function(event) {
	blue = event.target.value;
	updateColorCode();
	changeColorBox();
};
document.getElementById("sliderWidth").onchange = function(event) {
	width = event.target.value;
};
document.getElementById("brushButton").onclick = function () {
        action = "brushTool";
		setBold("brushButton");
};
document.getElementById("squareButton").onclick = function () {
        action = "squareTool";
		setBold("squareButton");
};
document.getElementById("triangleButton").onclick = function () {
        action = "triangleTool";
		setBold("triangleButton");
};
document.getElementById("fillButton").onclick = function () {
        fillBoolean = !fillBoolean;
		if(fillBoolean) {
			this.style.fontWeight = "bold";
		} else {
			this.style.fontWeight = "normal";
		}
};
document.getElementById("pipetteButton").onclick = function () {
        action = "pipetteTool";
		setBold("pipetteButton");
};
document.getElementById("lineButton").onclick = function () {
        action = "lineTool";
		setBold("lineButton");
};
document.getElementById("backgroundButton").onclick = function () {
        backgroundColor = colorCode;
		updateEraserInStack();
		drawStack();
};
document.getElementById("eraserButton").onclick = function () {
        action = "eraserTool";
		setBold("eraserButton");
};
document.getElementById("fillToolButton").onclick = function () {
        action = "fillTool";
		setBold("fillToolButton");
};
document.getElementById("starButton").onclick = function () {
        action = "starTool";
		setBold("starButton");
};
document.getElementById("circleButton").onclick = function () {
        action = "circleTool";
		setBold("circleButton");
};
document.getElementById("watercolorButton").onclick = function () {
        action = "watercolorTool";
		setBold("watercolorButton");
};
document.getElementById("redColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 237;
	red = 237;
	document.getElementById("sliderGreen").value = 28;
	green = 28;
	document.getElementById("sliderBlue").value = 36;
	blue = 36;
	updateColorCode();
	changeColorBox();
};
document.getElementById("blueColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 63;
	red = 63;
	document.getElementById("sliderGreen").value = 72;
	green = 72;
	document.getElementById("sliderBlue").value = 204;
	blue = 204;
	updateColorCode();
	changeColorBox();
};
document.getElementById("greenColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 34;
	red = 34;
	document.getElementById("sliderGreen").value = 177;
	green = 177;
	document.getElementById("sliderBlue").value = 76;
	blue = 76;
	updateColorCode();
	changeColorBox();
};
document.getElementById("orangeColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 255;
	red = 255;
	document.getElementById("sliderGreen").value = 127;
	green = 127;
	document.getElementById("sliderBlue").value = 39;
	blue = 39;
	updateColorCode();
	changeColorBox();
};
document.getElementById("yellowColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 255;
	red = 255;
	document.getElementById("sliderGreen").value = 242;
	green = 242;
	document.getElementById("sliderBlue").value = 0;
	blue = 0;
	updateColorCode();
	changeColorBox();
};
document.getElementById("lightBlueColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 0;
	red = 0;
	document.getElementById("sliderGreen").value = 162;
	green = 162;
	document.getElementById("sliderBlue").value = 232;
	blue = 232;
	updateColorCode();
	changeColorBox();
};
document.getElementById("purpleColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 163;
	red = 163;
	document.getElementById("sliderGreen").value = 73;
	green = 73;
	document.getElementById("sliderBlue").value = 164;
	blue = 164;
	updateColorCode();
	changeColorBox();
};
document.getElementById("pinkColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 255;
	red = 255;
	document.getElementById("sliderGreen").value = 174;
	green = 174;
	document.getElementById("sliderBlue").value = 201;
	blue = 201;
	updateColorCode();
	changeColorBox();
};
document.getElementById("lightOrangeColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 255;
	red = 255;
	document.getElementById("sliderGreen").value = 201;
	green = 201;
	document.getElementById("sliderBlue").value = 14;
	blue = 14;
	updateColorCode();
	changeColorBox();
};
document.getElementById("beigeColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 239;
	red = 239;
	document.getElementById("sliderGreen").value = 228;
	green = 228;
	document.getElementById("sliderBlue").value = 176;
	blue = 176;
	updateColorCode();
	changeColorBox();
};
document.getElementById("lightGreenColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 181;
	red = 181;
	document.getElementById("sliderGreen").value = 230;
	green = 230;
	document.getElementById("sliderBlue").value = 29;
	blue = 29;
	updateColorCode();
	changeColorBox();
};
document.getElementById("extraLightBlueColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 153;
	red = 153;
	document.getElementById("sliderGreen").value = 217;
	green = 217;
	document.getElementById("sliderBlue").value = 234;
	blue = 234;
	updateColorCode();
	changeColorBox();
};
document.getElementById("cyanColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 112;
	red = 112;
	document.getElementById("sliderGreen").value = 146;
	green = 146;
	document.getElementById("sliderBlue").value = 190;
	blue = 190;
	updateColorCode();
	changeColorBox();
};
document.getElementById("lightPurpleColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 200;
	red = 200;
	document.getElementById("sliderGreen").value = 191;
	green = 191;
	document.getElementById("sliderBlue").value = 231;
	blue = 231;
	updateColorCode();
	changeColorBox();
};
document.getElementById("blackColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 1;
	red = 1;
	document.getElementById("sliderGreen").value = 1;
	green = 1;
	document.getElementById("sliderBlue").value = 1;
	blue = 1;
	updateColorCode();
	changeColorBox();
};
document.getElementById("whiteColorBox").onclick = function () {
	document.getElementById("sliderRed").value = 255;
	red = 255;
	document.getElementById("sliderGreen").value = 255;
	green = 255;
	document.getElementById("sliderBlue").value = 255;
	blue = 255;
	updateColorCode();
	changeColorBox();
};


function drawController() {
	// does whatever is selected, such as brush tool or triangle tool
	if(action == "brushTool") {
		brushTool();
		currentToolArray.push(mPosX, mPosY);
	} else if (action == "squareTool") {
		currentToolArray.pop();
		currentToolArray.pop();
		currentToolArray.push(mPosX, mPosY);
		ctx.putImageData(oldImageObject,0,0);
		squareTool();
	} else if (action == "triangleTool") {
		currentToolArray.pop();
		currentToolArray.pop();
		currentToolArray.push(mPosX, mPosY);
		ctx.putImageData(oldImageObject,0,0);
		triangleTool();
	} else if (action == "lineTool") {
		currentToolArray.pop();
		currentToolArray.pop();
		currentToolArray.push(mPosX, mPosY);
		ctx.putImageData(oldImageObject,0,0);
		lineTool();
	} else if (action == "eraserTool") {
		eraserTool();
		currentToolArray.push(mPosX, mPosY);
	} else if (action == "starTool") {
		currentToolArray.pop();
		currentToolArray.pop();
		currentToolArray.push(mPosX, mPosY);
		ctx.putImageData(oldImageObject,0,0);
		starTool();
	} else if (action == "watercolorTool") {
		brushTool();
		currentToolArray.push(mPosX,mPosY);
	} else if (action == "circleTool") {
		currentToolArray.pop();
		currentToolArray.pop();
		currentToolArray.push(mPosX, mPosY);
		ctx.putImageData(oldImageObject,0,0);
		circleTool();
	}
}


function circleTool() {
	var middle = mix(mLastX,mLastY,mPosX,mPosY,0.5);
	var xRadius = Math.abs(mLastX-mPosX)/2;
	var yRadius = Math.abs(mLastY-mPosY)/2;
	ctx.beginPath();
	ctx.ellipse(middle[0], middle[1], xRadius, yRadius, 0, 0, Math.PI * 2);
	if (fillBoolean) {
		ctx.fillStyle = colorCode;
		ctx.fill();
	} else {
		ctx.lineWidth = width;
		ctx.strokeStyle = colorCode;
		ctx.stroke();
	}
	ctx.closePath();
}

function starTool() {
	var apex = mix(mLastX,mPosY,mPosX,mPosY,0.5);
	var topLeft = mix(mLastX,mLastY,mLastX,mPosY,0.6);
	var topRight = mix(mPosX,mLastY,mPosX,mPosY,0.6);
	var bottomLeft = mix(mLastX,mLastY,mPosX,mLastY,0.2);
	var bottomRight = mix(mLastX,mLastY,mPosX,mLastY,0.8);
	var innerLeftBottom = mix(topLeft[0],topLeft[1],bottomRight[0],bottomRight[1],0.4);
	var innerRightBottom = mix(bottomLeft[0],bottomLeft[1],topRight[0],topRight[1],0.6);
	var botTemp = mix(bottomLeft[0],bottomLeft[1],bottomRight[0],bottomRight[1],0.5);
	var innerBottom = mix(botTemp[0],botTemp[1],apex[0],apex[1],0.2);
	var innerLeftTop = mix(topLeft[0],topLeft[1],topRight[0],topRight[1],0.4);
	var innerRightTop = mix(topLeft[0],topLeft[1],topRight[0],topRight[1],0.6);
	if (fillBoolean) {
		let triArea = new Path2D();
		triArea.moveTo(bottomLeft[0],bottomLeft[1]);
		triArea.lineTo(innerLeftBottom[0],innerLeftBottom[1]);
		triArea.lineTo(topLeft[0],topLeft[1]);
		triArea.lineTo(innerLeftTop[0],innerLeftTop[1]);
		triArea.lineTo(apex[0],apex[1]);
		triArea.lineTo(innerRightTop[0],innerRightTop[1]);
		triArea.lineTo(topRight[0],topRight[1]);
		triArea.lineTo(innerRightBottom[0],innerRightBottom[1]);
		triArea.lineTo(bottomRight[0],bottomRight[1]);
		triArea.lineTo(innerBottom[0],innerBottom[1]);
		triArea.lineTo(bottomLeft[0],bottomLeft[1]);
		triArea.lineTo(innerLeftBottom[0],innerLeftBottom[1]);
		triArea.closePath();
		ctx.fillStyle = colorCode;
		ctx.fill(triArea, 'evenodd');
	} else {
		ctx.beginPath();
		ctx.lineWidth = width;
		ctx.strokeStyle = colorCode;
		ctx.moveTo(bottomLeft[0],bottomLeft[1]);
		ctx.lineTo(innerLeftBottom[0],innerLeftBottom[1]);
		ctx.lineTo(topLeft[0],topLeft[1]);
		ctx.lineTo(innerLeftTop[0],innerLeftTop[1]);
		ctx.lineTo(apex[0],apex[1]);
		ctx.lineTo(innerRightTop[0],innerRightTop[1]);
		ctx.lineTo(topRight[0],topRight[1]);
		ctx.lineTo(innerRightBottom[0],innerRightBottom[1]);
		ctx.lineTo(bottomRight[0],bottomRight[1]);
		ctx.lineTo(innerBottom[0],innerBottom[1]);
		ctx.lineTo(bottomLeft[0],bottomLeft[1]);
		ctx.lineTo(innerLeftBottom[0],innerLeftBottom[1]);
		ctx.stroke();
		ctx.closePath();
	}
}

function fillTool() {
	var pixels = oldImageObject.data;
	var editedArray = new Array((canvas.width*canvas.height*4));
	for (let i = 0; i < editedArray.length; i++) {
		editedArray[i] = false;
	}
	var index = (mPosY * canvas.width * 4) + (mPosX * 4);
	var R = pixels[index];
	var G = pixels[index+1];
	var B = pixels[index+2];
	var visitedArray = new Array(canvas.width * canvas.height);
	for (let i = 0; i < (canvas.width * canvas.height); i++) {
		visitedArray[i] = false;
	}
	var startIndex = (mPosY*canvas.width) + mPosX
	var queue = [];
	queue.push(startIndex);
	while(queue.length != 0) {
		var currPixel = queue.pop();
		visitedArray[currPixel] = true;
		// Check if pixel color matches color were looking for, continue otherwise
		var pixelsIndex = ((currPixel - mPosX) * 4) + (mPosX * 4);
		if (pixels[pixelsIndex] < R-10 || pixels[pixelsIndex] > R+10) {
			continue;
		}
		if (pixels[pixelsIndex+1] < G-10 || pixels[pixelsIndex+1] > G+10) {
			continue;
		}
		if (pixels[pixelsIndex+2] < B-10 || pixels[pixelsIndex+2] > B+10) {
			continue;
		}
		// Fill the pixels
		oldImageObject.data[pixelsIndex] = red;
		editedArray[pixelsIndex] = true;
		oldImageObject.data[pixelsIndex + 1] = green;
		editedArray[pixelsIndex + 1] = true;
		oldImageObject.data[pixelsIndex + 2] = blue;
		editedArray[pixelsIndex + 2] = true;
		/*
		if (oldImageObject.data[pixelsIndex+3] < 5) {
			oldImageObject.data[pixelsIndex+3] = 255;
			editedArray[pixelsIndex + 3] = true;
		}*/
		//oldImageObject.data[pixelsIndex + 3] = 255;
		//add Left neighbor to queue
		if (!(currPixel % canvas.width == 0)) {
			if (!visitedArray[currPixel-1]) {
				queue.push(currPixel-1);
			}
		}
		//add Right neighbor
		if (! ((currPixel+1) % canvas.width == 0) ){
			if (!visitedArray[currPixel+1]) {
				queue.push(currPixel+1);
			}
		}
		//add top neighbor
		if (currPixel - canvas.width > 0) {
			if(!visitedArray[currPixel - canvas.width]) {
				queue.push(currPixel-canvas.width);
			}
		}
		//add bottom neighbor
		if (currPixel + canvas.width < visitedArray.length) {
			if (!visitedArray[currPixel + canvas.width]) {
				queue.push(currPixel+canvas.width);
			}
		}
	}
	var newPixels = ctx.createImageData(oldImageObject.width,oldImageObject.height);
	newPixels.data.set(oldImageObject.data);
	currentToolArray.push(editedArray);
	currentToolArray.push(newPixels);
	ctx.putImageData(oldImageObject,0,0);
}


function eraserTool() {
	var pointDist = distance(mLastX,mLastY,mPosX,mPosY);
	if (pointDist > width/4) {
		var count = Math.floor(pointDist / (width/4));
		for (let i = 0; i < count; i++) {
			var newPoint = mix(mLastX,mLastY,mPosX,mPosY,(i/count));
			ctx.beginPath();
			ctx.arc(newPoint[0],newPoint[1],width,0,2*Math.PI);
			ctx.fillStyle = backgroundColor;
			ctx.fill();
			ctx.closePath();
		}
	}
	ctx.beginPath();
	ctx.arc(mPosX,mPosY,width,0,2*Math.PI);
	ctx.fillStyle = backgroundColor;
	ctx.fill();
	ctx.closePath();
	mLastX = mPosX;
	mLastY = mPosY;
}

function lineTool() {
	// Basically a copy of brush tool minus the updating of mLast
	var pointDist = distance(mLastX,mLastY,mPosX,mPosY);
	if (pointDist > width/4) {
		var count = Math.floor(pointDist / (width/4));
		for (let i = 0; i < count; i++) {
			var newPoint = mix(mLastX,mLastY,mPosX,mPosY,(i/count));
			ctx.beginPath();
			ctx.arc(newPoint[0],newPoint[1],width,0,2*Math.PI);
			ctx.fillStyle = colorCode;
			ctx.fill();
			ctx.closePath();
		}
	}
	ctx.beginPath();
	ctx.arc(mPosX,mPosY,width,0,2*Math.PI);
	ctx.fillStyle = colorCode;
	ctx.fill();
	ctx.closePath();
}

function triangleTool() {
	var midPoint = mix(mLastX,mPosY,mPosX,mPosY,0.5);
	if (fillBoolean) {
		let triArea = new Path2D();
		triArea.moveTo(mLastX,mLastY);
		triArea.lineTo(midPoint[0],midPoint[1]);
		triArea.lineTo(mPosX,mLastY);
		triArea.lineTo(mLastX,mLastY);
		triArea.closePath();
		ctx.fillStyle = colorCode;
		ctx.fill(triArea, 'evenodd');
	} else {
		ctx.beginPath();
		ctx.lineWidth = width;
		ctx.strokeStyle = colorCode;
		ctx.moveTo(mLastX, mLastY);
		ctx.lineTo(midPoint[0],midPoint[1]);
		ctx.lineTo(mPosX, mLastY);
		ctx.lineTo(mLastX, mLastY);
		ctx.lineTo(midPoint[0],midPoint[1]);
		ctx.stroke();
		ctx.closePath();
	}

}

function squareTool() {
	ctx.beginPath();
	ctx.lineWidth = width;
	ctx.strokeStyle = colorCode;
	ctx.moveTo(mLastX, mLastY);
	ctx.lineTo(mPosX, mLastY); // 4,5 -> 6,5
	ctx.lineTo(mPosX, mPosY); // 6,5 -> 6,7
	ctx.lineTo(mLastX, mPosY); // 6,7 -> 4,7
	ctx.lineTo(mLastX, mLastY); // 4,7 -> 4,5
	ctx.lineTo(mPosX, mLastY);
	ctx.stroke();
	if (fillBoolean) {
		ctx.fillStyle = colorCode;
		rectWidth = mPosX - mLastX;
		rectHeight = mPosY - mLastY;
		ctx.fillRect(mLastX, mLastY, rectWidth, rectHeight);
	}
	ctx.closePath();
}

function brushTool() {
	var pointDist = distance(mLastX,mLastY,mPosX,mPosY);
	if (pointDist > width/4) {
		var count = Math.floor(pointDist / (width/4));
		for (let i = 0; i < count; i++) {
			var newPoint = mix(mLastX,mLastY,mPosX,mPosY,(i/count));
			ctx.beginPath();
			ctx.arc(newPoint[0],newPoint[1],width,0,2*Math.PI);
			ctx.fillStyle = colorCode;
			ctx.fill();
			ctx.closePath();
		}
	}
	ctx.beginPath();
	ctx.arc(mPosX,mPosY,width,0,2*Math.PI);
	ctx.fillStyle = colorCode;
	ctx.fill();
	ctx.closePath();
	mLastX = mPosX;
	mLastY = mPosY;
}

function undo() {
	if (undoStack.length == 0) {
		return;
	}
	var topAction = undoStack.pop();
	redoStack.push(topAction);
	drawStack();
}

function redo() {
	if (redoStack.length == 0) {
		return;
	}
	var topAction = redoStack.pop();
	undoStack.push(topAction);
	drawStack();
}

function drawStack() {
	var tempColorCode = colorCode;
	var tempWidth = width;
	var tempLastX = mLastX;
	var tempPosX = mPosX;
	var tempPosY = mPosY;
	var tempLastY = mLastY;
	var tempFill = fillBoolean;
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	for (let i = 0; i < undoStack.length; i++) {
		var currObj = undoStack[i];
		if (currObj[0] == "brushTool") {
			colorCode = currObj[1];
			width = currObj[2];
			ctx.lineWidth = width;
			mLastX = currObj[3];
			mLastY = currObj[4];
			for (let j = 3; j < currObj.length; j+=2) {
				mPosX = currObj[j];
				mPosY = currObj[j+1];
				brushTool();
			}
		} else if (currObj[0] == "squareTool") {
			colorCode = currObj[1];
			width = currObj[2];
			fillBoolean = currObj[3];
			mLastX = currObj[4];
			mLastY = currObj[5];
			mPosX = currObj[6];
			mPosY = currObj[7];
			squareTool();
		} else if (currObj[0] == "triangleTool") {
			colorCode = currObj[1];
			width = currObj[2];
			fillBoolean = currObj[3];
			mLastX = currObj[4];
			mLastY = currObj[5];
			mPosX = currObj[6];
			mPosY = currObj[7];
			triangleTool();
		} else if (currObj[0] == "lineTool") {
			colorCode = currObj[1];
			width = currObj[2];
			fillBoolean = currObj[3];
			mLastX = currObj[4];
			mLastY = currObj[5];
			mPosX = currObj[6];
			mPosY = currObj[7];
			lineTool();
		} else if (currObj[0] == "eraserTool") {
			width = currObj[2];
			ctx.lineWidth = width;
			mLastX = currObj[3];
			mLastY = currObj[4];
			for (let j = 3; j < currObj.length; j+=2) {
				mPosX = currObj[j];
				mPosY = currObj[j+1];
				eraserTool();
			}
		} else if (currObj[0] == "fillTool") {
			//ctx.putImageData(currObj[1],0,0);
			var oldWidth = currObj[1];
			var oldHeight = currObj[2];
			var edited = currObj[3];
			var newPixels = currObj[4];
			console.log(oldWidth,oldHeight,canvas.width,canvas.height);
			oldImageObject = ctx.getImageData(0,0,canvas.width,canvas.height);
			var imageCopy = ctx.createImageData(oldImageObject.width,oldImageObject.height);
			imageCopy.data.set(oldImageObject.data);
			for (let i = 0; i < newPixels.data.length; i++) {
				if (edited[i]) {
					// i is a multiple of 4 since channels
					if (canvas.width < oldWidth && (i/4) % oldWidth > canvas.width ) {
						continue;
					}
					newIndex = (Math.floor(((i/4)/oldWidth)) * (imageCopy.width*4)) + (i % (oldWidth*4));
					imageCopy.data[newIndex] = newPixels.data[i];
				}
			}
			ctx.putImageData(imageCopy,0,0);
		} else if (currObj[0] == "watercolorTool") {
			ctx.globalAlpha = 0.1;
			colorCode = currObj[1];
			width = currObj[2];
			ctx.lineWidth = width;
			mLastX = currObj[3];
			mLastY = currObj[4];
			for (let j = 3; j < currObj.length; j+=2) {
				mPosX = currObj[j];
				mPosY = currObj[j+1];
				brushTool();
			}
			ctx.globalAlpha = 1;
		} else if (currObj[0] == "starTool") {
			colorCode = currObj[1];
			width = currObj[2];
			fillBoolean = currObj[3];
			mLastX = currObj[4];
			mLastY = currObj[5];
			mPosX = currObj[6];
			mPosY = currObj[7];
			starTool();
		} else if (currObj[0] == "circleTool") {
			colorCode = currObj[1];
			width = currObj[2];
			fillBoolean = currObj[3];
			mLastX = currObj[4];
			mLastY = currObj[5];
			mPosX = currObj[6];
			mPosY = currObj[7];
			circleTool();
		}
	}
	colorCode = tempColorCode;
	width = tempWidth;
	mLastX = tempLastX;
	mLastY = tempLastY;
	mPosX = tempPosX;
	mPosY = tempPosY;
	fillBoolean = tempFill;
}

function changeColorBox() {
	const box = document.getElementById("currColorBox");
	box.style.backgroundColor = colorCode;
}

// Updates the variable colorCode (which should be a hex color code like #F4C80A)
// Using the 0-255 values of red blue and green RGB
// colorCode should be updated post function
function updateColorCode() {
	var redStr = (+red).toString(16);
	var greenStr = (+green).toString(16);
	var blueStr = (+blue).toString(16);
	var newCode = "#";
	if(redStr.length<2) {
		newCode = newCode.concat("0");
	}
	newCode = newCode.concat(redStr);
	if(greenStr.length<2) {
		newCode = newCode.concat("0");
	}
	newCode = newCode.concat(greenStr);
	if(blueStr.length<2) {
		newCode = newCode.concat("0");
	}
	newCode = newCode.concat(blueStr);

	colorCode = newCode;
}

function mix(x1,y1,x2,y2,dist) {
	var newX = ((1-dist)*x1) + (dist * x2);
	var newY = ((1-dist)*y1) + (dist * y2);
	var points = [];
	points.push(newX);
	points.push(newY);
	return points;
}

function distance(x1,y1,x2,y2) {
	return Math.sqrt( ((x2-x1)**2) + ((y2-y1)**2) );
}

function updateEraserInStack() {
	for (let i = 0; i < undoStack.length; i++) {
		if (undoStack[i][0] == "eraserTool") {
			undoStack[i][1] = backgroundColor;
		}
	}
}

function setBold(buttonName) {
	var button = document.getElementById(buttonName);
	button.style.fontWeight = 1000;
	var oldButton = document.getElementById(lastButton);
	oldButton.style.fontWeight = "normal";
	lastButton = buttonName;
}
