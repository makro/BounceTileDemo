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
        else if (evt.keyCode == 32) { keyPressed = "Space"; }
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
    canvas.fillStyle = "#1D3505";
    canvas.fillRect(0, 0, canvasW, canvasH);
    canvas.fillStyle = 'transparent';
    canvas.clearRect(1, 1, canvasW-2, canvasH-2);
}

function rgb(r, g, b){
    r = Math.floor(r);
    g = Math.floor(g);
    b = Math.floor(b);
    return ["rgb(",r,",",g,",",b,")"].join("");
}

function drawCircle(x, y, size, color) {
    canvas.beginPath();
    canvas.arc(x, y, size, 0, 2*Math.PI);
    canvas.fillStyle = color;
    canvas.fill();
    canvas.strokeStyle = color;
    canvas.stroke();
}

// -------------------------------------------------------------------------
// World class (singleton)
function World() {
    this.mapH = 16;
    this.mapW = 21;
    this.map = [
        "....................",
        ".......GDG..........",
        "......WWDWW.........",
        ".....WWWDWBW........",
        ".....WWWDWWW........",
        "54321543215432154321",
        "...WWWW.WWWSDDD.....",
        "...WWWJ.WWWJ..D.....",
        "......D.DD..BWWW....",
        "......WWWWDJSWWWWW..",
        "......WWWW.....WWW..",
        ".......WWWDJ.J.RR...",
        "........WW..L.GRG...",
        ".........DWWlWW.....",
        "..........WWlWW.....",
        "............L......."
    ];
    this.backupmap = this.map.slice();
    this.reset = function() {
        this.platformTick = 5; // 1-5
        this.laserTick = 1; // 1-3
        this.spikesUp = true;
        this.map = this.backupmap.slice();

        this.tilesGot = 0;
        this.tilesAll = 0;
        for(var row of this.map) {
            for(var ch of row) {
                if (ch == "W") this.tilesAll++;
            }
        }
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
        // Lazer pulse
        if (++this.laserTick == 4) {
            this.laserTick = 1;
        }
        // Moving platforms
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
                } else if (tile == "J") {
                    drawImg("JUMP", nx, ny);
                } else if (tile == "R") {
                    drawImg("ROTATE", nx, ny);
                } else if (tile == "B") {
                    drawImg("BUTTON", nx, ny);
                } else if (tile == "S") {
                    if (this.spikesUp) {
                        drawImg("SPIKES2", nx + 2, ny - 16);
                    } else {
                        drawImg("SPIKES1", nx + 2, ny);
                    }
                } else if (tile == "D") {
                    drawImg("DARK", nx, ny);
                } else if (tile == "d") {
                    // Falling block
                    ny += (gamescale*70);
                    drawImg("DARK", nx, ny);
                } else if (tile == "L") {
                    drawImg("GRAY", nx, ny);
                    drawCircle(nx + 57 + 11, ny + 40, 5, rgb(100, 0, 0));
                    drawCircle(nx + 56, ny + 40 + 10, 5, rgb(100, 0, 0));
                    drawCircle(nx + 54 - 11, ny + 40, 5, rgb(100, 0, 0));
                    drawCircle(nx + 56, ny + 40 - 10, 5, rgb(100, 0, 0));
                    if (this.laserTick == 1) {
                        var r = gamescale*100 + 55;
                        var s = gamescale*10 + 5;
                        drawCircle(nx + 55, ny + 20, s, rgb(r, 0, 0));
                    }
                    if (this.laserTick == 2) {
                        var r = gamescale*100 + 155;
                        var s = gamescale*10 + 15;
                        drawCircle(nx + 55, ny + 20, s, rgb(r, 0, 0));
                    }
                    if (this.laserTick == 3) {
                        var r = 255 - gamescale*200;
                        var s = 25 - gamescale*20;
                        drawCircle(nx + 55, ny + 20, s, rgb(r, 0, 0));
                    }
                } else if (tile == "l") {
                    drawImg("GRAY", nx, ny);
                    if (this.laserTick == 2 && gamescale > 0.5) {
                        var s = gamescale*20 + 5;
                        drawCircle(nx + 55, ny + 20, s, rgb(255, 0, 0));
                    }
                    if (this.laserTick == 3) {
                        if (gamescale < 0.5) {
                            var r = 255 - gamescale*200;
                            var s = 20 - gamescale*40;
                            drawCircle(nx + 55, ny + 20, s, rgb(r, 0, 0));
                        }
                    }
                }

                if (tile == this.platformTick) {
                    nx -= (nx - world.calcGridX(x + -1, y)) * gamescale;
                    ny -= (ny - world.calcGridY(x + -1, y)) * gamescale; 
                    drawImg("GRAY", nx, ny);
                }

                if (player.isDrawPosition(x, y) && !player.isDead()) {
                    player.draw();
                }

                if (enemy.isDrawPosition(x, y)) {
                    enemy.draw();
                }
            }
        }
    }

    // Contructor
    this.reset();
}

// -------------------------------------------------------------------------
// Player class (singleton)
function Player() {

    this.reset = function() {
        gametick = gamespeed / 2;
        this.dead = false;
        this.burning = false;
        this.falling = false;
        this.gx = 9;
        this.gy = 10;
        this.nextgx = 9;
        this.nextgy = 10;
        this.direction = "LEFT";
        this.nextdir = "LEFT";
        this.nextlocked = false;
        this.jumpdist = 1;
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
        if (this.falling || this.burning) {
            this.dead = true;
            // Press space to reset
            //enemy.reset();
            //world.reset();
            //this.reset();
        } else {
            this.gy = this.nextgy;
            this.gx = this.nextgx;
            var tile = world.at(this.gx, this.gy);

            if (tile == '.' ||
                ((tile == '1' || tile == '2' || tile == '3' || tile == '4' || tile == '5') && (tile != world.platformTick))) {
                // Fall if no blocks, or missed moving platforms
                this.falling = true;
            } else if (enemy.isInPosition(this.gx, this.gy) ||
                tile == 'L' || (tile == 'l' && world.laserTick == 3) || (tile == 'S' && world.spikesUp)) {
                // You die, "burn", if you touch lazers or spikes or enemy
                this.burning = true;
            } else {
                this.jumpdist = 1;
                if (tile == 'J') {
                    // Force direction to stay for long jumps
                    this.nextdir = this.direction;
                    this.jumpdist = 2;
                } else if (tile == 'R') {
                    // Force extra turn right for spinner block
                    this.direction = this.nextdir; 
                    this.turnRight();
                    this.nextlocked = false;
                }

                if (this.nextdir == "UP") { this.nextgy = this.gy - this.jumpdist; }
                if (this.nextdir == "DOWN") { this.nextgy = this.gy + this.jumpdist; }
                if (this.nextdir == "RIGHT") { this.nextgx = this.gx + this.jumpdist; }
                if (this.nextdir == "LEFT") { this.nextgx = this.gx - this.jumpdist; }
                this.direction = this.nextdir;
            }

            if (tile == 'B') {
                // Toggle spikes up and down
                world.spikesUp = !world.spikesUp;
            } else if (tile == 'W') {
                // Mark white block as stepped on -> gray
                world.change(this.gx, this.gy, 'G');
                world.tilesGot++;
            } else if (tile == 'D') {
                // Mark dark block as stepped on -> falling
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
    this.isDead = function() {
        return this.dead;
    }
    this.draw = function() {
        var nx = world.calcGridX(this.gx, this.gy);
        var ny = world.calcGridY(this.gx, this.gy);
        
        if (this.falling) {
            ny += gamescale*200;
        } else if (this.burning) {
            ny -= gamescale*400;
        } else {
            // Slide to next grid
            nx -= (nx - world.calcGridX(this.nextgx, this.nextgy)) * gamescale;
            ny -= (ny - world.calcGridY(this.nextgx, this.nextgy)) * gamescale; 

            // Add jump effect
            if (gamescale < .5) ny -= (gamescale*70) * this.jumpdist;
            else ny -= (70 - (gamescale*70)) * this.jumpdist;
        }

        drawImg(this.direction, nx + 25, ny - 35);
        if (this.burning) {
            drawCircle(nx + 60, ny + 20, 22, rgb(255, 0, 0));
        }
    }

    // Contructor
    this.reset();
}

// -------------------------------------------------------------------------
// Enemy class (singleton)
function Enemy() {
    this.reset = function() {
        this.gx = this.nextgx = this.path[0][0];
        this.gy = this.nextgy = this.path[0][1];
        this.direction = this.nextdir = this.path[0][2];
        console.log("gx:" + this.gx + " gy:" + this.gy + " dir:" + this.direction);
    }
    this.moveDirection = function() {
        // Check the spot where to turn
        console.log("nextgx:" + this.nextgx + " nextgy:" + this.nextgy + " dir:" + this.direction);
        for(var i = 0; i < this.path.length; i++) {
            if (this.nextgx == this.path[i][0] && this.nextgy == this.path[i][1]) {
                this.nextdir = this.path[i][2];
                console.log("SPOT!" + this.nextdir);
            }
        }

        this.gx = this.nextgx;
        this.gy = this.nextgy;
        if (this.nextdir == "UP") { this.nextgy = this.gy - 1 }
        if (this.nextdir == "DOWN") { this.nextgy = this.gy + 1 }
        if (this.nextdir == "RIGHT") { this.nextgx = this.gx + 1 }
        if (this.nextdir == "LEFT") { this.nextgx = this.gx - 1 }
        this.direction = this.nextdir;
    }
    this.draw = function() {
        var nx = world.calcGridX(this.gx, this.gy);
        var ny = world.calcGridY(this.gx, this.gy);

        // Slide to next grid
        nx -= (nx - world.calcGridX(this.nextgx, this.nextgy)) * gamescale;
        ny -= (ny - world.calcGridY(this.nextgx, this.nextgy)) * gamescale; 

        if (this.direction == "UP") {
            drawCircle(nx + 60, ny + 20, 20, rgb(0, 0, 160)); // big
            drawCircle(nx + 70, ny + 30, 15, rgb(0, 0, 220));
            drawCircle(nx + 80, ny + 40, 10, rgb(0, 0, 255));
        } else if (this.direction == "RIGHT") {
            drawCircle(nx + 60, ny + 20, 20, rgb(0, 0, 160)); // big
            drawCircle(nx + 50, ny + 30, 15, rgb(0, 0, 220));
            drawCircle(nx + 40, ny + 40, 10, rgb(0, 0, 255));
        } else if (this.direction == "DOWN") {
            drawCircle(nx + 50, ny + 20, 10, rgb(0, 0, 255));
            drawCircle(nx + 60, ny + 30, 15, rgb(0, 0, 220));
            drawCircle(nx + 70, ny + 40, 20, rgb(0, 0, 160)); // big
        } else {
            drawCircle(nx + 70, ny + 20, 10, rgb(0, 0, 255));
            drawCircle(nx + 60, ny + 30, 15, rgb(0, 0, 220));
            drawCircle(nx + 50, ny + 40, 20, rgb(0, 0, 160)); // big
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
    this.isInPosition = function(x, y) {
        return (this.gx == x && this.gy == y);
    }

    // Contructor
    this.path = [[14,10,"UP"],[14,8,"RIGHT"],[16,8,"DOWN"],[16,10,"LEFT"]];
    this.reset();
}

// -------------------------------------------------------------------------
// Load images and start

function drawShadowText(x, y, text) {
    var oldStyle = canvas.fillStyle;
    canvas.fillStyle = "black";
    canvas.fillText(text, x + 2, y + 2);
    canvas.fillStyle = oldStyle;
    canvas.fillText(text, x, y);
}

function drawTexts() {
    canvas.font = "bold 26px Calibri";
    canvas.fillStyle = "white";
    canvas.textAlign = "center";

    var ny = 790;
    if (player.dead) {
        if (gamescale < .5) ny -= (gamescale*25);
        else ny -= (25 - (gamescale*25));
    }

    drawShadowText(800, ny, "Use ARROWS to turn left and right. Use SPACEBAR to restart.");
    canvas.textAlign = "left";
    drawShadowText(10, 30, "CONCEPT DEMO");
    canvas.textAlign = "right";
    drawShadowText(1590, 30, "TILES GOT " + world.tilesGot + "/" + world.tilesAll);
}

// -------------------------------------------------------------------------
// Load images and start
var gamespeed = 60;
var gametick = gamespeed / 2;
var gamescale = 0;

var enemy = new Enemy();
var world = new World();
var player = new Player();

var pics = {
    "WHITE": "src/img/whitetile.png",
    "GRAY": "src/img/graytile.png",
    "DARK": "src/img/darktile.png",
    "JUMP": "src/img/jumptile.png",
    "ROTATE": "src/img/rotatetile.png",
    "SPIKES1": "src/img/spikes1tile.png",
    "SPIKES2": "src/img/spikes2tile.png",
    "BUTTON": "src/img/buttontile.png",
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
            enemy.moveDirection();
            player.moveDirection();
        }
        gamescale = gametick/gamespeed;

        if (keyPressed == "Right") { player.turnRight(); }
        if (keyPressed == "Left") { player.turnLeft(); }
        if (keyPressed == "Space") {
            enemy.reset();
            world.reset();
            player.reset();
        }

        drawEmptyScreen();
        world.draw();
        drawTexts();

    }, 20 /* milliseconds -> 50Hz */); 
});

