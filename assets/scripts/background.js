//Canvas stuff

//Draws a rectangle on the canvas
function drawRectangle(canvas, position, rectangle, colour) {
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = rgbToHex(colour)
    ctx.fillRect(position.x, position.y, rectangle.width, rectangle.height)
}

function drawFilledCircle(canvas, position, radius, colour) {
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = rgbToHex(colour);
    ctx.fill();
}

//Clears the canvas
function clearCanvas(canvas, colour) {
    drawRectangle(canvas, new Position(0, 0), new Rectangle(canvas.width, canvas.height), colour)
}

// Gets the actual mouse position over a canvas
function getActualMousePos(canvas, position) {
    var rect = canvas.getBoundingClientRect();

    return new Position(position.x - rect.left, position.y - rect.top);
}

class Rectangle {
    constructor(width, height) {
        this.height = height;
        this.width = width;
    }
}

class Colour {
    constructor(r, g, b) {
        this.red = r;
        this.green = g;
        this.blue = b;
    }
}

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

//https://stackoverflow.com/a/5624139
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(colour) {
    return "#" + componentToHex(colour.red) + componentToHex(colour.green) + componentToHex(colour.blue);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? new Colour(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) : null;
}

//https://stackoverflow.com/a/54569758
function invertRGB(rgb) {

    var hexColour = "#" + (Number(`0x1${rgbToHex(rgb).replace("#", "")}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()

    return hexToRgb(hexColour)
}

//Constants
const canvas = document.getElementById("background-canvas")
const ctx = canvas.getContext("2d");

const squareSize = 16;
const defaultColour = new Colour(0, 0, 0);
const gradientScale = 100;
const brightestColour = new Colour(0, 84, 132)

const mobileFramerate = 5;
var mobilePos = { clientX: 128, clientY: 128 }
const mobileSpeed = 5;

var enabled = true;

var gridHeight, gridWidth = 0;

var grid = [
    []
];

function onWindowResize() {

    var body = document.body,
        html = document.documentElement;

    var height = "756"

    var width = html.clientWidth;

    canvas.width = width;
    canvas.height = height;

    if (!enabled && width > 600) {
        enabled = true;
        window.onmousemove = updateCanvas;
    }

    if (width < 600) {
        enabled = false;
        updateCanvas({});
        return;
    }

    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fill();

    //Regenerate the grid

    gridWidth = Math.round(canvas.width / squareSize)
    gridHeight = Math.round(canvas.height / squareSize)
}

function createAndFillTwoDArray({
    rows,
    columns,
    defaultValue
}) {
    return Array.from({ length: rows }, () => (
        Array.from({ length: columns }, () => defaultValue)
    ))
}

function updateCanvas(e) {

    if (!enabled) {
        drawRectangle(canvas, new Position(0, 0), new Rectangle(canvas.width, canvas.height), brightestColour)
        return;
    }

    var actualPos = getMousePos(canvas, e);

    var x = actualPos.x * 16;
    var y = actualPos.y * 16;

    // var drawX, drawY = 0;

    for (let indexY = 0; indexY < gridHeight; indexY++) {
        for (let indexX = 0; indexX < gridWidth; indexX++) {

            var gradient = calcGradient(new Position(Math.round(x / squareSize), Math.round(y / squareSize)), new Position(indexX * squareSize, indexY * squareSize));
            var squareColour = new Colour(Math.round(clamp(gradient, 0, 1) * brightestColour.red), Math.round(clamp(gradient, 0, 1) * brightestColour.green), Math.round(clamp(gradient, 0, 1) * brightestColour.blue));

            //console.log(squareColour)

            drawRectangle(canvas, new Position(indexX * squareSize, indexY * squareSize), new Rectangle(squareSize, squareSize), squareColour);
        }

    }
}


//Use pythagoras to calculate the mouse distance from the square to determine the brightness. Returns a float from 0 to 1.
//Used for calculating the gradient shading.
function calcGradient(pointA, pointB) {

    //Calculate distance in pixels first
    var pixelDistance = Math.round(Math.sqrt(Math.abs(pointA.x - pointB.x) ** 2 + Math.abs(pointA.y - pointB.y) ** 2));

    //Calculate grid distance.
    var gridDistance = Math.round(pixelDistance / squareSize)

    return (gridDistance / gradientScale)

}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

const randomNumber = (max) => Math.floor(Math.random() * max) + 1;
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

window.onresize = onWindowResize;
window.onmousemove = updateCanvas;

//Call it for intitial loading
onWindowResize();
updateCanvas({ clientX: 128, clientY: 128 });

//If on mobile, don't update the canvas
if (window.innerWidth < 600) {
    window.onmousemove = null;
    updateCanvas({});
    enabled = false;
}