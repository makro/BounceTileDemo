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

function drawImg(key, x, y) {
    canvas.drawImage(pics[key], x, y);
}

function drawEmptyScreen() {
    canvas.fillStyle = "black";
    canvas.fillRect(0, 0, canvasW, canvasH);
    canvas.fillStyle = "white";
    canvas.fillRect(1, 1, canvasW-2, canvasH-2);
}

// -------------------------------------------------------------------------
// World class
function World() {
    this.mapH = 16;
    this.mapW = 21;
    this.map = [
        "....................",
        ".......GDG..........",
        "......WWDWW.........",
        ".....WWWDWGW........",
        ".....WWWDWWW........",
        "54321543215432154321",
        "...WWWW.WWWWGDD.....",
        "...WWWG.WWWW..D.....",
        "........DDD.GWGGG...",
        ".....GWWWWD.WWDDWW..",
        "......WWWWDWGWWWWW..",
        ".......WWWDG.G.DG...",
        "........WWD.G.GGG...",
        ".........GWWGWW.....",
        "..........WWGWW.....",
        "............G......."
    ];
    this.backupmap = this.map.slice();
    this.reset = function() {
        this.platformTick = 4;
        this.map = this.backupmap.slice();
    }
    this.at = function(x, y) {
        return this.map[y][x];
    }
    this.change = function(x, y, char) {
        this.map[y] =
            this.map[y].substring(0, x) + char +
            this.map[y].substring(x + 1);
    }
    this.calcGridX = function(x, y) {
        return -380 + x * 60 + y * 65;
    }
    this.calcGridY = function(x, y) {
        return 430 + y * 50 - x * 47;
    }
    this.update = function() {
        // Move platforms
        if (++this.platformTick == 6) {
            this.platformTick = 1;
        }
        // Clear falling blocks
        for(var y = 0; y < this.mapH; y++) {
            for(var x = this.mapW - 1; x >= 0; x--) {
                tile = world.at(x, y);
                if (tile == 'd') {
                    world.change(x, y, '.');
                }
            }
        }
    }
    this.draw = function() {
        for(var y = 0; y < this.mapH; y++) {
            for(var x = this.mapW - 1; x >= 0; x--) {
                tile = world.at(x, y);
                var nx = world.calcGridX(x, y);
                var ny = world.calcGridY(x, y);

                if (tile == "G") {
                    drawImg("GRAY", nx, ny);
                } else if (tile == "W") {
                    drawImg("WHITE", nx, ny);
                } else if (tile == "D") {
                    drawImg("DARK", nx, ny);
                } else if (tile == "d") {
                    // Falling block
                    ny += (gamescale*70);
                    drawImg("DARK", nx, ny);
                }

                if (tile == this.platformTick) {
                    nx -= (nx - world.calcGridX(x + -1, y)) * gamescale;
                    ny -= (ny - world.calcGridY(x + -1, y)) * gamescale; 
                    drawImg("GRAY", nx, ny);
                }

                if (player.isDrawPosition(x, y)) {
                    player.draw();
                }
            }
        }
    }    
}

// -------------------------------------------------------------------------
// Player class
function Player() {

    this.reset = function() {
        gametick = gamespeed / 2;
        this.falling = false;
        this.gx = 10;
        this.gy = 10;
        this.nextgx = 10;
        this.nextgy = 10;
        this.direction = "LEFT";
        this.nextdir = "LEFT";
        this.nextlocked = false;
    }
    this.turnRight = function() {
        if (!this.nextlocked) {
            if (this.direction == "UP") this.nextdir = "RIGHT";
            if (this.direction == "RIGHT") this.nextdir = "DOWN";
            if (this.direction == "DOWN") this.nextdir = "LEFT";
            if (this.direction == "LEFT") this.nextdir = "UP";
            this.nextlocked = true;
        }
    }
    this.turnLeft = function() {
        if (!this.nextlocked) {
            if (this.direction == "UP") this.nextdir = "LEFT";
            if (this.direction == "LEFT") this.nextdir = "DOWN";
            if (this.direction == "DOWN") this.nextdir = "RIGHT";
            if (this.direction == "RIGHT") this.nextdir = "UP";
            this.nextlocked = true;
        }
    }
    this.moveDirection = function() {
        this.nextlocked = false;
        if (this.falling) {
            world.reset();
            this.reset();
        } else {
            this.gy = this.nextgy;
            this.gx = this.nextgx;
            var tile = world.at(this.gx, this.gy);

            if (tile == '.' ||
            ((tile == '1' || tile == '2' || tile == '3' || tile == '4' || tile == '5') && (tile != world.platformTick))) {
                this.falling = true;
            } else {
                if (this.nextdir == "UP") { this.nextgy = this.gy - 1; }
                if (this.nextdir == "DOWN") { this.nextgy = this.gy + 1; }
                if (this.nextdir == "RIGHT") { this.nextgx = this.gx + 1; }
                if (this.nextdir == "LEFT") { this.nextgx = this.gx - 1; }
                this.direction = this.nextdir;
            }

            if (tile == 'W') {
                world.change(this.gx, this.gy, 'G');
            }
            if (tile == 'D') {
                world.change(this.gx, this.gy, 'd');
            }
        }
    }
    this.isDrawPosition = function(x, y) {
        if (this.nextgy > this.gy) {
            return (this.gx == x && this.nextgy == y); 
        } else if (this.nextgx < this.gx) {
            return (this.nextgx == x && this.gy == y);
        }
        return (this.gx == x && this.gy == y);
    }
    this.draw = function() {
        var nx = world.calcGridX(this.gx, this.gy);
        var ny = world.calcGridY(this.gx, this.gy);
        
        if (this.falling) {
            ny += gamescale*200;
        } else {
            // Slide to next grid
            nx -= (nx - world.calcGridX(this.nextgx, this.nextgy)) * gamescale;
            ny -= (ny - world.calcGridY(this.nextgx, this.nextgy)) * gamescale; 

            // Add jump effect
            if (gamescale < .5) ny -= (gamescale*70);
            else ny -= 70 - (gamescale*70);
        }

        drawImg(this.direction, nx + 25, ny - 35);
    }
}

// -------------------------------------------------------------------------
// Load images and start
var gamespeed = 60;
var gametick = gamespeed / 2;
var gamescale = 0;

var world = new World();
    world.reset();
var player = new Player();
    player.reset();

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
    // Core loop
    setInterval(function() {

        if (++gametick > gamespeed) {
            gametick = 0;
            world.update();
            player.moveDirection();
        }
        gamescale = gametick/gamespeed;

        if (keyPressed == "Right") { player.turnRight(); }
        if (keyPressed == "Left") { player.turnLeft(); }

        drawEmptyScreen();
        world.draw();

    }, 20 /* milliseconds -> 50Hz */); 
});

