/**
 * https://www.desmos.com/calculator/xx23ttfmem
 * @param {[number, number]} startRay
 * @param {[number, number]} onRay
 * @param {[number, number]} startSeg
 * @param {[number, number]} endSeg
 * @returns {boolean}
 */
function rayIntersectsSegment(startRay, onRay, startSeg, endSeg) {
	const [ax, ay] = startRay;
	const [bx, by] = onRay;
	const [cx, cy] = startSeg;
	const [dx, dy] = endSeg;
	if (bx == ax) {
		if (dx == cx || ax < cx == ax < dx) {
			return false;
		}
		return 0 < (by - ay) * (cy - ay - (cx - ax) * (dy - cy) / (dx - cx));
	}
	const raySlope = (by - ay) / (bx - ax);
	if (cy - ay < raySlope * (cx - ax) == dy - ay < raySlope * (dx - ax)) {
		return false;
	}
	if (dx == cx) {
		return 0 < (bx - ax) * (dx - ax);
	}
	const segSlope = (dy - cy) / (dx - cx);
	return 0 < (bx - ax) * (segSlope - raySlope) * (segSlope * (cx - ax) - cy + ay);
}

/**
 * @param {[number, number][]} vts
 * @param {DOMPoint} onRay - The ray starts at the origin and
 * passes through this point.
 * @returns {[[number, number], [number, number]]} - An edge of
 * the polygon which intersects the ray, assuming that at least
 * one does. If the given vertices define a convex polygon with
 * the origin inside it, then exactly one side intersects most
 * given rays. If the ray passes exactly through a vertex then
 * this function may return an incorrect edge.
 */
function sideOfPolygonOnRay(vts, onRay) {
	for (let i = 0; i < vts.length - 1; ++i) {
		const startSide = vts[i];
		const endSide = vts[i + 1];
		if (rayIntersectsSegment([0, 0], [onRay.x, onRay.y], startSide, endSide)) {
			return [startSide, endSide];
		}
	}
	return [vts.at(-1), vts[0]];
}

/**
 * @param {[[number, number], [number, number]]} segmentOfReflectionLine
 * @returns {DOMMatrix}
 */
function reflectionMatrix(segmentOfReflectionLine) {
	const [[px, py], [qx, qy]] = segmentOfReflectionLine;
	let matrixInit;
	if (qx == px) {
		matrixInit = [-1, 0, 0, 1, 2 * px, 0];
	} else {
		const m = (qy - py) / (qx - px);
		const b = py - m * px;
		const d = 1 / (m * m + 1);
		matrixInit = [
			1 - m * m,
			2 * m,
			2 * m,
			m * m - 1,
			-2 * m * b,
			2 * b
		].map(e => e * d);
	}
	return new DOMMatrix(matrixInit);
}

/**
 * I should be able to use .invertSelf() instead of .inverse()
 * here, but .getScreenCTM() is returning an SVGMatrix instead
 * of a DOMMatrix.
 * @param {MouseEvent} mouseEvent - Has x and y attributes.
 * @param {SVGGraphicsElement} svgGE
 * @returns {DOMPoint}
 */
function svgMouseCoords(mouseEvent, svgGE) {
	const m = svgGE.getScreenCTM().inverse();
	// console.log(m);
	return DOMPoint.fromPoint(mouseEvent).matrixTransform(m);
}

/**
 * @param {[number, number]} p
 * @param {[number, number]} [q]
 * @returns {[number, number] | (r: number) => [number, number]}
 */
function add2D(p, q = null) {
	if (q === null) {
		return r => add2D(p, r);
	}
	return [p[0] + q[0], p[1] + q[1]];
}

/**
 * @param {string} vertexString - Optionally a JSON string
 * representation of an array of [number, number] elements. If
 * the string is not parsed as an array, then this function
 * returns null.
 * @returns {[number, number][] | null}
 */
function recenterPolygon(vertexString) {
	try {
		const vts = JSON.parse(vertexString);
		if (vts instanceof Array) {
			return vts.map(add2D(vts.reduce(add2D, [0, 0]).map(x => x / -vts.length)));
		}
	} catch {}
	return null;
}

/**
 * @param {number} n - Integer greater than 2.
 * @returns {[number, number][]}
 */
function regularPolygon(n) {
	const vts = [];
	const centerAngle = 2 * Math.PI / n;
	for (let i = 0; i < n; ++i) {
		vts.push([
			Math.cos(centerAngle * i),
			Math.sin(centerAngle * i)
		]);
	}
	return vts;
}

/**
 * @param {[number, number][]} vts
 * @returns {string} - Formatted to be assigned to the points
 * attribute of the SVG polygon element.
 */
function polygonToString(vts) {
	return vts.map(v => v.join(",")).join(" ");
}

/**
 * @param {DOMPoint} p
 * @returns {DOMMatrix}
 */
function translateTo(p) {
	return new DOMMatrix().translateSelf(p.x, p.y);
}

// Global Variables
const params = {
	borderColor: "CanvasText",
	decimalPlaces: "12",
	fillColor: "red",
	heightOfPolygon: "10",
	inlineStyle: "background-color: Canvas; color-scheme: light dark",
	selectedWidth: ".5",
	unselectedWidth: ".1",
	vertices: "5"
};
const svg = document.getElementById("mirror_polygon");
let selected;
let polygonElement;
let polygonVertices;

/**
 * @param {string} queryString
 */
function setParams(queryString) {
	const usp = new URLSearchParams(queryString);
	for (const [key, value] of Object.entries(params)) {
		params[key] = usp.get(key.charAt(0)) ?? value;
	}
}

/**
 * @param {[number, number][]} vts - A [number, number] array
 * with at least one element.
 * @param {number} height
 * @returns {[number, number][]} - Point coordinates are rounded
 */
function scalePolygon(vts, height) {
	const [high, low] = vts.reduce(function ([hi, lo], [_, y]) {
		return [Math.max(hi, y), Math.min(lo, y)];
	}, [-Infinity, Infinity]);
	const scale = height / (high - low);
	return vts.map(v => v.map(x => +(x * scale).toFixed(+params.decimalPlaces)));
}

/**
 * @returns {[SVGGraphicsElement, [number, number][]]}
 */
function getBasePolygon() {
	const pg = document.createElementNS(svg.namespaceURI, "polygon");
	pg.setAttribute("fill", params.fillColor);
	pg.setAttribute("stroke", params.borderColor);
	const shape = recenterPolygon(params.vertices) ?? regularPolygon(+params.vertices);
	const vts = scalePolygon(shape, params.heightOfPolygon);
	pg.setAttribute("points", polygonToString(vts));
	return [pg, vts];
}

/**
 * @param {SVGGraphicsElement} target
 */
function setSelected(target) {
	if (target === selected) {
		return;
	}
	if (svg !== target) {
		target.setAttribute("stroke-width", params.selectedWidth);
	}
	if (svg !== selected) {
		selected.setAttribute("stroke-width", params.unselectedWidth);
	}
	selected = target;
}

/**
 * @param {DOMMatrix} matrix
 */
function addPolygon(matrix) {
	const pg = polygonElement.cloneNode(false);
	// /* Converts the DOMMatrix to an SVGMatrix to avoid errors
	// observed in Chrome and MS Edge, but this should not be
	// necessary with SVG 2.
	matrix = "abcdef".split("").reduce(function (svgM, e) {
		svgM[e] = matrix[e];
		return svgM;
	}, svg.createSVGMatrix()); // */
	const svgT = svg.createSVGTransformFromMatrix(matrix);
	pg.transform.baseVal.appendItem(svgT);
	svg.appendChild(pg);
	setSelected(pg);
}

/**
 * Deletes selected polygon, then selects its previous sibling.
 * If no polygon is selected, then the most recently created
 * polygon is selected.
 */
function deletePolygon() {
	let next;
	if (svg === selected) {
		next = svg.lastElementChild;
	} else {
		next = selected.previousElementSibling;
		svg.removeChild(selected);
	}
	setSelected(next ?? svg);
}

/**
 * The function encodeURI does not escape the unreserved
 * characters listed on the following line.
 * A–Z a–z 0–9 - _ . ! ~ * ' ( )
 * The following reserved characters are also not escaped.
 * ; / ? : @ & = + $ ,
 * Finally, the character "#" is not escaped, but as it
 * indicates the beginning of a fragment identifier it is not
 * allowed in the data component of a data URI.
 * @param {string} xml
 */
function svgDataURI(xml) {
	return "data:image/svg+xml;charset=UTF-8," + encodeURI(xml).replaceAll("#", "%23");
}

setParams(window.location.search);
selected = svg;
[polygonElement, polygonVertices] = getBasePolygon();
svg.replaceChildren();
svg.setAttribute("style", params.inlineStyle);
svg.addEventListener("mousedown", function (event) {
	if (event.shiftKey) {
		setSelected(event.target);
		return;
	}
	const click = svgMouseCoords(event, selected);
	if (selected === svg) {
		addPolygon(translateTo(click));
		return;
	}
	const reflectionLine = sideOfPolygonOnRay(polygonVertices, click);
	const lastMatrix = selected.transform.baseVal.getItem(0).matrix;
	addPolygon(reflectionMatrix(reflectionLine).preMultiplySelf(lastMatrix));
});
svg.addEventListener("keydown", function (event) {
	switch (event.key) {
		case "Backspace":
		case "Delete":
			deletePolygon();
			break;
		case "c":
		case "C":
			if (event.ctrlKey || event.metaKey) {
				navigator.clipboard.writeText(svgDataURI(svg.outerHTML));
			}
			break;
		case "F3":
			console.log(svg.children.length);
	}
});
