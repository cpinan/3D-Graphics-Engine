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
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = 1;
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

	static zero() {
		return new Vector3(0.0, 0.0, 0.0);
	};

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
			this.vertices[i].x += dX;
			this.vertices[i].y += dY;
			this.vertices[i].z += dZ;
		}
	};

	multiply(dX, dY, dZ) {
		for (let i = 0; i < this.vertices.length; i++) {
			this.vertices[i].x *= dX;
			this.vertices[i].y *= dY;
			this.vertices[i].z *= dZ;
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

function loadObj(mesh, fileName) {
	let content = loadStrings(
		fileName,
		function() {
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
			meshObject = Mesh.create(triangles);
		}
	);
}

class Mesh {
	constructor(triangles) {
		this.triangles = triangles;
		this.projectedTriangles = [];
	};

	draw001() {

		// Z ROTATION
		let rotationZ = matrixRotationZ(theta);

		// X ROTATION
		let rotationX = matrixRotationX(theta * 0.5);

		for (let i = 0; i < this.triangles.length; i++) {
			let t = this.triangles[i];

			// Copy triangle to not override the current one.
			let tmp = Triangle.copy(t);

			/*
			let rotatedZTriangle = Triangle.create(
				multiplyMatrixVector(tmp.vertices[0], rotationZ),
				multiplyMatrixVector(tmp.vertices[1], rotationZ),
				multiplyMatrixVector(tmp.vertices[2], rotationZ),
			);
			*/
			tmp.set(
				multiplyMatrixVector(tmp.vertices[0], rotationZ),
				multiplyMatrixVector(tmp.vertices[1], rotationZ),
				multiplyMatrixVector(tmp.vertices[2], rotationZ)
			);

			/*
			let rotatedXZTriangle = Triangle.create(
				multiplyMatrixVector(rotatedZTriangle.vertices[0], rotationX),
				multiplyMatrixVector(rotatedZTriangle.vertices[1], rotationX),
				multiplyMatrixVector(rotatedZTriangle.vertices[2], rotationX),
			);
			*/
			tmp.set(
				multiplyMatrixVector(tmp.vertices[0], rotationX),
				multiplyMatrixVector(tmp.vertices[1], rotationX),
				multiplyMatrixVector(tmp.vertices[2], rotationX)
			);

			// TRANSLATION

			/*
			let translatedTriangle = rotatedXZTriangle;
			translatedTriangle.plus(0.0, 0.0, 3.0);
			*/
			tmp.plus(0.0, 0.0, 12.0);

			/*
			let projectedTriangle = Triangle.create(
				multiplyMatrixVector(translatedTriangle.vertices[0], projection),
				multiplyMatrixVector(translatedTriangle.vertices[1], projection),
				multiplyMatrixVector(translatedTriangle.vertices[2], projection),
			);
			*/

			// GET NORMAL
			let line1, line2;

			line1 = Vector3.zero();
			line1.x = tmp.vertices[1].x - tmp.vertices[0].x;
			line1.y = tmp.vertices[1].y - tmp.vertices[0].y;
			line1.z = tmp.vertices[1].z - tmp.vertices[0].z;

			line2 = Vector3.zero();
			line2.x = tmp.vertices[2].x - tmp.vertices[0].x;
			line2.y = tmp.vertices[2].y - tmp.vertices[0].y;
			line2.z = tmp.vertices[2].z - tmp.vertices[0].z;

			let normal = Vector3.crossProduct(line1, line2);
			normal.normalize();

			let cameraProject = Vector3.create(
				tmp.vertices[0].x - camera.x,
				tmp.vertices[0].y - camera.y,
				tmp.vertices[0].z - camera.z,
			);

			let dotProduct = Vector3.dotProduct(normal, cameraProject);

			// if(normal.z < 0) {
			if (dotProduct < 0) {
				let lightDirection = Vector3.create(0, 0, -1);
				lightDirection.normalize();

				let dp = Vector3.dotProduct(normal, lightDirection);

				// PROJECTION INTO THE SCREEN
				tmp.set(
					multiplyMatrixVector(tmp.vertices[0], projection),
					multiplyMatrixVector(tmp.vertices[1], projection),
					multiplyMatrixVector(tmp.vertices[2], projection)
				);

				// SCALING
				/*
				projectedTriangle.plus(1.0, 1.0, 0.0);
				projectedTriangle.multiply(
					0.5 * WIDTH, 
					0.5 * HEIGHT, 
					1.0
				);
				*/
				tmp.plus(1.0, 1.0, 0.0);
				tmp.multiply(
					0.5 * WIDTH,
					0.5 * HEIGHT,
					1.0
				);

				// drawTriangle(projectedTriangle.vertices);
				// strokeTriangle(tmp.vertices);
				let color = [255, 255, 255, 255];
				color = getColor(dp);

				fillTriangle(tmp.vertices, color);
				strokeTriangle(tmp.vertices);
			}
		}
	};

	draw() {
		for (let i = 0; i < this.projectedTriangles.length; i++) {
			let t = this.projectedTriangles[i][0];
			let dp = this.projectedTriangles[i][1];

			let color = [255, 255, 255, 255];
			color = getColor(dp);

			fillTriangle(t.vertices, color);
			strokeTriangle(t.vertices);
		}
	};

	update(dt) {

		// Z ROTATION
		let rotationZ = matrixRotationZ(theta);

		// X ROTATION
		let rotationX = matrixRotationX(theta * 0.5);

		this.projectedTriangles = [];

		for (let i = 0; i < this.triangles.length; i++) {
			let t = this.triangles[i];

			// Copy triangle to not override the current one.
			let tmp = Triangle.copy(t);

			/*
			let rotatedZTriangle = Triangle.create(
				multiplyMatrixVector(tmp.vertices[0], rotationZ),
				multiplyMatrixVector(tmp.vertices[1], rotationZ),
				multiplyMatrixVector(tmp.vertices[2], rotationZ),
			);
			*/
			tmp.set(
				multiplyMatrixVector(tmp.vertices[0], rotationZ),
				multiplyMatrixVector(tmp.vertices[1], rotationZ),
				multiplyMatrixVector(tmp.vertices[2], rotationZ)
			);

			/*
			let rotatedXZTriangle = Triangle.create(
				multiplyMatrixVector(rotatedZTriangle.vertices[0], rotationX),
				multiplyMatrixVector(rotatedZTriangle.vertices[1], rotationX),
				multiplyMatrixVector(rotatedZTriangle.vertices[2], rotationX),
			);
			*/
			tmp.set(
				multiplyMatrixVector(tmp.vertices[0], rotationX),
				multiplyMatrixVector(tmp.vertices[1], rotationX),
				multiplyMatrixVector(tmp.vertices[2], rotationX)
			);

			// TRANSLATION

			/*
			let translatedTriangle = rotatedXZTriangle;
			translatedTriangle.plus(0.0, 0.0, 3.0);
			*/
			tmp.plus(0.0, 0.0, 12.0);

			/*
			let projectedTriangle = Triangle.create(
				multiplyMatrixVector(translatedTriangle.vertices[0], projection),
				multiplyMatrixVector(translatedTriangle.vertices[1], projection),
				multiplyMatrixVector(translatedTriangle.vertices[2], projection),
			);
			*/

			// GET NORMAL
			let line1, line2;

			line1 = Vector3.zero();
			line1.x = tmp.vertices[1].x - tmp.vertices[0].x;
			line1.y = tmp.vertices[1].y - tmp.vertices[0].y;
			line1.z = tmp.vertices[1].z - tmp.vertices[0].z;

			line2 = Vector3.zero();
			line2.x = tmp.vertices[2].x - tmp.vertices[0].x;
			line2.y = tmp.vertices[2].y - tmp.vertices[0].y;
			line2.z = tmp.vertices[2].z - tmp.vertices[0].z;

			let normal = Vector3.crossProduct(line1, line2);
			normal.normalize();

			let cameraProject = Vector3.create(
				tmp.vertices[0].x - camera.x,
				tmp.vertices[0].y - camera.y,
				tmp.vertices[0].z - camera.z,
			);

			let dotProduct = Vector3.dotProduct(normal, cameraProject);

			// if(normal.z < 0) {
			if (dotProduct < 0) {
				let lightDirection = Vector3.create(0, 0, -1);
				lightDirection.normalize();

				let dp = Vector3.dotProduct(normal, lightDirection);

				// PROJECTION INTO THE SCREEN
				tmp.set(
					multiplyMatrixVector(tmp.vertices[0], projection),
					multiplyMatrixVector(tmp.vertices[1], projection),
					multiplyMatrixVector(tmp.vertices[2], projection)
				);

				// SCALING
				/*
				projectedTriangle.plus(1.0, 1.0, 0.0);
				projectedTriangle.multiply(
					0.5 * WIDTH, 
					0.5 * HEIGHT, 
					1.0
				);
				*/
				tmp.plus(1.0, 1.0, 0.0);
				tmp.multiply(
					0.5 * WIDTH,
					0.5 * HEIGHT,
					1.0
				);

				// drawTriangle(projectedTriangle.vertices);
				// strokeTriangle(tmp.vertices);
				let color = [255, 255, 255, 255];
				color = getColor(dp);

				this.projectedTriangles.push([tmp, dp]);
			}
		}

		this.projectedTriangles.sort(
			function(a, b) {
				let t1 = a[0].vertices;
				let t2 = b[0].vertices;

				let z1 = (t1[0].z + t1[1].z + t1[2].z) / 3.0;
				let z2 = (t2[0].z + t2[1].z + t2[2].z) / 3.0;
				if(z1 == z2) {
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
	// vertex(v[0].x, v[0].y);
	endShape(CLOSE);
}

// GAME LOGIC
const WIDTH = 640;
const HEIGHT = 480;

// GAME VARIABLES
let meshCube;
let projection;
let theta;
let camera;
let meshObject = null;

// GAME METHODS
function preload() {
	createMeshObj("assets/VideoShip.obj.txt");
}

function setup() {
	theta = 1.0;
	camera = Vector3.zero();

	createMeshCube();
	createProjection();

	createCanvas(WIDTH, HEIGHT);
	frameRate(30);
}

function draw() {
	let dt = frameRate() / 1000.0;

	theta += dt;
	update(dt);

	clear();
	background(0);

	// meshCube.draw();
	if (meshObject != null) {
		meshObject.draw();
	}
}

function update(dt) {
	//meshCube.update(dt);
	if (meshObject != null) {
		meshObject.update(dt);
	}
}

function keyPressed() {}

// GAME
function createMeshCube() {
	let triangles = [];

	// SOUTH
	triangles.push(
		Triangle.create(
			Vector3.create(0, 0, 0),
			Vector3.create(0, 1, 0),
			Vector3.create(1, 1, 0)
		)
	);

	triangles.push(
		Triangle.create(
			Vector3.create(0, 0, 0),
			Vector3.create(1, 1, 0),
			Vector3.create(1, 0, 0)
		)
	);

	// EAST
	triangles.push(
		Triangle.create(
			Vector3.create(1, 0, 0),
			Vector3.create(1, 1, 0),
			Vector3.create(1, 1, 1)
		)
	);

	triangles.push(
		Triangle.create(
			Vector3.create(1, 0, 0),
			Vector3.create(1, 1, 1),
			Vector3.create(1, 0, 1)
		)
	);

	// NORTH
	triangles.push(
		Triangle.create(
			Vector3.create(1, 0, 1),
			Vector3.create(1, 1, 1),
			Vector3.create(0, 1, 1)
		)
	);

	triangles.push(
		Triangle.create(
			Vector3.create(1, 0, 1),
			Vector3.create(0, 1, 1),
			Vector3.create(0, 0, 1)
		)
	);

	// WEST
	triangles.push(
		Triangle.create(
			Vector3.create(0, 0, 1),
			Vector3.create(0, 1, 1),
			Vector3.create(0, 1, 0)
		)
	);

	triangles.push(
		Triangle.create(
			Vector3.create(0, 0, 1),
			Vector3.create(0, 1, 0),
			Vector3.create(0, 0, 0)
		)
	);

	// TOP
	triangles.push(
		Triangle.create(
			Vector3.create(0, 1, 0),
			Vector3.create(0, 1, 1),
			Vector3.create(1, 1, 1)
		)
	);

	triangles.push(
		Triangle.create(
			Vector3.create(0, 1, 0),
			Vector3.create(1, 1, 1),
			Vector3.create(1, 1, 0)
		)
	);

	// BOTTOM
	triangles.push(
		Triangle.create(
			Vector3.create(1, 0, 1),
			Vector3.create(0, 0, 1),
			Vector3.create(0, 0, 0)
		)
	);

	triangles.push(
		Triangle.create(
			Vector3.create(1, 0, 1),
			Vector3.create(0, 0, 0),
			Vector3.create(1, 0, 0)
		)
	);

	meshCube = Mesh.create(triangles);

}

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

function createMeshObj(fileName) {
	loadObj(meshObject, fileName);
}