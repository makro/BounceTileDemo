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

function drawWorld() {

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
}

// -------------------------------------------------------------------------
// Load images and start

var pics = {
    "WHITE": "src/img/whitetile.png",
    "GRAY": "src/img/graytile.png",
    "DARK": "src/img/darktile.png"
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
    }, 20 /* milliseconds -> 50Hz */); 
});

