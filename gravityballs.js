
//  ~~~~~~~~~~~~~~~~~~~~~~~~~~ PRE-ART SETUP ~~~~~~~~~~~~~~~~~~~~~~~~~~

var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var mouseDown = false;
var mousePosX = 0;
var mousePosY = 0;

// ~~~~~~~~~~~~~~~~~~~~~~~ DEFINE VARIABLES ~~~~~~~~~~~~~~~~~~~~~~~~~~
const VERSION = "Grav Test Beta v1.1";
const MOUSE_GRAVITY_RADIUS = 250;
const MOUSE_GRAVITY_STRENGTH = 5;
const GRAVITY_ACCELERATION = 0.5;
//const GRAVITY_ACCELERATION = 0.0;
var roofClosed = true;

//  ~~~~~~~~~~~~~~~~~~~~~ CREATING THE CIRCLE CLASS ~~~~~~~~~~~~~~~~~~~
function Circle(x,y,dx,radius){
  this.x = x;
  this.y = y;
  this.dx = 0.0;
  this.dx = dx;
  //IF YOU DECIDE TO CHANGE THE VALUE OF GRAVITY
  //YOU HAVE TO GO INTO THE UPDATE FUNC AND CHANGE
  //ANY RELEVANT VALUES (THOSE THAT ARE ALSO THOSE
  //THE VALUE OF THE OLD GRAVITY) TO THE NEW GRAV
  this.ddy = GRAVITY_ACCELERATION;
  this.dy=0.0;
  this.radius = radius;

  this.draw = function(){
    c.beginPath();
    c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
    c.strokeStyle = 'blue';
    c.stroke();
    c.fill();
  }

  // Update the position, velocity, acceleration, and other relevant properties of a moving ball here
  this.update = function(){

	const FRICTIONAL_PENALTY_BOUNCE = 0.8;
	const FRICTIONAL_PENALTY_X = 0.98;
    this.x+=this.dx;
    this.y+=this.dy;
    this.dy+=this.ddy;

    if(this.x+this.radius>=innerWidth || this.x-this.radius<0){
      this.dx = -this.dx * FRICTIONAL_PENALTY_BOUNCE;
    }
    if(this.y+this.radius >= innerHeight) {
      //CHANGE BELOW WITH GRAV
      this.dy = -Math.abs(this.dy) * FRICTIONAL_PENALTY_BOUNCE;
      this.dx = this.dx * FRICTIONAL_PENALTY_X;
    }
	if (roofClosed && this.y - this.radius <= 0) {
		this.dy = -this.dy;
	}
    //CHANGE BELOW WITH GRAV
    if(Math.abs(this.dy)<.5){
      this.dy=0;
    } else {
		this.dy += this.ddy;
	}
    if(this.dy==0){
      this.dx = this.dx*0.999;
    }
    if(Math.abs(this.dx)<0.05){
      this.dx = 0;
    }

	//UPDATE GRAV WITH MOUSE GRAVITY
	if (mouseDown){
		var dist = Math.sqrt( ((this.x - mousePosX)**2) + ((this.y - mousePosY)**2) );
		if (dist < MOUSE_GRAVITY_RADIUS) {
			// APPLY GRAVITY TO THIS BALL BASED ON DISTANCE TO CURSOR
			var xDist = mousePosX - this.x;
			this.dx += (xDist/MOUSE_GRAVITY_RADIUS) * MOUSE_GRAVITY_STRENGTH;
			var yDist = mousePosY - this.y;
			this.dy += (yDist/MOUSE_GRAVITY_RADIUS) * MOUSE_GRAVITY_STRENGTH;

			// APPLY A LITTLE CHAOS INTO THE DIRECTION
			/*
			let randomPosOrNeg = Math.random() < 0.5 ? -1 : 1;
			var chaosStrength = 0.007;
			var perpendicular = (-1 * (mousePosX - this.x)) / (mousePosY - this.y);
			this.dx += (mousePosX - this.x) * chaosStrength * randomPosOrNeg;
			this.dy += (mousePosY - this.y) * chaosStrength * randomPosOrNeg;
			*/

			var chaosStrength = 1;
			let randomPosOrNeg = Math.random() < 0.5 ? -1 : 1;
			this.x += randomPosOrNeg * chaosStrength;
			randomPosOrNeg = Math.random() < 0.5 ? -1 : 1;
			this.y += randomPosOrNeg * chaosStrength;

		}
	}
	// CHECK TO ENSURE BALLS DONT SINK INTO THE FLOOR OR WALLS
	if (this.y+this.radius > innerHeight && this.dy > 0) {
		this.y = innerHeight - this.radius;
	}
	//if (this.x + this.radius > innerWidth && this.dx > 0) {
	//	this.dx = -this.dx;
	//}
	if (this.x - this.radius < 0 && this.dx < 0){
		this.x = this.radius + 1;
	}
	if (roofClosed) {
		if (this.y - this.radius < 0 & this.dy < 0) {
			this.y = this.radius;
		}
	}

    this.draw();
  }

}

// ~~~~~~~~~~~~~~~~~~~~~~~~ END CIRCLE CLASS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//  ~~~~~~~~~~~~~~~~~~ CREATING AN ARRAY OF CIRCLES ~~~~~~~~~~~~~~~~~~~~~~
var circleArray = [];

for(var i=0;i<100;i++){
  var radius = 15;
  var x = Math.random() * (innerWidth-radius*2)+radius;
  var y = Math.random() * (innerHeight-radius*2)+radius;
  var dx = (Math.random()-0.5)*20;
  //var dy = (Math.random()-0.5)*8;

  circleArray.push(new Circle(x,y,dx,radius));
}


//  ~~~~~~~~~~~~~~~~~~~~~~ ANIMATING THE PICTURE ~~~~~~~~~~~~~~~~~~~~~~~~~~
function animate(){
  requestAnimationFrame(animate);
  c.clearRect(0,0,innerWidth,innerHeight);
  c.font = "72px Noto Sans";
  c.textAlign = "center";
  c.fillText(VERSION, canvas.width/2, canvas.height/2);

  for(var i=0; i<circleArray.length; i++){
    circleArray[i].update();
  }
}
animate();


// ADD GRAVITY ON MOUSE HOLD DOWN
window.addEventListener("mousedown", event => {
	mouseDown = true;
	mousePosX = event.clientX - canvas.clientLeft;
	mousePosY = event.clientY - canvas.clientTop;
});

window.addEventListener("mousemove", event => {
	mousePosX = event.clientX - canvas.clientLeft;
	mousePosY = event.clientY - canvas.clientTop;
});

window.addEventListener("mouseup", event => {
	mouseDown = false;
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~ HANDLE EVENT LISTENERS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
	canvas.height = document.documentElement.clientHeight;
	canvas.width = document.documentElement.clientWidth;
}
