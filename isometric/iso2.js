class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	};
}

/*
	//Cartesian to isometric:
	 
	isoX = cartX - cartY;
	isoY = (cartX + cartY) / 2;

	//Isometric to Cartesian:

	cartX = (2 * isoY + isoX) / 2;
	cartY = (2 * isoY - isoX) / 2;


	http://clintbellanger.net/articles/isometric_math/

	width = 2A 
	height = A

	screen.x = map.x * TILE_WIDTH_HALF - map.y * TILE_WIDTH_HALF;
	screen.y = map.x * TILE_HEIGHT_HALF + map.y * TILE_HEIGHT_HALF;

	// So final actual commands are:
	map.x = (screen.x / TILE_WIDTH_HALF + screen.y / TILE_HEIGHT_HALF) /2;
	map.y = (screen.y / TILE_HEIGHT_HALF -(screen.x / TILE_WIDTH_HALF)) /2;


*/
function cartesianToIsometric(cell, origin, tileSize) {
	return new Vector(
		(origin.x * tileSize.x) + (cell.x - cell.y) * (tileSize.x / 2),
		(origin.y * tileSize.y) + (cell.x + cell.y) * (tileSize.y / 4)
	);
}

let sprites = {
	"topWall": new Vector(0, 0),
	"wall1": new Vector(128, 0),
	"rightWall": new Vector(256, 0),

	"wall2": new Vector(0, 128),
	"bottomWall": new Vector(128, 128),
	"wall3": new Vector(256, 128),

	"leftWall": new Vector(0, 256),
	"wall4": new Vector(128, 256),
	"floor": new Vector(256, 256)
};

// GAME
let tileSize = new Vector(128, 128);

// let worldMap = new Array(new Array());
let worldMap = [
	[1, 5, 5, 5, 5, 5, 2],
	[6, 0, 0, 0, 0, 0, 7],
	[6, 0, 0, 0, 0, 0, 7],
	[6, 0, 0, 1, 8, 8, 2],
	[6, 0, 0, 0, 0, 0, 0],
	[6, 0, 0, 0, 0, 0, 0],
	[3, 8, 8, 8, 8, 8, 4]
];

let worldSize = new Vector(worldMap[0].length, worldMap.length);
let playerPosition = new Vector(4, 1);
let origin = new Vector(6, 0);

let isometricSheetImage;
let playerImage;

function drawIsometricSprite(position, reference) {
	image(
		isometricSheetImage,
		position.x,
		position.y,
		tileSize.x,
		tileSize.y,
		reference.x,
		reference.y,
		tileSize.x,
		tileSize.y
	);
}

function preload() {
	isometricSheetImage = loadImage("assets/tile_iso_transp.png");
	playerImage = loadImage("assets/queen.png");
}

function setup() {
	/*
	for (let row = 0; row < worldSize.y; row++) {
		worldMap[row] = new Array();
		for (let col = 0; col < worldSize.x; col++) {
			if (col == 0 || row == 0 || col == worldSize.x - 1 || row == worldSize.y - 1) {
				worldMap[row][col] = Math.floor(Math.random() * 4) + 1;
			} else {
				worldMap[row][col] = 0;
			}
		}
	}*/

	createCanvas(1280, 480);
}

function drawPlayer(col, row, minimap) {
	if (col == Math.floor(playerPosition.x) && row == Math.floor(playerPosition.y)) {
		if (!minimap) {
			let position = cartesianToIsometric(
				playerPosition,
				origin,
				tileSize
			);
			image(playerImage, position.x, position.y);
		} else {
			fill(255, 255, 0);
			noStroke();
			circle(
				col * 48 + 72,
				row * 48 + 72,
				16
			);
		}
	}
}

function draw() {
	clear();
	background(0);

	// ISOMETRIC
	for (let row = 0; row < worldSize.y; row++) {
		for (let col = 0; col < worldSize.x; col++) {
			let cell = new Vector(col, row);
			let position = cartesianToIsometric(cell, origin, tileSize);
			// stroke(255);
			// fill(0);
			// rect(col * tileSize.x, row * tileSize.y, tileSize.x, tileSize.y);
			let tile = worldMap[row][col];
			let spriteToDraw;
			if (tile == 0) {
				spriteToDraw = sprites.floor;
			} else if (tile >= 1 && tile <= 4) {
				spriteToDraw = sprites["wall" + tile];
			} else {
				if (tile == 5)
					spriteToDraw = sprites.topWall;
				else if (tile == 6)
					spriteToDraw = sprites.leftWall;
				else if (tile == 7)
					spriteToDraw = sprites.rightWall;
				else if (tile == 8)
					spriteToDraw = sprites.bottomWall;
			}
			drawIsometricSprite(position, spriteToDraw);
			drawPlayer(col, row, false);
		}
	}

	/*
		for (let row = 0; row < worldSize.y; row++) {
			for (let col = 0; col < worldSize.x; col++) {
				let cell = new Vector(col, row);
				let position = cartesianToIsometric(cell, origin, tileSize);

				textSize(16);
				noStroke();
				fill(255);
				text(
					"y = " + row + "\nx = " + col,
					position.x + tileSize.x / 2 - 10,
					position.y + tileSize.y / 2 + 25
				);
			}
		}
	*/

	// MINIMAP
	let left = 48;
	let top = 48;
	let minimapTileSize = 48;

	for (let row = 0; row < worldSize.y; row++) {
		for (let col = 0; col < worldSize.x; col++) {
			let cell = new Vector(col, row);
			let position = new Vector(
				left + cell.x * minimapTileSize,
				top + cell.y * minimapTileSize
			);

			stroke(255);

			if (worldMap[row][col] == 0) {
				fill(128, 128, 128, 255);
			} else {
				fill(64, 64, 64, 255);
			}

			rect(
				position.x,
				position.y,
				minimapTileSize,
				minimapTileSize
			);

			drawPlayer(col, row, true);
		}
	}

	for (let row = 0; row < worldSize.y; row++) {
		for (let col = 0; col < worldSize.x; col++) {
			let cell = new Vector(col, row);
			let position = new Vector(
				left + cell.x * minimapTileSize,
				top + cell.y * minimapTileSize
			);

			textSize(11);
			noStroke();
			fill(255);
			text(
				"y = " + row + "\nx = " + col,
				position.x + 5,
				position.y + 12
			);
		}
	}
}

function keyPressed() {
	let direction = new Vector(0, 0);
	if (key == "ArrowUp") {
		direction.x = -1;
	} else if (key == "ArrowDown") {
		direction.x = 1;
	} else if (key == "ArrowLeft") {
		direction.y = 1;
	} else if (key == "ArrowRight") {
		direction.y = -1;
	}
	let tile = new Vector(
		Math.floor(playerPosition.x + direction.x),
		Math.floor(playerPosition.y + direction.y)
	);
	if (tile.x >= 0 && tile.x < worldMap[0].length &&
		tile.y >= 0 && tile.y < worldMap.length &&
		worldMap[tile.y][tile.x] == 0) {
		playerPosition.x += direction.x;
		playerPosition.y += direction.y;

		// origin = new Vector(-(playerPos.x * TILE_SIZE_X - WIDTH / 2), -playerPos.y * TILE_SIZE_Y);
	}
}