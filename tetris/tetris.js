// GAME LOGIC
const TILE_SIZE = 32;

const FIELD_WIDTH = 12;
const FIELD_HEIGHT = 18;

const WIDTH = TILE_SIZE * FIELD_WIDTH;
const HEIGHT = TILE_SIZE * FIELD_HEIGHT;

const SHAPE_SIZE = 4;

let SPEED_TIME = 20;

let shapes = [
	// I figure
	[
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0]
	],
	// O figure
	[
		[0, 0, 0, 0],
		[0, 1, 1, 0],
		[0, 1, 1, 0],
		[0, 0, 0, 0]
	],
	// S figure
	[
		[0, 1, 0, 0],
		[0, 1, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 0]
	],
	// Inverted S figure
	[
		[0, 0, 1, 0],
		[0, 1, 1, 0],
		[0, 1, 0, 0],
		[0, 0, 0, 0]
	],
	// T figure
	[
		[0, 0, 1, 0],
		[0, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	],
	// L figure
	[
		[0, 1, 0, 0],
		[0, 1, 0, 0],
		[0, 1, 1, 0],
		[0, 0, 0, 0]
	],
	// Inverted L figure
	[
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 1, 1, 0],
		[0, 0, 0, 0]
	]
];

let field = new Array(FIELD_HEIGHT);
let speedCounter = 0;
let pieceCounter = 0;
let gameOver = false;
let score = 0;

let tetrisImg;
let backgroundImg;
let borderImg;

function preload() {
	tetrisImg = loadImage('assets/block.png');
	backgroundImg = loadImage('assets/background.jpg');
	borderImg = loadImage('assets/border.png');
}

function randomTetromino(x, y) {
	let index = Math.floor(Math.random() * shapes.length);
	let shape = shapes[index];
	return new Tetromino(Math.floor(FIELD_WIDTH / 2), 0, shape);
}

function rotationIndex(row, col, index) {
	let ceil = [0, 0];
	let rotated = 0;
	switch (index % 4) {
		case 0:
			rotated = row * SHAPE_SIZE + col;
			break;
		case 1:
			rotated = 12 + row - SHAPE_SIZE * col;
			break;
		case 2:
			rotated = 15 - SHAPE_SIZE * row - col;
			break;
		case 3:
			rotated = 3 - row + SHAPE_SIZE * col;
			break;
	}
	ceil[0] = Math.floor(rotated % SHAPE_SIZE);
	ceil[1] = Math.floor(rotated / SHAPE_SIZE);
	return ceil;
}

class Tetromino {
	constructor(positionX, positionY, shape) {
		this.positionX = positionX;
		this.positionY = positionY;
		this.shape = shape;
		this.currentRotationIndex = 0;
	};

	_nextRotation() {
		return (this.currentRotationIndex + 1) % 4;
	};

	checkLines(field) {
		var scoreMultiplier = 0;
		for (let row = 0; row < SHAPE_SIZE; row++) {
			var currentRow = this.positionY + row;
			if (currentRow < FIELD_HEIGHT - 1) {
				var isLineFull = true;
				for (let x = 1; x < FIELD_WIDTH - 1; x++) {
					if (field[currentRow][x] == 0) {
						isLineFull = false;
						break;
					}
				}
				if (isLineFull) {
					for (let y = currentRow; y > 0; y--) {
						for (let x = 1; x < FIELD_WIDTH - 1; x++) {
							field[y][x] = field[y - 1][x];
						}
					}
					scoreMultiplier++;
				}
			}
		}
		return scoreMultiplier;
	};

	land(field) {
		for (let row = 0; row < SHAPE_SIZE; row++) {
			for (let col = 0; col < SHAPE_SIZE; col++) {
				let rotatedCell = rotationIndex(row, col, this.currentRotationIndex);

				let fieldX = this.positionX + col;
				let fieldY = this.positionY + row;

				if (this.shape[rotatedCell[1]][rotatedCell[0]] == 1) {
					field[fieldY][fieldX] = 2;
				}
			}
		}
	};

	canFit(field, dX, dY, rotate) {
		let indexRotation = this.currentRotationIndex;
		if (rotate) {
			indexRotation = this._nextRotation();
		}
		for (let row = 0; row < SHAPE_SIZE; row++) {
			for (let col = 0; col < SHAPE_SIZE; col++) {
				let rotatedCell = rotationIndex(row, col, indexRotation);

				let fieldX = this.positionX + dX + col;
				let fieldY = this.positionY + dY + row;

				if (fieldX >= 0 && fieldX < FIELD_WIDTH &&
					fieldY >= 0 && fieldY < FIELD_HEIGHT) {
					if (this.shape[rotatedCell[1]][rotatedCell[0]] == 1 && field[fieldY][fieldX] != 0) {
						return false;
					}
				}
			}
		}
		this.positionX += dX;
		this.positionY += dY;
		this.currentRotationIndex = indexRotation;
		return true;
	};

	draw() {
		for (let row = 0; row < SHAPE_SIZE; row++) {
			for (let col = 0; col < SHAPE_SIZE; col++) {
				let rotatedCell = rotationIndex(row, col, this.currentRotationIndex);

				if (this.shape[rotatedCell[1]][rotatedCell[0]] == 1) {
					//stroke(0, 0, 255, 255);
					//fill(255);
					//rect((col + this.positionX) * TILE_SIZE, (row + this.positionY) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
					image(
						tetrisImg, 
						(col + this.positionX) * TILE_SIZE,
						(row + this.positionY) * TILE_SIZE
					);
				}
			}
		}
	};
};

// 

let tetromino = randomTetromino();

function setup() {
	for (let row = 0; row < FIELD_HEIGHT; row++) {
		field[row] = new Array(FIELD_WIDTH);
		for (let col = 0; col < FIELD_WIDTH; col++) {
			let value = 0;
			if (row == FIELD_HEIGHT - 1 ||
				col == 0 || col == FIELD_WIDTH - 1) {
				value = 1;
			}
			field[row][col] = value;
		}
	}
	createCanvas(WIDTH, HEIGHT);
	console.log(WIDTH + " ; " + HEIGHT);
	frameRate(20);
}

function draw() {
	speedCounter++;

	clear();
	stroke(0, 0, 0, 255);
	image(backgroundImg, 0, 0);

	for (let row = 0; row < FIELD_HEIGHT; row++) {
		for (let col = 0; col < FIELD_WIDTH; col++) {
			let tileY = row * TILE_SIZE;
			let tileX = col * TILE_SIZE;

			if (field[row][col] == 1) {
				image(
					borderImg, 
					tileX,
					tileY
				);
			} else if (field[row][col] == 2) {
				image(
					tetrisImg, 
					tileX,
					tileY
				);
			} else {
				stroke(255);
				noFill();
				rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
			}

		}
	}

	var generateNewTetromino = false;
	if (!gameOver) {
		if (speedCounter == SPEED_TIME) {
			speedCounter = 0;
			pieceCounter++;
			if (pieceCounter % 20 == 0) {
				SPEED_TIME--;
				pieceCounter = 0;
				if (SPEED_TIME < 5) {
					SPEED_TIME = 5;
				}
			}

			if (!tetromino.canFit(field, 0, 1, false)) {
				tetromino.land(field);
				score += tetromino.checkLines(field) * 25;
				generateNewTetromino = true;
				console.log("Score: " + score);
			}

		}
	}
	tetromino.draw();
	if (generateNewTetromino) {
		tetromino = randomTetromino();
	}

	gameOver = !tetromino.canFit(field, 0, 0, false);
}

function keyPressed() {
	if (tetromino != null && !gameOver) {
		key == "ArrowLeft" && tetromino.canFit(field, -1, 0, false);

		key == "ArrowRight" && tetromino.canFit(field, 1, 0, false);

		key == "ArrowDown" && tetromino.canFit(field, 0, 1, false);

		key == "ArrowUp" && tetromino.canFit(field, 0, 0, true);
	}
}