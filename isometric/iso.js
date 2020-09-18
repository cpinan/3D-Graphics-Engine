// GAME LOGIC
class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	};
};

const TILE_SIZE_X = 64;
const TILE_SIZE_Y = 64;

// GAME
/*
let map = [
	[1, 2, 2, 2, 2, 1],
	[1, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1]
];
*/
let map = [
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 2, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 0, 1, 0, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const WIDTH = 640;
const HEIGHT = 480;

let blockImg;
let blockImg2;
let blockImg3;
let playerImg;
let tileIsoImg;

let playerPos = new Vector(1, 2);
let origin = new Vector(-(playerPos.x * TILE_SIZE_X - WIDTH / 2), -playerPos.y * TILE_SIZE_Y);

function preload() {
	blockImg = loadImage('assets/block_1.png');
	blockImg2 = loadImage('assets/blocks_1.png');
	blockImg3 = loadImage('assets/blocks_2.png');
	playerImg = loadImage('assets/player.png');
	tileIsoImg = loadImage("assets/tile_iso_transp.png");
}

let tileFloor = new Vector(2, 2);
let tileWall = new Vector(1, 0);

/*
let img;
function preload() {
  img = loadImage('assets/gradient.png');
}
function setup() {
  // 1. Background image
  // Top-left corner of the img is at (0, 0)
  // Width and height are the img's original width and height, 100 x 100
  image(img, 0, 0);
  // 2. Top right image
  // Top-left corner of destination rectangle is at (50, 0)
  // Destination rectangle width and height are 40 x 20
  // The next parameters are relative to the source image:
  // - Starting at position (50, 50) on the source image, capture a 50 x 50
  // subsection
  // - Draw this subsection to fill the dimensions of the destination rectangle
  image(img, 50, 0, 40, 20, 50, 50, 50, 50);
}
*/
function drawIso(tile, x, y) {
	let tileToDraw = (tile == 0) ? tileFloor : tileWall
	image(
		tileIsoImg, 
		x, 
		y,
		128,
		128,
		tileToDraw.x * 128,
		tileToDraw.y * 128,
		128,
		128
	);
}

function setup() {
	createCanvas(WIDTH, HEIGHT);
	// frameRate(20);
}

function draw() {
	clear();
	background(0);

	for (let row = 0; row < map.length; row++) {
		for (let col = 0; col < map[0].length; col++) {
			let tileX = col * TILE_SIZE_X;
			let tileY = row * TILE_SIZE_Y;
			drawTile(map[row][col], tileX, tileY, col, row);

			if (row == playerPos.y && col == playerPos.x) {
				let playerIso = cartesianToIsometric(
					new Vector(
						playerPos.x * TILE_SIZE_X + origin.x,
						playerPos.y * TILE_SIZE_Y + origin.y
					)
				);
				image(playerImg, playerIso.x, playerIso.y);
			}
		}
	}

	/*
		for (let row = 0; row < map.length; row++) {
			for (let col = 0; col < map[0].length; col++) {
				let x = col * TILE_SIZE_X * 2;
				let y = row * TILE_SIZE_Y * 2;

				stroke(0, 0, 0, 255);
				noFill();
				rect(x, y, TILE_SIZE_X * 2, TILE_SIZE_Y * 2);

				textSize(32);
				fill(255);
				text(row + ' ; ' + col, x + TILE_SIZE_X * 2 * 0.25, y + TILE_SIZE_Y * 2 * 0.5);
			}
		}
	*/


}

function drawTile(tile, x, y) {
	let iso = cartesianToIsometric(new Vector(origin.x + x, origin.y + y));
	// iso = isometricToCartesian(iso);
	//noStroke();
	//let color = (tile == 1) ? [255, 0, 0, 255] : [0, 255, 0, 255];
	//fill(color[0], color[1], color[2], color[3]);
	//rect(x, y, TILE_SIZE_X, TILE_SIZE_Y);

/*
	if (tile == 1)
		image(blockImg, iso.x, iso.y);
	else if (tile == 2)
		image(blockImg2, iso.x, iso.y);
	else
		image(blockImg3, iso.x, iso.y);
*/
	drawIso(tile, iso.x, iso.y);
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
	let tile = new Vector(playerPos.x + direction.x, playerPos.y + direction.y);
	if (tile.x >= 0 && tile.x < map[0].length &&
		tile.y >= 0 && tile.y < map.length &&
		map[tile.y][tile.x] == 0) {
		playerPos.x += direction.x;
		playerPos.y += direction.y;

		origin = new Vector(-(playerPos.x * TILE_SIZE_X - WIDTH / 2), -playerPos.y * TILE_SIZE_Y);
	}
}

function cartesianToIsometric(cartesian) {
	return new Vector(
		Math.floor(cartesian.x - cartesian.y),
		Math.floor((cartesian.x + cartesian.y) / 2)
	);
}

function isometricToCartesian(isometric) {
	return new Vector(
		Math.floor((2 * isometric.y + isometric.x) / 2),
		Math.floor((2 * isometric.y - isometric.x) / 2)
	);
}

function getTileCoordinates(vector) {
	return new Vector(
		Math.floor(vector.x / TILE_SIZE_X),
		Math.floor(vector.y / TILE_SIZE_Y),
	);
}

/*
sX = X * (TW / 2) - Y * (TW / 2) --> (X - Y) * (TW / 2) + (originX * TW)
sY = X * (TH / 2) + Y * (TH / 2) --> (X + Y) * (TH / 2) + (originY * TH)


mousePos = mouse.x / TW, mouse.y / TH
mouseOffset = mousePos % TW, mousePos % TH

mouseIsoX = (mousePos[1] - originY) + (mousePos[0] - originX)
mouseIsoY = (mousePos[1] - originY) - (mousePos[0] - originX)

https://devilsworkshop.itch.io/big-pixel-isometric-block-pack-free-2d-sprites

https://graphicriver.net/graphics-with-isometric-in-game-assets/pg-2?_ga=2.83199710.938919412.1599190366-1459798518.1598281216&as=1&price_min=0&referrer=homepage&type=c&utf8=%E2%9C%93

https://gamedevelopment.tutsplus.com/tutorials/creating-isometric-worlds-a-primer-for-game-developers--gamedev-6511

Convert the grid space coordinates to screen coordinates, using this formula:

screenX = (isoX - isoY) * tileHalfWidth;
screenY = (isoX + isoY) * tileHalfHeight;

In our case, this will give screen coordinates of (35, 52.5).

This is actually the "top" corner of the space; to get the centre of 
the space, you'll need to add tileHalfHeight to the result for screenY.




You'll need to add an offset. Just manually figure out the coordinates 
of the origin (centre) grid space, in screen coordinates, and add them to (screenX, screenY).

Your final conversion code looks like this:

screenX = ((isoX - isoY) * tileHalfWidth) + screenOriginOffsetX;
screenY = ((isoX + isoY) * tileHalfHeight) + tileHalfHeight + screenOriginOffsetY;


Suppose we want to spawn an object in whichever grid space the player clicks on. 
How do we figure out which space was clicked?

With a little algebra, we can just rearrange the above equations to get this:


// First, adjust for the offset:
var adjScreenX = screenX - screenOriginOffsetX;
var adjScreenY = screenY - screenOriginOffsetY;
 
// Now, retrieve the grid space:
isoX = ((adjScreenY / tileHalfHeight) + (adjScreenX / tileHalfWidth)) / 2;
isoY = ((adjScreenY / tileHalfHeight) - (adjScreenX / tileHalfWidth)) / 2;


isoX = ((adjScreenY / tileHalfHeight) + (adjScreenX / tileHalfWidth)) / 2;
isoY = ((adjScreenY / tileHalfHeight) - (adjScreenX / tileHalfWidth)) / 2;

You need to divide by 2 because all values are doubled since 
you're dividing by the half tile size. So actually it can be written:

isoX = (adjScreenY / tileHeight) + (adjScreenX / tileWidth);
isoY = (adjScreenY / tileHeight) - (adjScreenX / tileWidth);


https://gamedevelopment.tutsplus.com/tutorials/creating-isometric-worlds-a-primer-for-game-developers-continued--gamedev-9215


https://gamedevelopment.tutsplus.com/tutorials/creating-isometric-worlds-a-primer-for-game-developers-continued--gamedev-9215

http://www.significant-bits.com/a-laymans-guide-to-projection-in-videogames/

battle zone

https://rvros.itch.io/


Types of isometric maps
There are two types of isometric maps: diamond and staggered. They differ in the way the tiles are ordered. Diamond maps are aligned in the form a rhombus and it's the approach we'll be using in this tutorial. The following code snippet shows how the on-screen position of tiles is calculated with diamond ordering (where 'tx' and 'ty' represent the tile index):
-- diamond ordering
local x = (tx + ty)*(tile_width/2)
local y = -(ty - tx)*(tile_height/2)

Staggered ordering is preferred in strategy games (like Civilization 2 & 3) where the map is usually wrapped horizontally. It should be noted that staggered maps add some additional complications in particular with finding the index of neighboring tiles. Here is how tiles are placed on the screen with staggered ordering:
-- staggered ordering
local x = tx*tile_width + ty%2*(tile_width/2)
local y = -ty*(tile_height/2)

https://2dengine.com/?p=isometric




*/