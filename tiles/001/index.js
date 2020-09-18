// GAME LOGIC
class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	};
};
Vector.ZERO = new Vector(0, 0);

class Size {
	constructor(width, height) {
		this.width = width;
		this.height = height;
	};
};

class Cell {
	constructor(col, row) {
		this.col = col;
		this.row = row;
	};
}

function collides(cell) {
	return cell.col >= 0 && cell.col < currentMap[0].length &&
		cell.row >= 0 && cell.row < currentMap.length &&
		currentMap[cell.row][cell.col] != 0;
}

class Hero {
	constructor(position, size) {
		this.position = position;
		this.size = size;
		this.speed = 4;
		this.direction = new Vector(0, 1);
	};
	draw() {
		noStroke();
		fill(255, 0, 0, 255);
		/*

		var position1, position2, position3;

		if (this.direction.x == 1) {
			// RIGHT
			position1 = new Vector(
				this.position.x * tileSize.width + tileSize.width - this.size.width / 4,
				this.position.y * tileSize.height + tileSize.height / 2
			);
			position2 = new Vector(
				position1.x - this.size.width,
				position1.y - this.size.height / 2,
			);
			position3 = new Vector(
				position2.x,
				position2.y + this.size.height
			);

		} else if (this.direction.x == -1) {
			// LEFT
			position1 = new Vector(
				this.position.x * tileSize.width + this.size.width / 4,
				this.position.y * tileSize.height + tileSize.height / 2
			);
			position2 = new Vector(
				position1.x + this.size.width,
				position1.y - this.size.height / 2,
			);
			position3 = new Vector(
				position2.x,
				position2.y + this.size.height
			);

		} else if (this.direction.y == -1) {
			// UP
			position1 = new Vector(
				this.position.x * tileSize.width + tileSize.width / 2,
				this.position.y * tileSize.height + this.size.height / 4
			);
			position2 = new Vector(
				position1.x - this.size.width / 2,
				position1.y + this.size.height,
			);
			position3 = new Vector(
				position1.x + this.size.width / 2,
				position2.y
			);

		} else {
			// DOWN
			position1 = new Vector(
				this.position.x * tileSize.width + tileSize.width / 2,
				this.position.y * tileSize.height + tileSize.height - this.size.height / 4
			);
			position2 = new Vector(
				position1.x - this.size.width / 2,
				position1.y - this.size.height,
			);
			position3 = new Vector(
				position1.x + this.size.width / 2,
				position2.y
			);
		}
		triangle(
			position1.x, position1.y,
			position2.x, position2.y,
			position3.x, position3.y
		);
		*/
		let radius = (this.size.width + this.size.height) / 2;
		circle(
			this.position.x * tileSize.width + radius * 0.75,
			this.position.y * tileSize.height + radius * 0.75,
			radius
		);
	};
	move(newDirection, dt) {
		// GET CORNERS
		
		let newX = this.position.x + (newDirection.x * this.speed * dt);
		let newY = this.position.y + (newDirection.y * this.speed * dt);

		let cell = new Cell(
			Math.floor(newX + 0.5),
			Math.floor(newY + 0.5)
		);
		console.log(cell);

		if (!collides(cell)) {
			this.direction = newDirection;
			this.position.x = newX;
			this.position.y = newY;
		}

	};
};

// GAME
let map = [
	[1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1]
];

let tileSize = new Size(30, 30);
let currentMap = map;

let hero = new Hero(new Vector(2, 1), new Size(20, 20));

function preload() {

}

function setup() {
	createCanvas(640, 480);
	frameRate(30);
}

function draw() {
	let dt = frameRate() / 1000.0;
	clear();
	background(128);

	update(dt);

	for (row = 0; row < currentMap.length; row++) {
		for (col = 0; col < currentMap[0].length; col++) {
			let tilePosition = new Vector(
				col * tileSize.width,
				row * tileSize.height
			);
			stroke(0);

			let tile = currentMap[row][col];
			if (tile == 1) {
				fill(0);
			} else {
				fill(255);
			}
			rect(tilePosition.x, tilePosition.y, tileSize.width, tileSize.height);
		}
	}

	hero.draw();

}

function update(dt) {
	var direction = new Vector(0, 0);
	if (keyIsDown(UP_ARROW)) {
		direction.y = -1;
	} else if (keyIsDown(DOWN_ARROW)) {
		direction.y = 1;
	} else if (keyIsDown(LEFT_ARROW)) {
		direction.x = -1;
	} else if (keyIsDown(RIGHT_ARROW)) {
		direction.x = 1;
	}
	if (direction.x != 0 || direction.y != 0) {
		hero.move(direction, dt);
	}
}