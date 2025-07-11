// these are the letters defined as polygons inside a square with side length 39
// (0,0) is top left, bottom right is (39,39)
// L is left R is right, T is top and B is bottom
const rT = [[4,4],[28,4],[33,9],[33,39],[24,39],[26,37],[26,11],[24,9],[13,9],[13,39],[6,39],[6,9],[4,9]];
const rB = [[6,0],[33,0],[28,5],[25,5],[33,13],[33,30],[35,30],[35,35],[26,35],[26,15],[16,5],[13,5],[13,30],[15,30],[15,35],[4,35],[4,30],[6,30]];
const mL = [[4,4],[13,4],[39,19],[39,26],[13,11],[13,35],[4,35],[4,30],[6,30],[6,9],[4,9]];
const mR = flip(mL, 39, false);
const cT = [[6,39],[6,9],[11,4],[28,4],[33,9],[33,16],[26,16],[26,11],[24,9],[15,9],[13,11],[13,39]];
const cB = flip(cT, 39, true);

// these are the 16 vertices that make up 1/12th of the full circle
const P_0 = [
	[0,866],
	[500,866],
	[0,1200],
	[208,1182],
	[0,1260],
	[55,1259], // 5
	[110,1255],
	[28,1280],
	[84,1277],
	[568,1091],
	[630,1091], // 10
	[582,1118],
	[605,1117],
	[616,1122],
	[632,1113],
	[645,1117] // 15
];

function flip(n, sideLength, overX) {
	return n.map(function([x, y]) {
		if (overX) {
			return [x, sideLength - y];
		}
		return [sideLength - x, y];
	});
}

function generateP(first) {
	const P = [first]
	for (let i = 1; i < 12; ++i) {
		if (i % 2 == 0) { // even
			P.push(rotatePoints(first, -30 * i));
		} else {
			P.push(rotatePoints(first, -30 * (i + 1), true));
		}
	}
	return P;
}

function rotatePoints(coords, angle, reflect=false) {
	return coords.map(function ([x, y]) {
		const radians = angle * Math.PI / 180;
		const cos = Math.cos(radians);
		const sin = Math.sin(radians);
		if (reflect) {
			x = -x;
		}
		return [
			x * cos - y * sin,
			x * sin + y * cos
		];
	});
}

// P is all the points that define the background network lines
// Indexed by which twelfth of the circle the point is in.
// Each of the 12 elements is the 'P_0' array rotated/reflected
const P = generateP(P_0);

// letters and Q are each 6 elements, Q[i] is all 13 quads
// that letters[i] should be placed in.
const letters = [cB, cT, mR, mL, rB, rT];
// these are the quads I found by hand. Each four element array
// is an array of four 2D points, in order TL TR BR BL
const Q = [
// C BOTTOM
	[[[0,0], P[1][0], P[1][1], P[0][0]],
	[P[0][2], P[0][5], P[0][7], P[0][4]],
	[P[1][10], P[1][14], P[1][15], P[0][14]],
	[P[1][2], P[1][4], P[1][7], P[1][5]],
	[P[2][10], P[2][14], P[2][13], P[2][12]],
	[P[3][2], P[3][5], P[3][8], P[3][6]],
	[P[4][10], P[4][12], P[4][11], P[4][9]],
	[P[5][2], P[5][6], P[5][3], P[5][0]],
	[P[6][10], P[6][9], P[6][1], P[7][9]],
	[P[8][2], P[8][0], P[8][3], P[8][6]],
	[P[9][10], P[9][9], P[9][11], P[9][12]],
	[P[10][2], P[10][6], P[10][8], P[10][5]],
	[P[11][10], P[11][12], P[11][13], P[11][14]]],
// C TOP
	[[P[3][0], P[3][1], P[2][0], [0,0]],
	[P[1][12], P[1][13], P[1][14], P[1][10]],
	[P[0][6], P[0][8], P[0][5], P[0][2]],
	[P[11][9], P[11][11], P[11][12], P[11][10]],
	[P[10][0], P[10][3], P[10][6], P[10][2]],
	[P[8][9], P[8][1], P[9][9], P[8][10]],
	[P[7][6], P[7][3], P[7][0], P[7][2]],
	[P[6][12], P[6][11], P[6][9], P[6][10]],
	[P[5][5], P[5][8], P[5][6], P[5][2]],
	[P[4][14], P[4][13], P[4][12], P[4][10]],
	[P[3][4], P[3][7], P[3][5], P[3][2]],
	[P[3][14], P[3][15], P[2][14], P[3][10]],
	[P[2][5], P[2][7], P[2][4], P[2][2]]],
// M RIGHT
	[[P[5][0], P[5][1], P[4][0], [0,0]],
	[P[1][9], P[1][11], P[1][12], P[1][10]],
	[P[0][0], P[0][3], P[0][6], P[0][2]],
	[P[10][9], P[10][1], P[11][9], P[10][10]],
	[P[9][6], P[9][3], P[9][0], P[9][2]],
	[P[8][12], P[8][11], P[8][9], P[8][10]],
	[P[7][5], P[7][8], P[7][6], P[7][2]],
	[P[6][14], P[6][13], P[6][12], P[6][10]],
	[P[5][4], P[5][7], P[5][5], P[5][2]],
	[P[5][14], P[5][15], P[4][14], P[5][10]],
	[P[4][5], P[4][7], P[4][4], P[4][2]],
	[P[3][12], P[3][13], P[3][14], P[3][10]],
	[P[2][6], P[2][8], P[2][5], P[2][2]]],
// M LEFT
	[[P[6][1], P[6][0], [0,0], P[7][0]],
	[P[6][7], P[6][4], P[6][2], P[6][5]],
	[P[6][15], P[6][14], P[6][10], P[7][14]],
	[P[7][7], P[7][5], P[7][2], P[7][4]],
	[P[8][13], P[8][12], P[8][10], P[8][14]],
	[P[9][8], P[9][6], P[9][2], P[9][5]],
	[P[10][11], P[10][9], P[10][10], P[10][12]],
	[P[11][3], P[11][0], P[11][2], P[11][6]],
	[P[0][1], P[1][9], P[0][10], P[0][9]],
	[P[2][3], P[2][6], P[2][2], P[2][0]],
	[P[3][11], P[3][12], P[3][10], P[3][9]],
	[P[4][8], P[4][5], P[4][2], P[4][6]],
	[P[5][13], P[5][14], P[5][10], P[5][12]]],
// R BOTTOM
	[[P[10][0], [0,0], P[11][0], P[10][1]],
	[P[10][14], P[10][10], P[11][14], P[10][15]],
	[P[11][5], P[11][2], P[11][4], P[11][7]],
	[P[0][12], P[0][10], P[0][14], P[0][13]],
	[P[10][4], P[10][2], P[10][5], P[10][7]],
	[P[9][14], P[9][10], P[9][12], P[9][13]],
	[P[8][5], P[8][2], P[8][6], P[8][8]],
	[P[7][12], P[7][10], P[7][9], P[7][11]],
	[P[6][6], P[6][2], P[6][0], P[6][3]],
	[P[5][9], P[5][10], P[4][9], P[5][1]],
	[P[3][0], P[3][2], P[3][6], P[3][3]],
	[P[2][9], P[2][10], P[2][12], P[2][11]],
	[P[1][6], P[1][2], P[1][5], P[1][8]]],
// R TOP
	[[P[8][1], P[8][0], [0,0], P[9][0]],
	[P[6][8], P[6][5], P[6][2], P[6][6]],
	[P[8][7], P[8][4], P[8][2], P[8][5]],
	[P[8][15], P[8][14], P[8][10], P[9][14]],
	[P[9][7], P[9][5], P[9][2], P[9][4]],
	[P[10][13], P[10][12], P[10][10], P[10][14]],
	[P[11][8], P[11][6], P[11][2], P[11][5]],
	[P[0][11], P[0][9], P[0][10], P[0][12]],
	[P[1][3], P[1][0], P[1][2], P[1][6]],
	[P[3][1], P[3][9], P[3][10], P[2][9]],
	[P[4][3], P[4][6], P[4][2], P[4][0]],
	[P[5][11], P[5][12], P[5][10], P[5][9]],
	[P[7][13], P[7][14], P[7][10], P[7][12]]]
];

const pathArray = [];
for (let i = 0; i < letters.length; ++i) {
	for (let j = 0; j < 13; ++j) {
		const sideLength = true ? 39 : 6;
		const coords = squareCoordsToQuad(sideLength, letters[i], Q[i][j]).map(([x, y]) => ([x.toFixed(4), y.toFixed(4)]));
		pathArray.push(makeSVGPath(getPolygonPath(coords)));
	}
}
console.log(`<g fill="maroon">${pathArray.join("")}</g>`);

// FUNCTIONS

function makeSVGPath(d) {
	return `<path ${d}/>`;
}

function getPolygonPath(numbersDoubled) {
	const numbers = [];
	for (let i = 0; i < numbersDoubled.length; ++i) {
		numbers.push(Number(numbersDoubled[i][0]));
		numbers.push(Number(numbersDoubled[i][1]));
	}
	let path = 'd="M' + svgNumbers(numbers[0], numbers[1]);
	for (let i = 2; i < numbers.length - 1; i += 2) {
		const ax = numbers[i - 2];
		const ay = numbers[i - 1];
		const bx = numbers[i];
		const by = numbers[i + 1];
		const hChange = ax != bx;
		const vChange = ay != by;
		if (hChange && vChange) {
			const abs = svgNumbers(bx, by);
			const rel = svgNumbers(bx - ax, by - ay);
			path += abs.length > rel.length ? "l" + rel : "L" + abs;
		} else if (hChange) {
			const abs = svgNumbers(bx); // checks hChange from before rounding
			const rel = svgNumbers(bx - ax);
			path += abs.length > rel.length ? "h" + rel : "H" + abs;
		} else if (vChange) {
			const abs = svgNumbers(by);
			const rel = svgNumbers(by - ay);
			path += abs.length > rel.length ? "v" + rel : "V" + abs;
		}
	}
	return path + 'Z"';
}

function shortNumberString(n) {
	if (!Number.isFinite(n)) {
		console.log(n);
		return n.toString();
	}
	const [
		_, sign, integerPart, decimalPart, exponentPart
	] = n.toString().match(/^(-?)0*(\d*)\.?(\d*)e?(.*)/);
	const fullBase = (integerPart + decimalPart).replace(/^0+/, "");
	if (fullBase.length == 0) {
		return "0";
	}
	let power = Number(exponentPart) - decimalPart.length;
	const shortBase = fullBase.replace(/0+$/, ""); //.slice(0, digits);
	power += fullBase.length - shortBase.length;
	if (0 <= power && power <= 2) {
		return sign + shortBase + "0".repeat(power);
	}
	if (-shortBase.length <= power && power <= -1) {
		const i = shortBase.length + power;
		return sign + shortBase.slice(0, i) + "." + shortBase.slice(i);
	}
	if (power == -shortBase.length - 1) {
		return sign + ".0" + shortBase;
	}
	return sign + shortBase + "e" + power.toString();
}

function svgNumbers(...numbers) {
	return numbers.map(shortNumberString).join().replaceAll(",-", "-"); // replace some ',.' with '.' ?
}

/**
 * @typedef {DOMPoint | [number, number]} Point
 */

/**
 * 
 * @param {number} sideLength 
 * @param {[number, number][]} coords 
 * @param {Point[]} quad 
 * @returns {[number, number][]}
 */
function squareCoordsToQuad(sideLength, coords, quad) {
	const s = 1 / sideLength;
	const nearX = add(quad[1], quad[0], true, s);
	const nearY = add(quad[3], quad[0], true, s);
	const farX = add(quad[2], quad[3], true, s);
	const farY = add(quad[2], quad[1], true, s);
	return coords.map(function ([x, y]) {
		const a1 = add(quad[0], scale(nearX, x));
		const a2 = add(quad[0], scale(nearY, y));
		const b1 = add(quad[3], scale(farX, x));
		const b2 = add(quad[1], scale(farY, y));
		return lineIntersection(a1, b1, a2, b2);
	});

}

/**
 * @param {Point} p
 * @param {number} scalar 
 */
function scale(p, scalar) {
	if ("x" in p) {
		return new DOMPoint(p.x * scalar, p.y * scalar);
	}
	return new DOMPoint(p[0] * scalar, p[1] * scalar);
}

/**
 * @param {Point} p
 * @param {Point} q 
 * @param {boolean} negate - If true, returns p - q. The second
 * point is negated in the sum.
 * @param {number} s - Scale the resulting sum by this scalar
 */
function add(p, q, negate = false, s = 1) {
	let px, py, qx, qy;
	if ("x" in p) {
		px = p.x;
		py = p.y
	} else {
		px = p[0];
		py = p[1];
	}
	if ("x" in q) {
		qx = q.x;
		qy = q.y
	} else {
		qx = q[0];
		qy = q[1];
	}
	if (negate) {
		qx = -qx;
		qy = -qy;
	}
	return new DOMPoint((px + qx) * s, (py + qy) * s);
}

/**
 * Finds the intersection point of two lines. One line is given, and the other
 * is the extension of the line segment between two given points.
 * @param {DOMPoint} p - The first of the two points which define the first line.
 * @param {DOMPoint} q - The second of the two points which define the first line.
 * @param {DOMPoint} a
 * @param {DOMPoint} b
 * @returns {[number, number]} The 2D point of intersection.
 */
function lineIntersection(p, q, a, b) {
	const n1 = p.x * q.y - p.y * q.x;
	const n2 = a.x * b.y - a.y * b.x;
	const n3 = (p.x - q.x) * (a.y - b.y) - (p.y - q.y) * (a.x - b.x);
	return [
		(n1 * (a.x - b.x) - (p.x - q.x) * n2) / n3,
		(n1 * (a.y - b.y) - (p.y - q.y) * n2) / n3
	];
}
