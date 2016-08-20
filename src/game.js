/*
 *  Bounce Game Demo
 *  by Marko Kallinki, 19.08.2016
 *  Copyright - Do not distribute
 */

// -------------------------------------------------------------------------
// Setup canvas variables
var htmlCanvas = document.getElementById('htmlcanvas'),
    canvasW = htmlCanvas.width,
    canvasH = htmlCanvas.height,
    canvas = htmlCanvas.getContext('2d'),
    mouseX = -1, mouseY = -1, mouseDown = false,
    keyPressed = null;

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

htmlCanvas.addEventListener("mousemove",
    function(evt) {
        var mousePos = getMousePos(htmlCanvas, evt);
        mouseX = mousePos.x;
        mouseY = mousePos.y;
    }, false);

htmlCanvas.addEventListener("mousedown",
    function(evt) {
        mouseDown = true;
    }, false);

htmlCanvas.addEventListener("mouseup",
    function(evt) {
        mouseDown = false;
    }, false);

htmlCanvas.addEventListener("keydown",
    function(evt) {
        // WASD and Arrow keys 
        if      (evt.keyCode == 87 || evt.keyCode == 38) { keyPressed = "Up"; }
        else if (evt.keyCode == 83 || evt.keyCode == 40) { keyPressed = "Down"; }
        else if (evt.keyCode == 65 || evt.keyCode == 37) { keyPressed = "Left"; }
        else if (evt.keyCode == 68 || evt.keyCode == 39) { keyPressed = "Right"; }
        else if (evt.keyCode == 32) { keyPressed = "Spacebar"; }
        else if (evt.keyCode == 16) { keyPressed = "Shift"; }
        else if (evt.keyCode == 17) { keyPressed = "Control"; }
        else if (evt.keyCode == 27) { keyPressed = "Escape"; }
    }, true);

htmlCanvas.addEventListener("keyup",
    function(evt) {
        keyPressed = null;
    }, true);

// -------------------------------------------------------------------------
// Draw functions
function drawImg(key, x, y) {
    canvas.drawImage(pics[key], x, y);
}

function drawEmptyScreen() {
    canvas.fillStyle = "black";
    canvas.fillRect(0, 0, canvasW, canvasH);
    canvas.fillStyle = "white";
    canvas.fillRect(1, 1, canvasW-2, canvasH-2);
}

function drawTestData() {
    canvas.font = "16px Courier New";
    canvas.fillStyle = "black";
    canvas.fillText("Canvas", 130, 110);

    canvas.fillText("Mouse X:" + mouseX + " Y:" + mouseY, 80, 140);
    if (mouseDown) {
        canvas.fillText("Mouse pressed", 100, 160);
    }
    if (keyPressed) {
        canvas.fillText("Key " + keyPressed + " pressed", 90, 180);
    }
}

var world = [
    "...................",
    "......WWW..........",
    ".....WWWWW.........",
    "....WWWWWWW........",
    "...GGGGGGGGG.......",
    "..GGGGGGGGGGG......",
    "..GGGGGGGGGGGG.....",
    "..DDDDDDDDDDDDD....",
    "...DDDDD.DDDDDDD...",
    "....DDDDDDDDDDDWW..",
    ".....DDDDDDDDDDWW..",
    "......DDDDDDDDDWW..",
    ".......DDD.DDDDD...",
    "........DDDDDDD....",
    ".........DGGGD.....",
    "..........GGG......"
];

function drawWorld() {

    for(var y = 0; y < 16; y++) {
        for(var x = 18; x >= 0; x--) {
            tile = world[y][x];
            //console.log("tile:" + tile);
            var nx = -320 + x * 60 + y * 65;
            var ny = 380 + y * 50 - x * 47;

            if (tile == "G") {
                drawImg("GRAY", nx, ny);
            } else if (tile == "W") {
                drawImg("WHITE", nx, ny);
            } else if (tile == "D") {
                drawImg("DARK", nx, ny);
            }
        }
    }

    player.draw();
}


function calcGridX(x, y) {
    return -320 + x * 60 + y * 65;
}

function calcGridY(x, y) {
    return 380 + y * 50 - x * 47;
}

// -------------------------------------------------------------------------
// Player class
function Player() {
    // Use image names as directions
    this.gx = 10;
    this.gy = 10;
    this.nextgx = 9;
    this.nextgy = 10;
    this.direction = "LEFT";
    this.draw = function() {
        var nx = calcGridX(this.gx, this.gy);
        var ny = calcGridY(this.gx, this.gy);
        
        // Slide to next grid
        nx -= (nx - calcGridX(this.nextgx, this.nextgy)) * gamescale;
        ny -= (ny - calcGridY(this.nextgx, this.nextgy)) * gamescale; 

        // Add jump effect
        if (gamescale < .5) ny -= (gamescale*70);
        else ny -= 70 - (gamescale*70);

        drawImg(this.direction, nx - 35, ny + 10);
    }
}

// -------------------------------------------------------------------------
// Load images and start
var gamespeed = 50;
var gametick = 0;
var gamescale = 0;
var player = new Player();

var pics = {
    "WHITE": "src/img/whitetile.png",
    "GRAY": "src/img/graytile.png",
    "DARK": "src/img/darktile.png",
    "UP": "src/img/walkup.png",
    "DOWN": "src/img/walkdown.png",
    "RIGHT": "src/img/walkright.png",
    "LEFT": "src/img/walkleft.png"
};

preloadImages(pics, function() {
    console.log("Callback!");
    _.each(Object.keys(pics), function(key) {
        console.log("CB: " + key + " = " + pics[key]);
    });

    // Core loop
    setInterval(function() {
        drawEmptyScreen();
        drawWorld();
        drawTestData();

        gametick++;
        if (gametick > gamespeed) gametick = 0;
        gamescale = gametick/gamespeed;

        if (keyPressed == "Up") {
            player.nextgy = player.gy - 1;
            player.nextgx = player.gx;
            player.direction = "UP";
        }
        if (keyPressed == "Down") {
            player.nextgy = player.gy + 1;
            player.nextgx = player.gx;
            player.direction = "DOWN";
        }
        if (keyPressed == "Right") {
            player.nextgy = player.gy;
            player.nextgx = player.gx + 1;
            player.direction = "RIGHT";
        }
        if (keyPressed == "Left") {
            player.nextgy = player.gy;
            player.nextgx = player.gx - 1;
            player.direction = "LEFT";
        }         
                 
    }, 20 /* milliseconds -> 50Hz */); 
});

