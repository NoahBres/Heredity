class Game {
	constructor() {
		let canvas = document.getElementById('game');

		this.width = canvas.width;
		this.height = canvas.height;
		this.ctx = canvas.getContext("2d");
		this.ctx.fillStyle = "white";

		this.keys = new KeyListener();

		// this.p1 = new GeneticPaddle(5, 0);//new Paddle(5, 0);
		// this.p1.setY((this.height / 2) - (this.p1.height / 2));
	
		// this.display1 = new Display(this.width / 4, 25);
		
		// this.p2 = new AIPaddle(this.width - 5 - 2, 0);//new Paddle(this.width - 5 - 2, 0);
		// this.p2.setY((this.height / 2) - (this.p2.height / 2));

		// this.display2 = new Display(this.width * 3 / 4, 25);

		this.ball = new Ball();
		this.ball.setX(this.width / 2);
		this.ball.setY(this.height / 2);
		this.ball.setVY(Math.floor(Math.random() * 12 - 6));
		this.ball.setVX(7 - Math.abs(this.ball.vy));
	
		this.FPS = 60;

		this.paused = false;
	}

	draw() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		
		this.ctx.strokeStyle = "#fff";
		this.ctx.setLineDash([5, 3]);
		this.ctx.beginPath();
		this.ctx.moveTo(this.width / 2, 0);
		this.ctx.lineTo(this.width / 2, this.height);
		this.ctx.stroke();
		//this.ctx.fillRect(this.width / 2, 0, 2, this.height);

		this.ball.draw(this.ctx);

		// this.p1.draw(this.ctx);
		// this.p2.draw(this.ctx);

		// this.display1.draw(this.ctx);
		// this.display2.draw(this.ctx);
	}

	update() {
		if(this.paused)
			return;

		this.ball.update();
		// this.p1.update();
		// this.p2.update();

		this.display1.value = this.p1.score;
		this.display2.value = this.p2.score;

		// To which Y direction the paddle is moving
		if (this.keys.isPressed(83)) { // DOWN
			this.p1.y = Math.min(this.height - this.p1.height, this.p1.y + this.p1.paddleSpeed);
		} else if (this.keys.isPressed(87)) { // UP
			this.p1.y = Math.max(0, this.p1.y - this.p1.paddleSpeed);
		}
	 
		if (this.keys.isPressed(40)) { // DOWN
			this.p2.y = Math.min(this.height - this.p2.height, this.p2.y + this.p2.paddleSpeed);
		} else if (this.keys.isPressed(38)) { // UP
			this.p2.y = Math.max(0, this.p2.y - this.p2.paddleSpeed);
		}
	 
		if (this.ball.vx > 0) {
			if (this.p2.x <= this.ball.x + this.ball.width &&
					this.p2.x > this.ball.x - this.ball.vx + this.ball.width) {
				let collisionDiff = this.ball.x + this.ball.width - this.p2.x;
				let k = collisionDiff/this.ball.vx;
				let y = this.ball.vy*k + (this.ball.y - this.ball.vy);
				
				if (y >= this.p2.y && y + this.ball.height <= this.p2.y + this.p2.height) {
					// collides with right paddle
					this.ball.x = this.p2.x - this.ball.width;
					this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy*k);
					this.ball.vx = -this.ball.vx;

					this.ball.vy = this.ball.vy * 0.9;
				}
			}
		} else {
			if (this.p1.x + this.p1.width >= this.ball.x) {
				let collisionDiff = this.p1.x + this.p1.width - this.ball.x;
				let k = collisionDiff/-this.ball.vx;
				let y = this.ball.vy*k + (this.ball.y - this.ball.vy);
				
				if (y >= this.p1.y && y + this.ball.height <= this.p1.y + this.p1.height) {
					// collides with the left paddle
					this.ball.x = this.p1.x + this.p1.width;
					this.ball.y = Math.floor(this.ball.y - this.ball.vy + this.ball.vy*k);
					this.ball.vx = -this.ball.vx;

					this.ball.vy = this.ball.vy * 0.9;
				}
			}
		}
	 
		// Top and bottom collision
		if ((this.ball.vy < 0 && this.ball.y < 0) ||
				(this.ball.vy > 0 && this.ball.y + this.ball.height > this.height)) {
			this.ball.vy = -this.ball.vy;
		}
		
		if (this.ball.x >= this.width)
			this.score(this.p1);
		else if (this.ball.x + this.ball.width <= 0)
			this.score(this.p2);
	}

	score(p) {
		p.score++;

		let player = p == this.p1 ? 0 : 1;

		this.ball.x  = this.width / 2;
		this.ball.y = p.y + p.height / 2;

		this.ball.vy = Math.floor(Math.random() * 12 - 6);
		this.ball.vx = 7 - Math.abs(this.ball.vy);
	
		if(player == 1)
			this.ball.vx *= -1;
	}
}

// PADDLE
class Paddle {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		this.width = 2;
		this.height = 28;

		this.score = 0;

		this.paddleSpeed = 4;
	}

	draw(ctx) {
		ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	setX(x) {
		this.x = x;
	}

	setY(y) {
		this.y = y;
	}

	update() {

	}
}

class AIPaddle extends Paddle {
	constructor(x, y) {
		super(x, y);

		this.paddleSpeed = 2;
	}

	update() {
		if(game.ball.vx > 0) {
			if(game.ball.y > this.y)
				this.y = Math.min(game.height - this.height, this.y + this.paddleSpeed);

			if(game.ball.y < this.y)
				this.y = Math.max(0, this.y - this.paddleSpeed);	
		}
	}
}

class GeneticPaddle extends Paddle {
	update() {

	}
}

// BALL
class Ball {
	constructor() {
		this.x = 0;
		this.y = 0;

		this.vx = 0;
		this.vy = 0;

		this.width = 4;
		this.height = 4;
	}

	update() {
		this.x += (this.vx * 0.7);
		this.y += (this.vy * 0.7);
	}

	draw(ctx) {
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	setX(x) {
		this.x = x;
	}

	setY(y) {
		this.y = y;
	}

	setVX(vx) {
		this.vx = vx;
	}

	setVY(vy) {
		this.vy = vy;
	}
}

class Display {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		this.value = 0;
	}

	draw(ctx) {
		ctx.fillText(this.value, this.x, this.y);
	}
}

class KeyListener {
	constructor() {
		this.pressedKeys = [];

		this.keydown = function(e) {
			this.pressedKeys[e.keyCode] = true;
		}

		this.keyup = function(e) {
			this.pressedKeys[e.keyCode] = false;
		}

		document.addEventListener("keydown", this.keydown.bind(this));
		document.addEventListener("keyup", this.keyup.bind(this));
	}

	isPressed(key) {
		return this.pressedKeys[key] ? true : false;
	}

	addKeyPressListener(keyCode, callback) {
		document.addEventListener("keypress", function(e) {
			if(e.keyCode == keyCode)
				callback(e);
		});
	}
}

// Initialize our game instance
let game = new Game();
 
function loop() {
	game.update();
	game.draw();
	// Call the main loop again at a frame rate of 30fps
	setTimeout(loop, 1000 / game.FPS);
}
 
// Start the game execution
loop();