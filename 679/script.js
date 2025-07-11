const defaultCharMap = `&"><'%X\tZ\n$~()*@`;
const query = new URLSearchParams(window.location.search);

String.prototype.slashEscaped = function () {
	return JSON.stringify(this).slice(1, -1).replace(/\\"/g, '"');
};

String.prototype.pullNumberArray = function () {
	return (this.match(/-?(?:\d*\.)?\d+(?:[eE]-?\d+)?/g) ?? []).map(Number);
};

/**
 * Start by converting n to a string and isolating the important parts. If
 * string's last character is not numeric, as is the case when n is Infinity,
 * return the string unchanged. First pull the decimal out of the base and
 * adjust the exponent accordingly. If the base is zero return "0". Then shorten
 * the base by removing trailing zeros, and adjust the exponent. At this point n
 * is represented as an integer base with no leading or trailing zeros
 * multiplied by 10 to some integer power. Next there are three cases to
 * consider. If the exponent is 0, 1, or 2 add trailing zeros to the base and
 * return. Example: "60" is shorter than "6e1". If the exponent is negative and
 * its absolute value is no more than one greater than the length of the base,
 * add a decimal point and return. Example: ".06" is shorter than "6e-2".
 * Otherwise return the base, "e", and the exponent concatenated together.
 * Examples: "6e3" is shorter than "6000" and "16e-9" is shorter than "1.6e-8".
 *
 * @param {number} n - The number to create a string representation for.
 */
function shortNumberString(n, rounding = "none") {
	if (!Number.isFinite(n)) {
		return typeof n === "number" ? n.toString() : "NaN";
	}
	const [
		_, sign, integerPart, decimalPart, exponentPart
	] = n.toString().match(/^(-?)0*(\d*)\.?(\d*)e?(.*)/);
	const fullBase = (integerPart + decimalPart).replace(/^0+/, "");
	if (fullBase.length == 0) {
		return "0";
	}
	let power = Number(exponentPart) - decimalPart.length;
	let shortBase;
	if (rounding.toString().slice(0, 5) == "round") {
		const i = fullBase.length + power - Number(rounding.slice(5));
		if (i < fullBase.length && Number(fullBase[i]) >= 5) {
			const rounded = Number(fullBase.slice(0, i)) + 1;
			shortBase = rounded.toString().replace(/0+$/, "");
		} else {
			shortBase = fullBase.slice(0, i).replace(/0+$/, "");
		}
		if (shortBase.length == 0) {
			return "0";
		}
	} else {
		shortBase = fullBase.replace(/0+$/, "");
	}
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
	return numbers.map(shortNumberString).join().replaceAll(",-", "-");
}

const stringFunctions = {
	toWebpage: ["HTML to Webpage", defaultCharMap.slashEscaped(), "(leave blank for default character swapping map)", function (arg, fellback) {
		if (fellback) {
			return "https://6t.lt?h=" + this.charSwap(defaultCharMap).toQueryValue();
		}
		return `https://6t.lt?m=${arg.toQueryValue()}&h=${this.charSwap(arg).toQueryValue()}`;
	}],
	getNumbers: ["Retrieve Numbers", ",", "(separator)", function (arg) {
		return this.pullNumberArray().join(arg);
	}],
	getPolygonPath: ["Convert to SVG Polygon Path", "Unused", '(pass a stroke width to draw only vertices)', function (arg) {
		const numbers = this.pullNumberArray();
		if (numbers.length < 2) {
			return "Not enough numbers in the input text.";
		}
		const strokeWidth = Number(arg);
		const noLines = strokeWidth > 0;
		let path = 'd="M' + svgNumbers(numbers[0], numbers[1]);
		if (noLines) {
			path = `stroke-width="${svgNumbers(strokeWidth)}" ${path}v0`;
		}
		for (let i = 2; i < numbers.length - 1; i += 2) {
			const ax = numbers[i - 2];
			const ay = numbers[i - 1];
			const bx = numbers[i];
			const by = numbers[i + 1];
			const hChange = ax != bx;
			const vChange = ay != by;
			if (noLines) {
				const abs = svgNumbers(bx, by);
				const rel = svgNumbers(bx - ax, by - ay);
				path += abs.length > rel.length ? "m" + rel : "M" + abs;
				path += "v0";
			} else if (hChange && vChange) {
				const abs = svgNumbers(bx, by);
				const rel = svgNumbers(bx - ax, by - ay);
				path += abs.length > rel.length ? "l" + rel : "L" + abs;
			} else if (hChange) {
				const abs = svgNumbers(bx);
				const rel = svgNumbers(bx - ax);
				path += abs.length > rel.length ? "h" + rel : "H" + abs;
			} else if (vChange) {
				const abs = svgNumbers(by);
				const rel = svgNumbers(by - ay);
				path += abs.length > rel.length ? "v" + rel : "V" + abs;
			}
		}
		// TODO improvements: shorten colors option -> round to #RGB format from #RRGGBB or named colors less than 4 characters.
		// take cycle and use Z to remove the edge which contributes the most characters
		// one main goal: reduce size without losing information. Exception would be rounding numbers or colors. But this means I don't want to remove points which are midway along a line segment, even though removing it would not change the image. Could remove adjacent points that are identical though.
		// Short <paint> Values Allowed in SVG stroke attribute:
		// Blue #0000FF
		// Cyan #00FFFF
		// Gold #FFD700
		// Gray #808080
		// Lime #00FF00
		// Navy #000080
		// Peru #CD853F
		// Pink #FFC0CB
		// Plum #DDA0DD
		//  Red #FF0000
		// Snow #FFFAFA
		//  Tan #D2B48C
		// Teal #008080
		// note: Mark, Menu system colors
		return path + (noLines ? '" stroke="CanvasText" stroke-linecap="round"' : 'Z"');
	}],
	noIndentation: ["Remove Newlines and Tabs", "Unused", "", function () {
		return this.replace(/[\n\r\t]/g, "");
	}],
	charSwap: ["Character Swap", "7>5<(S)T", "(reflective mapping)", function (arg) {
		const mapMatch = new RegExp(`[${arg.replace(/[\\^\]-]/g, "\\$&")}]`, "g"); // some characters need to be escaped in regex character class
		return this.replace(mapMatch, function (char) {
			return arg.charAt(arg.length - arg.indexOf(char) - 1);
		});
	}],
	toScriptVar: ["Assign to ES Variable", "Unused", "", function () {
		const rep = `let str = ${JSON.stringify(this)};`;
		if (!/\\/.test(rep)) { // no escapes were necessary
			return rep;
		}
		if (!/\\[^"]|'/.test(rep)) { // only double quotes were escaped, and there are no single quotes
			return `let str = '${this}';`;
		}
		if (!/\\[^"]|`|\${/.test(rep)) { // only double quotes were escaped, and there are no backticks or "${"
			return `let str = \`${this}\`;`;
		}
		return rep;
	}],
	toDataURI: ["Create Data URI", "text/plain;charset=UTF-8", "(media type with parameters)", function (arg) {
		return `data:${arg},${encodeURI(this).replaceAll("#", "%23")}`;
	}],
	toQueryValue: ["Encode Query Value", "Unused", "", function () {
		return encodeURI(this).replace(/[#&'+]|%20/g, function (char) {
			return { "#": "%23", "&": "%26", "'": "%27", "+": "%2B", "%20": "+" }[char];
		});
	}]
};

const inputArea = document.getElementById("input");
const outputArea = document.getElementById("output");
const functionSelect = document.getElementById("choose-function");
const argInput = document.getElementById("modifier");
const argDesc = document.getElementById("modifier-desc");
const urlInput = document.getElementById("web-input");
const copyButton = document.getElementById("copy");

if (query.get("f") != null) {
	try {
		stringFunctions.userFunction = [
			query.get("f-name") ?? "Custom Function",
			query.get("a") ?? "Unspecified",
			query.get("a-hint") ?? "",
			new Function("arg, fellback", query.get("f"))
		];
	} catch (error) {
		inputArea.value = "Failed to parse 'f' parameter: " + error.message;
	}
}

for (const [key, val] of Object.entries(stringFunctions)) {
	String.prototype[key] = val[3];
	functionSelect.insertAdjacentHTML("afterbegin", `<option value="${key}">${val[0]}</option>`);
}
functionSelect.value = functionSelect.firstChild.value;

document.getElementById("apply-function").addEventListener("mousedown", function () {
	if (!inputArea.value) {
		inputArea.value = '<p style="color: #E97">✿</p>';
	}
	const key = functionSelect.value;
	const arg = argInput.value || stringFunctions[key][1];
	outputArea.value = inputArea.value[key](arg, !argInput.value);
});

function setArgHint() {
	const val = stringFunctions[functionSelect.value];
	argInput.value = "";
	argInput.placeholder = val[1];
	argDesc.innerText = val[2];
}

setArgHint();
functionSelect.addEventListener("change", setArgHint);

urlInput.addEventListener("keydown", async function (event) {
	if (event.key == "Enter") {
		try {
			const res = await fetch(urlInput.value);
			if (!res.ok) {
				throw new Error("response status: " + res.status);
			}
			inputArea.value = await res.text();
		} catch (error) {
			inputArea.value = "Failed to retrieve input from URL. " + error.message;
		}
	}
});

copyButton.addEventListener("mousedown", function () {
	navigator.clipboard.writeText(outputArea.value);
	copyButton.innerText = "Copied!";
	setTimeout(function () {
		copyButton.innerText = "Copy to Clipboard";
	}, 1200);
});

document.getElementById("move").addEventListener("mousedown", function () {
	inputArea.value = outputArea.value;
	outputArea.value = "";
});
