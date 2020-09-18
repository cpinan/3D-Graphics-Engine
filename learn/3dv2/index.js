/*
projection:
{
	((width / height) * (1 / tan(fov / 2)) * x) / z,
	(1 / tan(fov / 2)) * y,
	z * (zFar / (zFar - zNear)) - ((zFar * zNear) / (zFar - zNear)),
	z
}

(h / w) * (1 / tan(º/2))		0							0					0
		0					(1 / tan(º/2))					0					0
		0						0					Zfar/(Zfar - Znear)			1
		0						0			(-Zfar * Znear) / (Zfar - Znear)	0
*/

const TWO_PI = 2 * Math.PI;

// OBJECTS
function degreesToRadians(degrees) {
	return degrees * Math.PI / 180;
}

function radiansToDegrees(radians) {
	return radians * 180.0 / Math.PI;
}

function clamp(value, min, max) {
	if (value < min)
		return min;
	if (value > max)
		return max;
	return value;
}

function clampRadian(radians) {
	if (radians < 0) {
		radians += TWO_PI;
	}
	if (radians > TWO_PI) {
		radians -= TWO_PI;
	}
	return radians;
}

function multiplyMatrixVector(i, m) {
	let w = i.x * m[0][3] + i.y * m[1][3] + i.z * m[2][3] + m[3][3];
	return Vector3.create(
		(i.x * m[0][0] + i.y * m[1][0] + i.z * m[2][0] + m[3][0]) / w,
		(i.x * m[0][1] + i.y * m[1][1] + i.z * m[2][1] + m[3][1]) / w,
		(i.x * m[0][2] + i.y * m[1][2] + i.z * m[2][2] + m[3][2]) / w,
		w
	);
}

function matrixMultiplication(m1, m2) {
	let matrix = m4x4();
	for (let c = 0; c < 4; c++) {
		for (let r = 0; r < 4; r++) {
			matrix[r][c] = m1[r][0] * m2[0][c] + m1[r][1] * m2[1][c] + m1[r][2] * m2[2][c] + m1[r][3] * m2[3][c];
		}
	}
	return matrix;
}

function m4x4() {
	return [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	];
}

function identityMatrix() {
	return [
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	];
}

// https://en.wikipedia.org/wiki/Transformation_matrix
function translationMatrix(tX, tY, tZ) {
	let matrix = identityMatrix();

	matrix[3][0] = tX;
	matrix[3][1] = tY;
	matrix[3][2] = tZ;

	return matrix;
}

function getColor(lumination) {
	let pixel = clamp(1.0 - lumination, 0.3, 1.0);
	let color = [255 * pixel, 255 * pixel, 255, 255];
	return color;
}

// https://en.wikipedia.org/wiki/Rotation_matrix
function matrixRotationZ(radian) {
	let matrix = identityMatrix();

	matrix[0][0] = Math.cos(radian);
	matrix[0][1] = Math.sin(radian);

	matrix[1][0] = -Math.sin(radian);
	matrix[1][1] = Math.cos(radian);

	return matrix;
}

function matrixRotationX(radian) {
	let matrix = identityMatrix();

	matrix[1][1] = Math.cos(radian);
	matrix[1][2] = Math.sin(radian);

	matrix[2][1] = -Math.sin(radian);
	matrix[2][2] = Math.cos(radian);

	return matrix;
}

function matrixRotationY(radian) {
	let matrix = identityMatrix();

	matrix[0][0] = Math.cos(radian);
	matrix[0][2] = Math.sin(radian);

	matrix[2][0] = -Math.sin(radian);
	matrix[2][2] = Math.cos(radian);

	return matrix;
}

function matrixPointAt(pos, target, up) {
	// Calculate forward vector
	let newForward = Vector3.substract(target, pos);
	newForward.normalize();

	// Calculate new up vector
	let a = Vector3.multiply(newForward, Vector3.dotProduct(up, newForward));
	let newUp = Vector3.substract(up, a);
	newUp.normalize();

	// Right direction
	let newRight = Vector3.crossProduct(newUp, newForward);

	// Construct dimens & translation matrix
	let matrix = identityMatrix();

	matrix[0][0] = newRight.x;
	matrix[0][1] = newRight.y;
	matrix[0][2] = newRight.z;

	matrix[1][0] = newUp.x;
	matrix[1][1] = newUp.y;
	matrix[1][2] = newUp.z;

	matrix[2][0] = newForward.x;
	matrix[2][1] = newForward.y;
	matrix[2][2] = newForward.z;

	matrix[3][0] = pos.x;
	matrix[3][1] = pos.y;
	matrix[3][2] = pos.z;

	return matrix;
}

// Inversing the point at matrix you get the look at matrix
function inverseMatrix(m) {
	let matrix = m4x4();

	matrix[0][0] = m[0][0];
	matrix[0][1] = m[1][0];
	matrix[0][2] = m[2][0];

	matrix[1][0] = m[0][1];
	matrix[1][1] = m[1][1];
	matrix[1][2] = m[2][1];

	matrix[2][0] = m[0][2];
	matrix[2][1] = m[1][2];
	matrix[2][2] = m[2][2];

	matrix[3][0] = -(m[3][0] * matrix[0][0] + m[3][1] * matrix[1][0] + m[3][2] * matrix[2][0]);
	matrix[3][1] = -(m[3][0] * matrix[0][1] + m[3][1] * matrix[1][1] + m[3][2] * matrix[2][1]);
	matrix[3][2] = -(m[3][0] * matrix[0][2] + m[3][1] * matrix[1][2] + m[3][2] * matrix[2][2]);
	matrix[3][3] = 1.0;

	return matrix;
}

function projectionMatrix(
	aspectRatio,
	fov,
	zFar,
	zNear
) {
	let radianFov = degreesToRadians(fov);

	let halfFov = radianFov * 0.5;

	let scaling = (1 / Math.tan(halfFov));

	let zRatio = (zFar / (zFar - zNear));

	let matrix = m4x4();

	matrix[0][0] = aspectRatio * scaling;
	matrix[1][1] = scaling;
	matrix[2][2] = zRatio;
	matrix[3][2] = -zRatio * zNear;
	matrix[2][3] = 1;

	return matrix;
}

class Vector3 {
	constructor(x, y, z, w = 1) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w != undefined ? w : 1;
	};

	add(dX, dY, dZ) {
		this.x += dX;
		this.y += dY;
		this.z += dZ;
	};

	substract(dX, dY, dZ) {
		this.x -= dX;
		this.y -= dY;
		this.z -= dZ;
	};

	divide(dX, dY, dZ) {
		this.x /= dX;
		this.y /= dY;
		this.z /= dZ;
	};

	scale(sX, sY, sZ) {
		this.x *= sX;
		this.y *= sY;
		this.z *= sZ;
	};

	length() {
		return Math.sqrt(this.squareLength());
	};

	squareLength() {
		return this.x * this.x + this.y * this.y + this.z * this.z
	};

	normalize() {
		let length = this.length();
		if (length != 0) {
			this.x /= length;
			this.y /= length;
			this.z /= length;
		}
	};

	static add(v1, v2) {
		return Vector3.create(
			v1.x + v2.x,
			v1.y + v2.y,
			v1.z + v2.z
		);
	};

	static zero() {
		return new Vector3(0.0, 0.0, 0.0);
	};

	static multiply(v, value) {
		return Vector3.create(
			v.x * value,
			v.y * value,
			v.z * value
		);
	};

	static substract(v1, v2) {
		return Vector3.create(
			v1.x - v2.x,
			v1.y - v2.y,
			v1.z - v2.z
		);
	}

	static create(x, y, z) {
		return new Vector3(x, y, z);
	};

	static copy(vector) {
		return Vector.create(vector.x, vector.y, vector.z);
	};

	static crossProduct(v1, v2) {
		return Vector3.create(
			v1.y * v2.z - v1.z * v2.y,
			v1.z * v2.x - v1.x * v2.z,
			v1.x * v2.y - v1.y * v2.x
		);
	};

	static dotProduct(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
	};
}

class Triangle {
	constructor(vertices) { // Vector3
		this.vertices = vertices;
	};

	set(vX, vY, vZ) {
		this.vertices[0] = vX;
		this.vertices[1] = vY;
		this.vertices[2] = vZ;
	};

	plus(dX, dY, dZ) {
		for (let i = 0; i < this.vertices.length; i++) {
			this.vertices[i].add(dX, dY, dZ);
		}
	};

	multiply(dX, dY, dZ) {
		for (let i = 0; i < this.vertices.length; i++) {
			this.vertices[i].scale(dX, dY, dZ);
		}
	};

	static create(v1, v2, v3) {
		let vertices = [v1, v2, v3];
		return new Triangle(vertices);
	};

	static copy(triangle) {
		let v1 = triangle.vertices[0];
		let v2 = triangle.vertices[1];
		let v3 = triangle.vertices[2];

		let vertices = [];
		vertices.push(Vector3.create(v1.x, v1.y, v1.z));
		vertices.push(Vector3.create(v2.x, v2.y, v2.z));
		vertices.push(Vector3.create(v3.x, v3.y, v3.z));
		return new Triangle(vertices);
	};
};

function parseObjectForString(content) {
	let vertices = [];
	let triangles = [];
	for (let i = 0; i < content.length; i++) {
		let line = content[i];
		let l = line.charAt(0);
		let data = line.substring(2);
		let info;
		switch (l) {
			case 'v':
				info = data.split(" ");
				vertices.push(
					Vector3.create(
						parseFloat(info[0]),
						parseFloat(info[1]),
						parseFloat(info[2])
					)
				);
				break;
			case 'f':
				info = data.split(" ");
				let p1 = parseInt(info[0]) - 1;
				let p2 = parseInt(info[1]) - 1;
				let p3 = parseInt(info[2]) - 1;

				triangles.push(
					Triangle.create(
						vertices[p1],
						vertices[p2],
						vertices[p3]
					)
				);
				break;
		}
	}
	return Mesh.create(triangles);
}

class Mesh {
	constructor(triangles) {
		this.triangles = triangles;
		this.projectedTriangles = [];
		this.theta = 0.0;
	};

	draw() {
		for (let i = 0; i < this.projectedTriangles.length; i++) {
			let t = this.projectedTriangles[i][0];
			let dp = this.projectedTriangles[i][1];

			let color = getColor(dp);

			fillTriangle(t.vertices, color);
			// strokeTriangle(t.vertices);
		}
	};

	update(dt) {
		if (keyState["ArrowUp"]) {
			camera.y -= 8 * dt;
		} else if (keyState["ArrowDown"]) {
			camera.y += 8 * dt;
		} else if (keyState["ArrowLeft"]) {
			camera.x -= 8 * dt;
		} else if (keyState["ArrowRight"]) {
			camera.x += 8 * dt;
		}

		let forwardVector = Vector3.multiply(lookDirection, 8 * dt);

		if (keyState["w"]) {
			camera = Vector3.add(camera, forwardVector);
		} else if (keyState["s"]) {
			camera = Vector3.substract(camera, forwardVector);
		} else if (keyState["a"]) {
			yaw -= 2 * dt;
		} else if (keyState["d"]) {
			yaw += 2 * dt;
		}

		//this.theta = (this.theta + dt) % 360;

		// Z ROTATION
		let rotationZMatrix = matrixRotationZ(this.theta * 0.5);

		// X ROTATION
		let rotationXMatrix = matrixRotationX(this.theta);

		let translationMat = translationMatrix(0.0, 0.0, 5.0);

		let worldMatrix = identityMatrix();
		worldMatrix = matrixMultiplication(rotationZMatrix, rotationXMatrix);
		worldMatrix = matrixMultiplication(worldMatrix, translationMat);

		// lookDirection = Vector3.create(0, 0, 1);
		let upVector = Vector3.create(0, 1, 0);
		// let targetVector = Vector3.add(camera, lookDirection);
		let targetVector = Vector3.create(0, 0, 1);

		let rotationYMatrix = matrixRotationY(yaw);

		lookDirection = multiplyMatrixVector(targetVector, rotationYMatrix);
		targetVector = Vector3.add(camera, lookDirection);

		let cameraMatrix = matrixPointAt(camera, targetVector, upVector);

		// View camera matrix
		let viewCameraMatrix = inverseMatrix(cameraMatrix);

		this.projectedTriangles = [];

		for (let i = 0; i < this.triangles.length; i++) {
			let triangle = this.triangles[i];

			// Copy triangle to not override the current one.
			let tmp = Triangle.copy(triangle);

			tmp.set(
				multiplyMatrixVector(tmp.vertices[0], worldMatrix),
				multiplyMatrixVector(tmp.vertices[1], worldMatrix),
				multiplyMatrixVector(tmp.vertices[2], worldMatrix)
			);

			// GET NORMAL
			let line1 = Vector3.substract(tmp.vertices[1], tmp.vertices[0]);
			let line2 = Vector3.substract(tmp.vertices[2], tmp.vertices[0]);

			let normal = Vector3.crossProduct(line1, line2);
			normal.normalize();

			let cameraRay = Vector3.create(
				tmp.vertices[0].x - camera.x,
				tmp.vertices[0].y - camera.y,
				tmp.vertices[0].z - camera.z,
			);

			let dotProduct = Vector3.dotProduct(normal, cameraRay);

			if (dotProduct < 0) {
				let lightDirection = Vector3.create(0, 0, -1);
				lightDirection.normalize();

				let dp = Vector3.dotProduct(normal, lightDirection);

				// Convert world space into view space
				let triangleViewed = Triangle.create(
					multiplyMatrixVector(tmp.vertices[0], viewCameraMatrix),
					multiplyMatrixVector(tmp.vertices[1], viewCameraMatrix),
					multiplyMatrixVector(tmp.vertices[2], viewCameraMatrix)
				);

				// PROJECTION INTO THE SCREEN
				tmp.set(
					multiplyMatrixVector(triangleViewed.vertices[0], projection),
					multiplyMatrixVector(triangleViewed.vertices[1], projection),
					multiplyMatrixVector(triangleViewed.vertices[2], projection)
				);

				tmp.vertices[0].divide(1, 1, tmp.vertices[0].w);
				tmp.vertices[1].divide(1, 1, tmp.vertices[1].w);
				tmp.vertices[2].divide(1, 1, tmp.vertices[2].w);

				// SCALING
				let offsetView = Vector3.create(1, 1, 0);
				tmp.plus(offsetView.x, offsetView.y, offsetView.z);

				tmp.multiply(
					0.5 * WIDTH,
					0.5 * HEIGHT,
					1.0
				);

				this.projectedTriangles.push([tmp, dp]);
			}
		}

		this.projectedTriangles.sort(
			function(a, b) {
				let t1 = a[0].vertices;
				let t2 = b[0].vertices;

				let z1 = (t1[0].z + t1[1].z + t1[2].z) / 3.0;
				let z2 = (t2[0].z + t2[1].z + t2[2].z) / 3.0;
				if (z1 == z2) {
					return 0;
				}
				return z1 > z2 ? 1 : -1;
			}
		);
	};

	static create(triangles) {
		return new Mesh(triangles);
	};
};

function drawTriangle(v) {
	line(
		v[0].x, v[0].y,
		v[1].x, v[1].y
	);
	line(
		v[1].x, v[1].y,
		v[2].x, v[2].y
	);
	line(
		v[2].x, v[2].y,
		v[0].x, v[0].y
	);
}

function strokeTriangle(v) {
	noFill();
	stroke(0);
	drawTriangle(v);
}

// https://p5js.org/reference/#/p5/beginShape
function fillTriangle(v, color) {
	fill(color[0], color[1], color[2], color[3]);
	noStroke();

	beginShape();
	vertex(v[0].x, v[0].y);
	vertex(v[1].x, v[1].y);
	vertex(v[2].x, v[2].y);
	endShape(CLOSE);
}

// GAME LOGIC
const WIDTH = 640;
const HEIGHT = 480;

// GAME VARIABLES
let projection;
let camera;
let lookDirection;

let meshObject;

let stringMeshObject;
let keyState = [];
let yaw;

// GAME METHODS
function preload() {
	// videoShipObjContent = loadStrings("assets/VideoShip.obj.txt");
	// stringMeshObject = loadStrings("assets/teapot.obj.txt");
	stringMeshObject = loadStrings("assets/axis.obj.txt");
}

function setup() {
	yaw = 0;
	camera = Vector3.zero();
	lookDirection = Vector3.zero();

	meshObject = parseObjectForString(stringMeshObject);
	createProjection();

	createCanvas(WIDTH, HEIGHT);
	frameRate(30);
}

function draw() {
	let dt = frameRate() / 1000.0;

	update(dt);

	clear();
	background(0);

	meshObject.draw();

}

function update(dt) {
	meshObject.update(dt);
}

function keyPressed() {
	// console.log(key);
	keyState[key] = true;
}

function keyReleased() {
	keyState[key] = false;
}

// GAME
function createProjection() {
	let zNear = 0.1;
	let zFar = 100.0;
	let fov = 90.0;
	let aspectRatio = parseFloat(HEIGHT) / WIDTH;

	projection = projectionMatrix(
		aspectRatio,
		fov,
		zNear,
		zFar
	);
}