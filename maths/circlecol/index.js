class Circle {
	constructor(centerX, centerY, radius, id) {
		this.centerX = centerX;
		this.centerY = centerY;
		this.radius = radius;
		this.id = id;

		this.velocityX = 0;
		this.velocityY = 0;

		this.accelerationX = 0;
		this.accelerationY = 0;
		this.mass = radius * 10.0;
	};

	overlap(other) {
		let dX = (this.centerX - other.centerX);
		let dY = (this.centerY - other.centerY);

		let total = this.radius + other.radius;
		let distance = dX * dX + dY * dY;
		return distance <= total * total;
	};

	overlapWithPoint(x, y) {
		let squareRadius = this.radius * this.radius;

		let dX = (x - this.centerX);
		let dY = (y - this.centerY);

		let distance = dX * dX + dY * dY;
		return distance <= squareRadius;
	};
};

const MAX_CIRCLES = 10;
const SCREEN_WIDTH = 160;
const SCREEN_HEIGHT = 120;

let circles = [];
let collidingCircles = [];
let currentCircle = null;

function distance(x1, y1, x2, y2) {
	let dX = (x1 - x2);
	let dY = (y1 - y2);
	return Math.sqrt(dX * dX + dY * dY);
}

function addCircle(x, y, radius) {
	circles.push(new Circle(
		x, y, radius, circles.length
	));
}

function randomInRange(min, max) {
	return min + Math.random() * (max - min + 1);
}

function preload() {

}

function setup() {
	// let radius = 8.0;

	// addCircle(SCREEN_WIDTH * 0.25, SCREEN_HEIGHT * 0.5, radius);
	// addCircle(SCREEN_WIDTH * 0.75, SCREEN_HEIGHT * 0.5, radius);

	for (i = 0; i < MAX_CIRCLES; i++) {
		addCircle(
			Math.random() * SCREEN_WIDTH,
			Math.random() * SCREEN_HEIGHT,
			Math.random() * 16 + 2
		);
	}

	//pixelDensity(8);
	createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
	frameRate(30);
}

function draw() {
	let dt = frameRate() / 1000.0;

	clear();
	background(0);

	update(dt);

	// RENDER
	noFill();
	stroke(255);

	for (i = 0; i < circles.length; i++) {
		let currentCircle = circles[i];
		drawCircle(currentCircle);
	}

	noFill();
	stroke(255, 0, 0);

	for (i = 0; i < collidingCircles.length; i++) {
		let ball = collidingCircles[i][0];
		let target = collidingCircles[i][1];
		drawLine(ball, target);
	}

	if (currentCircle != null && mouseButton == RIGHT) {
		noFill();
		stroke(0, 0, 255);
		line(
			currentCircle.centerX,
			currentCircle.centerY,
			mouseX,
			mouseY
		);
	}

}

function drawCircle(currentCircle) {
	circle(currentCircle.centerX, currentCircle.centerY, currentCircle.radius * 2);

	let angle = Math.atan2(currentCircle.velocityX, currentCircle.velocityX);

	line(
		currentCircle.centerX,
		currentCircle.centerY,
		currentCircle.centerX + Math.cos(angle) * currentCircle.radius,
		currentCircle.centerY + Math.sin(angle) * currentCircle.radius
	);

	textSize(4);
	text(
		currentCircle.id + "",
		currentCircle.centerX - 2,
		currentCircle.centerY - 2
	);
}

function drawLine(c1, c2) {
	line(
		c1.centerX,
		c1.centerY,
		c2.centerX,
		c2.centerY
	);
}

function update(dt) {
	collidingCircles = [];

	for (i = 0; i < circles.length; i++) {
		let circle = circles[i];

		circle.accelerationX = -circle.velocityX * 0.8;
		circle.accelerationY = -circle.velocityY * 0.8;

		circle.velocityX += circle.accelerationX * dt;
		circle.velocityY += circle.accelerationY * dt;

		circle.centerX += circle.velocityX * dt;
		circle.centerY += circle.velocityY * dt;

		if (circle.centerX < 0) {
			circle.centerX += SCREEN_WIDTH;
		}
		if (circle.centerX >= SCREEN_WIDTH) {
			circle.centerX -= SCREEN_WIDTH;
		}

		if (circle.centerY < 0) {
			circle.centerY += SCREEN_HEIGHT;
		}
		if (circle.centerY >= SCREEN_HEIGHT) {
			circle.centerY -= SCREEN_HEIGHT;
		}

		let dX = circle.velocityX;
		let dY = circle.velocityY;
		if (dX * dX + dY * dY < 1) {
			circle.velocityX = 0;
			circle.velocityY = 0;
		}

	}

	if (mouseButton == LEFT && currentCircle != null) {
		currentCircle.centerX = mouseX;
		currentCircle.centerY = mouseY;
	}

	for (i = 0; i < circles.length; i++) {
		let circleI = circles[i];
		for (j = 0; j < circles.length; j++) {
			let circleJ = circles[j];
			if (i != j && circleI.id != circleJ.id) {
				if (circleI.overlap(circleJ)) {
					collidingCircles.push([circleI, circleJ]);
					let currentDistance = distance(
						circleI.centerX,
						circleI.centerY,
						circleJ.centerX,
						circleJ.centerY
					);
					if (currentDistance != 0) {
						let overlap = 0.5 * (currentDistance - (circleI.radius + circleJ.radius));

						let deltaX = (circleI.centerX - circleJ.centerX) / currentDistance;
						let deltaY = (circleI.centerY - circleJ.centerY) / currentDistance;

						circleI.centerX -= overlap * deltaX;
						circleI.centerY -= overlap * deltaY;

						circleJ.centerX += overlap * deltaX;
						circleJ.centerY += overlap * deltaY;
					}
				}
			}
		}
	}

 	// https://en.wikipedia.org/wiki/Elastic_collision
	for (i = 0; i < collidingCircles.length; i++) {
		let ball = collidingCircles[i][0];
		let target = collidingCircles[i][1];

		// Distance
		let dist = distance(ball.centerX, ball.centerY, target.centerX, target.centerY);

		// Normal
		let nX = (ball.centerX - target.centerX) / dist;
		let nY = (ball.centerY - target.centerY) / dist;

		// Tanget
		let tX = -nY;
		let tY = nX;

		// Dot Product Tangent
		let dpTan1 = ball.velocityX * tX + ball.velocityY * tY;
		let dpTan2 = target.velocityX * tX + target.velocityY * tY;

		// Dot Product Normal
		let dpNorm1 = ball.velocityX * nX + ball.velocityY * nY;
		let dpNorm2 = target.velocityX * nX + target.velocityY * nY;

		// Conservation of the momentum in 1D
		// Elastic collision
		let m1 = (dpNorm1 * (ball.mass - target.mass) + 2.0 * target.mass * dpNorm2) / (ball.mass + target.mass);
		let m2 = (dpNorm2 * (target.mass - ball.mass) + 2.0 * ball.mass * dpNorm1) / (ball.mass + target.mass);

		ball.velocityX = tX * dpTan1 + nX * m1;
		ball.velocityY = tY * dpTan1 + nY * m1;

		target.velocityX = tX * dpTan2 + nX * m2;
		target.velocityY = tY * dpTan2 + nY * m2;

	}
}

function mousePressed() {
	currentCircle = null;
	for (i = 0; i < circles.length; i++) {
		let circle = circles[i];
		if (circle.overlapWithPoint(mouseX, mouseY)) {
			currentCircle = circle;
			break;
		}
	}

	return false;
}

function mouseReleased() {
	if (mouseButton == RIGHT && currentCircle != null) {
		currentCircle.velocityX = 5.0 * (currentCircle.centerX - mouseX);
		currentCircle.velocityY = 5.0 * (currentCircle.centerY - mouseY);
	}
	currentCircle = null;
	return false;
}