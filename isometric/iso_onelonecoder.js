class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	};
}

function toScreen(vector, origin, tileSize) {
	return new Vector(
		(origin.x * tileSize.x) + (vector.x - vector.y) * (tileSize.x / 2),
		(origin.y * tileSize.y) + (vector.x + vector.y) * (tileSize.y / 2)
	);
}

function cartesianToIsometric(cartesian) {
	return new Vector(
		cartesian.x - cartesian.y,
		(cartesian.x + cartesian.y) / 2
	);
}

function isometricToCartesian(isometric) {
	return new Vector(
		(2 * isometric.y + isometric.x) / 2,
		(2 * isometric.y - isometric.x) / 2
	);
}

function tile(vector, width, height) {
	return new Vector(
		Math.floor(vector.x / width),
		Math.floor(vector.y / height)
	);
}

function offset(vector, width, height) {
	return new Vector(
		vector.x % width,
		vector.y % height
	);
}

// IN GAME

let worldSize = new Vector(14, 10);
let tileSize = new Vector(40, 20);
let origin = new Vector(5, 1);

let worldMap = new Array(new Array());

let isometricImage;
let mouseIsPressed;

function preload() {
	isometricImage = loadImage("assets/isometric_demo.png");
}

/**
 *
 * 	index = 0 --> 0, 0 // height 20
 *	index = 1 --> 0, 1 // height 20
 *	index = 2 --> 0, 2 // height 20
 *	index = 3 --> 1, 0 // height 40
 *	index = 4 --> 1, 1 // height 40
 *	index = 5 --> 1, 2 // height 40
 */
function drawIsometricImage(index, position) {
	var cartesian = new Vector(position.x, position.y);
	if (index < 3) {
		cartesian.y += 20;
		//iso = cartesianToIsometric(iso.x, iso.y + 20);
		image(
			isometricImage,
			cartesian.x,
			cartesian.y,
			40,
			20,
			index * 40,
			0,
			39,
			20
		)
	} else {
		image(
			isometricImage,
			cartesian.x,
			cartesian.y,
			40,
			40,
			(index - 3) * 40,
			21,
			40,
			40
		)
	}
}

function drawSprite(position, width, height, startX, startY) {
	/*
	image(
		isometricImage,
		position.x,
		position.y,
		width,
		height,
		startX,
		startY-1,
		width,
		height+1
	)
	*/
	/*
	image(
		isometricImage,
		0,
		0,
		tileSize.x * 5,
		tileSize.y * 5
	);
	*/
	image(
		isometricImage,
		position.x,
		position.y,
		width,
		height,
		startX,
		startY,
		width,
		height
	);
}

function setup() {
	for (let row = 0; row < worldSize.y; row++) {
		worldMap[row] = new Array();
		for (let col = 0; col < worldSize.x; col++) {
			worldMap[row][col] = 0;
		}
	}

	createCanvas(520, 480);
	frameRate(30);
	// console.log(isometricImage);
	// console.log(isometricImage.width);
	// console.log(isometricImage.height);
}

function draw() {
	clear();
	background(255);

	let mousePosition = new Vector(Math.floor(mouseX), Math.floor(mouseY));
	let mouseCell = tile(mousePosition, tileSize.x, tileSize.y);
	let mouseOffset = offset(mousePosition, tileSize.x, tileSize.y);

	let pixel = isometricImage.get(
		120 + mouseOffset.x,
		mouseOffset.y
	);

	let selected = new Vector(
		(mouseCell.y - origin.y) + (mouseCell.x - origin.x),
		(mouseCell.y - origin.y) - (mouseCell.x - origin.x)
	);

	if (pixel[0] == 255 && pixel[1] == 0 && pixel[2] == 0) { // RED
		selected.x--;
	} else if (pixel[0] == 0 && pixel[1] == 0 && pixel[2] == 255) { // BLUE
		selected.y--;
	} else if (pixel[0] == 0 && pixel[1] == 255 && pixel[2] == 0) { // GREEN
		selected.y++;
	} else if (pixel[0] == 255 && pixel[1] == 255 && pixel[2] == 0) { // YELLOW
		selected.x++;
	}

	if (mouseIsPressed) {
		mouseIsPressed = false;
		if (selected.x >= 0 && selected.x < worldSize.x &&
			selected.y >= 0 && selected.y < worldSize.y) {
			worldMap[selected.y][selected.x]++;
			worldMap[selected.y][selected.x] %= 6;
		}
	}

	for (let row = 0; row < worldSize.y; row++) {
		for (let col = 0; col < worldSize.x; col++) {

			let vector = new Vector(col, row);
			let position = toScreen(vector, origin, tileSize);

			/*
			let position = cartesianToIsometric(
				new Vector(
					(origin.x + col) * tileSize.x / 2,
					(origin.y + row) * tileSize.y / 2
				)
			);
			*/

			let tile = worldMap[row][col];

			if (tile == 0) {
				drawSprite(position, 40, 20, 40, 0);
			} else if (tile == 1) {
				drawSprite(position, 40, 20, 80, 0);
			} else if (tile == 2) {
				position.y -= tileSize.y;
				drawSprite(position, 40, 40, 0, 20);
			} else if (tile == 3) {
				position.y -= tileSize.y;
				drawSprite(position, 40, 40, 40, 20);
			} else if (tile == 4) {
				drawSprite(position, 40, 20, 80, 40);
			} else if (tile == 5) {
				drawSprite(position, 40, 20, 120, 40);
			}

		}
	}

	let selectedWorld = toScreen(selected, origin, tileSize);
	drawSprite(selectedWorld, 40, 20, 0, 0);

	//noFill()
	//stroke(255, 0, 0, 255);
	//rect(mouseCell.x * tileSize.x, mouseCell.y * tileSize.y, tileSize.x, tileSize.y);

	textSize(12);
	noStroke();
	fill(0, 0, 0, 255);

	text(
		"Mouse: x = " + mousePosition.x + " ; y = " + mousePosition.y,
		4,
		15
	);

	text(
		"Cell: x = " + mouseCell.x + " ; y = " + mouseCell.y,
		4,
		30
	);

	text(
		"Selected Cell: x = " + selected.x + " ; y = " + selected.y,
		4,
		45
	);


	/*
		drawIsometricImage(0, new Vector(0, 40));
		drawIsometricImage(1, new Vector(80, 40));
		drawIsometricImage(2, new Vector(160, 40));
		drawIsometricImage(3, new Vector(240, 40));
		drawIsometricImage(4, new Vector(360, 40));
		drawIsometricImage(5, new Vector(420, 40));
	*/
}

function mousePressed() {
	mouseIsPressed = true;
}