// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  ============================ PRE-ART SETUP =================================

var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


window.onload = function() {
  document.getElementById("loader").style.display="none"
  c.fillStyle = BACKGROUND_COLOR;
  c.fillRect(0,0,innerWidth,innerHeight);
  c.fillStyle = FONT_COLOR;
  c.font = FONT;
  c.textAlign = "center";
  c.fillText(VERSION, canvas.width/2, canvas.height/2);
  document.getElementById("sidebar").style.backgroundColor = SIDEBAR_COLOR;
}
// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// ============================= DEFINE VARIABLES ==============================

// LOGISTICAL VARIABLES
var sidebarViewable = false;
var mouseDown = false;
var mousePosX = 0;
var mousePosY = 0;
var circleArray = [];
// CONSTANTS
const VERSION = "Gravitational Testing Chamber";
const BACKGROUND_COLOR = "#222831"; //"#363062""#112031";
const FONT_COLOR = "#476072"; //"#345B63""#827397";
const FONT = "72px Noto Sans";
//const BALL_COLORS = ["#CA3E47","#FAF9F6","#E9D5DA"]; NOT CURRENTLY USED
const SIDEBAR_COLOR = "#126E82";//EE6F57,9C3D54,9D84B7,4D4C7D,126E82,EB596E,
const FRICTIONAL_PENALTY = 0.98;
const ROOF_WIDTH = 5;
// SLIDER VALUES === NOTE: I'm naming these variables that are determined by the
//                         sliders and used in the simulation with underscores
//                         rather than camelCase because these are special
//                         variables that I want to keep track of while coding
var mouse_gravity_radius = 200;
var mouse_gravity_strength = 1.5;
var gravity_acceleration = 0.5;// 0.5 default;
var roof_closed = false; // default false (open roof)
var ball_radius = 15; // default 15
var number_of_balls = 50; // default 50 balls
var ball_bounciness = 0.7;// default 0.7

// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// ======================= HANDLE HTML AND EVENTS HERE =========================

// HANDLE SLIDERS CHANGE HERE
numBallsSlider.onchange = function() {
  number_of_balls = parseInt(this.value);
  removeBalls(number_of_balls);
  initializeBalls(number_of_balls);
}

ballRadiusSlider.onchange = function() {
  ball_radius = parseInt(this.value);
  for (let i = 0; i < circleArray.length; i++) {
    circleArray[i].radius = ball_radius;
  }
}

ballBouncinessSlider.onchange = function() {
  ball_bounciness = parseFloat(this.value);
}

gravitySlider.onchange = function() {
  gravity_acceleration = parseFloat(this.value);
}

mouseGravitySlider.onchange = function() {
  mouse_gravity_strength = parseFloat(this.value);
}

mouseRadiusSlider.onchange = function() {
  mouse_gravity_radius = parseFloat(this.value);
}

// EVENT LISTENERS
canvas.addEventListener("mousedown", event => {
	mouseDown = true;
	mousePosX = event.clientX - canvas.clientLeft;
	mousePosY = event.clientY - canvas.clientTop;
  sidebarViewable = false;
  document.getElementById("sidebar").style.left = "-300px";
});

window.addEventListener("mousemove", event => {
	mousePosX = event.clientX - canvas.clientLeft;
	mousePosY = event.clientY - canvas.clientTop;
});

window.addEventListener("mouseup", event => {
	mouseDown = false;
});

window.addEventListener("resize", resizeCanvas);
function resizeCanvas() {
	canvas.height = document.documentElement.clientHeight;
	canvas.width = document.documentElement.clientWidth;
}

var arrowButton = document.getElementById("arrowButton");
arrowButton.addEventListener("mouseover", event => {
  document.getElementById("sidebar").style.left = "0px";
});

canvas.addEventListener("mouseover", event => {
  document.getElementById("sidebar").style.left = "-300px";
});

// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// ======================== CREATING THE CIRCLE CLASS ==========================

function Circle(x, y, dx) {
  this.x = x;
  this.y = y;
  this.dy = 0.0;
  this.dx = dx;
  this.ddx = 0.0;
  this.ddy = 0.0;
  this.radius = ball_radius;
  this.color = getRandomColor(); //BALL_COLORS[Math.floor(Math.random()*BALL_COLORS.length)];

  this.draw = function() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
    c.strokeStyle = this.color;
    c.stroke();
    c.fillStyle = this.color;
    c.fill();
  }

  // The Update function needs to account for the physics of the simulation
  this.update = function() {
    // First update Acceleration
    if (mouseDown) {
      var dist = Math.sqrt( ((this.x - mousePosX)**2) + ((this.y - mousePosY)**2) );
      if (dist <= mouse_gravity_radius * 2) { // 3 chosen arbitrarily as a distance away where balls should not be affected
        let gravForce = mouse_gravity_strength / Math.max(1, ((dist/mouse_gravity_radius)**2));
        let theta = Math.atan(Math.abs(mousePosY - this.y) / Math.abs(mousePosX - this.x));
        if (mousePosY > this.y) {
          this.ddy = (Math.sin(theta) * gravForce);
        } else {
          this.ddy = (-1 * Math.sin(theta) * gravForce);
        }
        if (mousePosX > this.x) {
          this.ddx = (Math.cos(theta) * gravForce);
        } else {
          this.ddx = (-1 * Math.cos(theta) * gravForce);
        }
        if (dist > mouse_gravity_radius) {
          this.ddy += gravity_acceleration;
        }
      } else {
        this.ddx = 0.0;
        this.ddy = gravity_acceleration;
      }
    } else {
      this.ddx = 0.0;
      this.ddy = gravity_acceleration;
    }

    // Now update velocities
    if (Math.abs(this.dx) < 0.01) { //0.01 just some small number
      this.dx = 0.0;
    }
    if (Math.abs(this.dy) < 0.01) { //0.01 just some small number
      this.dy = 0.0;
    }
    this.dx += this.ddx;
    this.dy += this.ddy;

    // Now update position of ball and account for walls
    const BOUNCE_CHAOS = 0.1;
    this.x += this.dx;
    this.y += this.dy;
    if (this.x + this.radius >= innerWidth) {
      this.x = innerWidth - this.radius;
      this.dx = -this.dx * (ball_bounciness + (Math.random() * BOUNCE_CHAOS));
    }
    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.dx = -this.dx * (ball_bounciness + (Math.random() * BOUNCE_CHAOS));
    }
    if (this.y + this.radius >= innerHeight) {
      this.y = innerHeight - this.radius;
      this.dy = -this.dy * (ball_bounciness + (Math.random() * BOUNCE_CHAOS));
      this.dx = this.dx * FRICTIONAL_PENALTY;
    }
    if (roof_closed && this.y - this.radius <= ROOF_WIDTH) {
      this.y = this.radius + ROOF_WIDTH;
      this.dy = -this.dy * (ball_bounciness + (Math.random() * BOUNCE_CHAOS));
    }
    this.draw();
  } // End update function

}

// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// ====================== CREATING AN ARRAY OF CIRCLES =========================

// numBalls here represents how many balls to end with
// Eg: if you have 100 balls and run removeBalls(30),
// then 70 balls will be deleted to reach 30.
function removeBalls(numBalls) {
  for (var i = circleArray.length; i > numBalls; i--) {
    circleArray.pop();
  }
}

// again, numBalls here should be the final length of circleArray
// Eg: circleArray has 30 balls, and you run initializeBalls(100),
// then 70 balls will be pushed
function initializeBalls(numBalls) {
  for (var i = circleArray.length; i < numBalls; i++) {
    var x = Math.random() * (innerWidth - ball_radius * 2) + ball_radius;
    var y = Math.random() * (innerHeight - ball_radius * 2) + ball_radius;
    var dx = (Math.random() - 0.5) * 20;
    circleArray.push(new Circle(x,y,dx));
  }
}

function reInitializeBalls() {
  removeBalls(0);
  initializeBalls(number_of_balls)
}

initializeBalls(number_of_balls);

// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// =========================== ANIMATING THE PICTURE ===========================

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0,0,innerWidth,innerHeight);
  c.fillStyle = BACKGROUND_COLOR;
  c.fillRect(0,0,innerWidth,innerHeight);
  c.fillStyle = FONT_COLOR;
  c.font = FONT;
  c.textAlign = "center";
  c.fillText(VERSION, canvas.width/2, canvas.height/2);

  for (var i = 0; i < number_of_balls; i++) {
    circleArray[i].update();
  }
}

animate();

// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// ========================= FUNCTIONS USED BY PROGRAM =========================

function getRandomColor() {
  let rgb = [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)];
  let min = 0;
  let max = 0;
  for (let i = 0; i < 3; i++) {
    if (rgb[i] < rgb[min]){
      min = i;
    }
    if (rgb[i] > rgb[max]) {
      max = i;
    }
  }
  var saturation = Math.max(Math.floor((rgb[max] - rgb[min]) * 0.10), 20);
  if (rgb[min] - saturation < 0) {
    saturation = rgb[min];
  }
  if (rgb[max] + saturation > 255) {
    saturation = 255 - rgb[max];
  }
  rgb[min] = rgb[min] - saturation;
  rgb[max] = rgb[max] + saturation;
  rgb[0] = Math.min(rgb[0] + 80, 255);
  rgb[1] = Math.min(rgb[1] + 80, 255);
  rgb[2] = Math.min(rgb[2] + 80, 255);
  let redStr = (+rgb[0]).toString(16);
	let greenStr = (+rgb[1]).toString(16);
	let blueStr = (+rgb[2]).toString(16);
	let newCode = "#";
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
	return newCode;
}

function toggleSidebar() {
  sidebarViewable = !sidebarViewable;
  if (sidebarViewable) {
    document.getElementById("sidebar").style.left = "0px";
  } else {
    document.getElementById("sidebar").style.left = "-300px";
  }
}

function toggleRoof() {
  roof_closed = !roof_closed;
  var roofLeft = document.querySelector(".left");
  var roofRight = document.querySelector(".right");
  console.log(roofLeft);
  if (roof_closed) {
    roofLeft.style.left = "0%";
    roofRight.style.left = "50%";
  } else {
    roofLeft.style.left = "-50%";
    roofRight.style.left = "100%";
  }
}
