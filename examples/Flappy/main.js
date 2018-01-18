let game;

let States = {
	Splash:  0, // Game States
	Game:    1,
	Score:   2,
	Machine: 3,
	Paused:  4
};

let SpriteBox = {   // A box of sprites
	bird:        null, // Initialize all the variables
	background:  null, // Mainly for reference purposes
	foreground:  null,
	northPipe:   null,
	southPipe:   null,
	text:        null,
	score:       null,
	splash:      null,
	buttons:     null,
	smallNumber: null,
	bigNumber:   null
};


class Sprite {
	constructor(img, x, y, width, height) {
		this.img = img;

		this.x = x * 2;
		this.y = y * 2;

		this.width  = width  * 2;
		this.height = height * 2;
	}

	draw(ctx, x, y) {
		ctx.drawImage(this.img,
						this.x, this.y,
						this.width, this.height,
						x, y,
						this.width, this.height);
	}
}


function loadSprites(img) {
	SpriteBox.bird = [
		new Sprite(img, 156, 115, 17, 12),
		new Sprite(img, 156, 128, 17, 12),
		new Sprite(img, 156, 141, 17, 12)
	];

	SpriteBox.background = new Sprite(img, 0, 0, 138, 114);
	SpriteBox.background.color = "#70C5CF";

	SpriteBox.foreground = new Sprite(img, 138, 0, 112, 56);

	SpriteBox.northPipe = new Sprite(img, 251, 0, 26, 200);
	SpriteBox.southPipe = new Sprite(img, 277, 0, 26, 200);

	SpriteBox.text = {
		FlappyBird: new Sprite(img, 59, 114, 96, 22),
		GameOver:   new Sprite(img, 59, 136, 94, 19),
		GetReady:   new Sprite(img, 59, 155, 87, 22)
	};

	SpriteBox.buttons = {
		Rate:  new Sprite(img,  79, 177, 40, 14),
		Menu:  new Sprite(img, 119, 177, 40, 14),
		Share: new Sprite(img, 159, 177, 40, 14),
		Score: new Sprite(img,  79, 191, 40, 14),
		Ok:    new Sprite(img, 119, 191, 40, 14),
		Start: new Sprite(img, 159, 191, 40, 14)
	};

	SpriteBox.score  = new Sprite(img, 138,  56, 113, 58);
	SpriteBox.splash = new Sprite(img,   0, 114,  59, 49);

	// Number sprites are just the sprite containing a strip of all the numbers
	SpriteBox.smallNumber = new Sprite(img, 0, 177, 6, 7);
	SpriteBox.bigNumber   = new Sprite(img, 0, 188, 7, 10);

	// Custom draw function to single out the strip
	SpriteBox.smallNumber.draw = SpriteBox.bigNumber.draw = function(ctx, x, y, num, center, offset) {
		num = num.toString();

		let step = this.width + 2;

		if(center)
			x = center - (num.length * step - 2) / 2;

		if(offset)
			x += step * (offset - num.length);

		for(let i = 0; i < num.length; i++) {
			let n = parseInt(num[i]);

			ctx.drawImage(img, step * n, 
							this.y, 
							this.width, this.height, 
							x, y, 
							this.width, this.height);

			x += step;
		}
	}
}

class Bird {
	constructor(x, y) {
		this.x = x || 60;
		this.y = y || 0;

		this.frame = 0;
		this.animation = [0, 1, 2, 1];

		this.rotation = 0;
		this.velocity = 0;

		this.radius = 12;

		this.gravity = 0.25;
		this.jumpVal = 4.6;

		this.isDead = false;
		this.fitness = 0;

		this.opacity = 1;
	}

	jump() {
		this.velocity = -this.jumpVal;
	}

	revive() {
		this.isDead = false;

		this.y = game.height - 280 + 5 * Math.cos(game.frames / 10);
		this.x = 60;
		
		this.rotation = 0;
	}

	checkCollisions() {
		// Ground collision
		if(this.y >= (game.height - SpriteBox.foreground.height - 10)) {
			this.y = game.height - SpriteBox.foreground.height - 10;
			this.isDead = true;	
			this.velocity = this.jumpVal;
		}

		function RectCircleColliding(circle, rect) {
			let distX = Math.abs(circle.x - rect.x - rect.width / 2);
			let distY = Math.abs(circle.y - rect.y - rect.height / 2);

			if(distX > (rect.width  / 2 + circle.radius)) return false;
			if(distY > (rect.height / 2 + circle.radius)) return false;

			if(distX <= (rect.width  / 2)) return true;
			if(distY <= (rect.height / 2)) return true;
		
			let dx = distX - rect.width  / 2;
			let dy = distY - rect.height / 2;

			return (dx * dx + dy * dy <= circle.radius * circle.radius);
		}

		for(let i = 0; i < game.pipes.length; i++) {
			let p = game.pipes[i];

			// I don't actually know how this collision algorithm works because I blatantly stole it

			// Like seriously why is there a bunch of min and maxes?
			let cx  = Math.min(Math.max(this.x, p.x), p.x + p.width);
			let cy1 = Math.min(Math.max(this.y, p.y), p.y + p.height);
			let cy2 = Math.min(Math.max(this.y, p.y + p.height + 80), p.y + 2 * p.height + 80);

			let dx  = this.x - cx;
			let dy1 = this.y - cy1;
			let dy2 = this.y - cy2;
		
			let d1 = dx * dx + dy1 * dy1;
			let d2 = dx * dx + dy2 * dy2;

			const r = this.radius * this.radius;

			if(r > d1 || r > d2)
				this.isDead = true;

			// Needed because collision algorithm I stole is poop
			if(p.x === this.x) {
				if(this.y < 0)
					this.isDead = true;
			}
		}
	}

	update() {
		const n = game.currentState == States.Splash ? 10 : 5;

		this.frame += (game.frames % n === 0) ? 1 : 0;
		this.frame %= this.animation.length;

		if(game.currentState === States.Splash) {
			this.revive();
		} else {
			this.velocity += this.gravity;
			this.y += this.velocity;

			this.checkCollisions();
			
			// If falling, stop flapping and set rotation
			if(this.velocity >= this.jumpVal) {
				this.frame = 1;
				this.rotation = Math.min(Math.PI / 2, this.rotation + 0.3);
			} else {
				this.rotation = -0.3;
			}

			if(game.currentState != States.Score) {
				if(this.y >= (game.height - SpriteBox.foreground.height - 10) || this.isDead)
					this.x -= 2;
			}
		}
	}

	// Not necessary but fixes a tiny visual bug.
	background() {
		this.y = game.height - 280 + 5 * Math.cos(game.frames / 10);
		this.rotation = 0;
	}

	draw(ctx) {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation);
		ctx.globalAlpha = this.opacity;

		const n = this.animation[this.frame];
		SpriteBox.bird[n].draw(ctx, -SpriteBox.bird[n].width / 2, -SpriteBox.bird[n].height / 2);
	
		ctx.restore();
	}	
}

class Cyborg extends Bird {
	constructor(x, y, net) {
		super(x, y);

		this.net = net || null;
	}
}

class Pipe {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		this.width = SpriteBox.northPipe.width;
		this.height = SpriteBox.northPipe.height;

		this.speed = 2;
	}

	update() {
		this.x -= this.speed;
	}

	draw(ctx) {
		SpriteBox.southPipe.draw(ctx, this.x, this.y);
		SpriteBox.northPipe.draw(ctx, this.x, this.y + 80 + this.height);
	}

	isGone() { 
		return this.x + this.width < 0 ? 1 : 0; 
	}
}

class Game {
	constructor() {
		this.canvas;
		this.ctx;

		this.width;
		this.height;

		this.pipes   = [];
		this.cybirds = [];
		this.bird;

		this.score            = 0;
		this.bestScore        = 0;
		this.machineBestScore = 0;

		this.currentState = 0;
		this.lastState    = 0;

		this.foregroundPos = 0;
		this.frames        = 0;

		this.okBtn;

		this.FPS = 120;

		// Neural network stuff

		this.fitness    = 0;
		this.maxFitness = 0;

		this.Evolution = new Darwin();

		this.generation = [];
		this.currentGeneration = 0;
	}

	start() {
		document.getElementById("game").className = "nopointer";		
		this.currentState = States.Machine;

		this.currentGeneration++;

		let evolutionValues = this.Evolution.getPopulation().getGeneValues();

		for(let i = 0; i < this.cybirds.length; i++) {
			this.cybirds[i].net.setWeights(evolutionValues[i]);
			//this.cybirds[i].net.setWeights([0.9803014734370008,0.7307887400245456,0.0008014189793175142,1.3552486184460208,0.8012787325075772,-0.8776508079196423]);
		}
		

		this.update();
		this.render();
	}

	update() {
		let self = this; // Fixes scoping problemss
		this.frames++;

		// Foreground logic
		if(this.currentState != States.Score && this.currentState != States.Paused)
			this.foregroundPos = (this.foregroundPos - 2) % 14;

		// Human controlled bird logic
		if(this.currentState != States.Machine && this.currentState != States.Paused) {
			this.bird.update();

			if(this.currentState != States.Score) {
				for(let pipe of this.pipes) {
					this.score += pipe.x === this.bird.x ? 1 : 0;

					this.bestScore = Math.max(this.bestScore, this.score);
					//Prevent DOM updates
					if(document.getElementById("yourbest-output").innerHTML != this.bestScore)
						document.getElementById("yourbest-output").innerHTML = this.bestScore;
				}
			}
		} else {
			this.bird.background();
		}

		if(this.bird.isDead && game.currentState !== States.Machine) {
			//this.reset();

			this.currentState = States.Score;
		}

		// Cybird logic
		function allDead() {
			for(let bird of self.cybirds) {
				if(!bird.isDead)
					return false;
			}

			return true;
		}

		function firstSurviving() {
			for(let bird of self.cybirds) {
				if(!bird.isDead)
					return bird;
			}

			return null;
		}

		if(this.currentState === States.Machine) {
			this.fitness++;
			this.maxFitness = Math.max(this.maxFitness, this.fitness);

			let nextPipeY = 0;
			let nextPipeX = 0;
			let nextPipeYReal = 0;
			// for(let i = 0; i < this.pipes.length; i += 2) {
			// 	if(this.pipes[i].x + this.pipes[i].width > this.bird.x) {
			// 		nextPipeY = this.pipes[i].height / this.height;

			// 		break;
			// 	}
			// }

			for(let p of this.pipes) {
				if(p.x + p.width > this.bird.x) {
					nextPipeYReal = p.y + p.height + 40;// / this.height;
					nextPipeY = p.y / this.height,
					nextPipeX = p.x;

					break;
				}
			}

			//console.log(nextPipeY);
			for(let bird of this.cybirds) {
				if(!bird.isDead) {
					let inputs = [
						bird.y / this.height,
						nextPipeY
						//0 // bias
					];

					let res = bird.net.activate(inputs);
					if(res > 0.5)
						bird.jump();

					//bird.fitness = this.fitness;						

					//console.log(nextPipeX - bird.x)
					bird.fitness = this.fitness - (nextPipeX - bird.x) - (Math.abs(bird.y - nextPipeYReal));
				}

				bird.update();
			}

			if(allDead()) {
				for(let i = 0; i < this.cybirds.length; i++) {
					this.Evolution.getPopulation().getChromosomes()[i].setFitness(this.cybirds[i].fitness);
					//this.Evolution.getPopulation().getChromosomes()[i].setWeights(this.cybirds[i].net.getWeights());

					//console.log(this.cybirds[i].net.getWeights())
				}

				this.Evolution.nextGeneration();

				let evolutionValues = this.Evolution.getPopulation().getGeneValues();
				for(let i = 0; i < this.cybirds.length; i++) {
					for(let i = 0; i < this.cybirds.length; i++) {
						this.cybirds[i].net.setWeights(evolutionValues[i]);
					}
					
					this.cybirds[i].revive();
				}

				this.reset();
			} else {
				for(let pipe of this.pipes) {
					this.score += pipe.x === firstSurviving(this.cybirds).x ? 1 : 0;

					this.machineBestScore = Math.max(this.machineBestScore, this.score);
					//Prevent DOM updates
					if(document.getElementById("machinebest-output").innerHTML != this.machineBestScore)
						document.getElementById("machinebest-output").innerHTML = this.machineBestScore;
				}
			}
		}

		// Pipe logic
		if(this.currentState == States.Machine || this.currentState == States.Game) {

			for(let i = 0; i < this.pipes.length; i++) {
				this.pipes[i].update();

				if(this.pipes[i].isGone()) {
					this.pipes.splice(i, 1);
					i--;
				}
			}

			if(this.frames % 100 === 0) {
				const yOffset = game.height - (SpriteBox.southPipe.height + SpriteBox.foreground.height + 120 + 200 * Math.random());
			
				this.pipes.push(new Pipe(500, yOffset, SpriteBox.southPipe.width, SpriteBox.southPipe.height));
			}
		}

		setTimeout(function() {
			self.update();
		}, 1000 / game.FPS);
	}

	render() {
		// Just refreshing the canvas
		this.ctx.fillStyle = "#70C5CF";
		this.ctx.fillRect(0, 0, this.width, this.height);

		// Drawn twice because the spritesheet I stole isn't wide enough
		SpriteBox.background.draw(this.ctx, 0, this.height - SpriteBox.background.height);
		SpriteBox.background.draw(this.ctx, SpriteBox.background.width, this.height - SpriteBox.background.height);
	
		let halfWidth = this.width / 2;

		// Text render
		if(this.currentState === States.Splash) {
			SpriteBox.splash.draw(this.ctx, halfWidth - SpriteBox.splash.width / 2, this.height - 300);
			SpriteBox.text.GetReady.draw(this.ctx, halfWidth - SpriteBox.text.GetReady.width / 2, this.height - 380);
		}

		// Pipe render
		if(this.currentState == States.Machine || this.currentState == States.Game || this.currentState == States.Score) {
			for(let pipe of this.pipes) {
				pipe.draw(this.ctx);
			}
		}

		// Human controlled bird render
		if(this.currentState != States.Machine) {
			this.bird.draw(this.ctx);
		}

		// Cybird render
		if(this.currentState === States.Machine) {
			for(let bird of this.cybirds) {
				bird.draw(this.ctx);
			}
		}

		// Score render
		if(this.currentState == States.Score) {
			SpriteBox.text.GameOver.draw(this.ctx, halfWidth - SpriteBox.text.GameOver.width / 2, this.height - 400);
			SpriteBox.score.draw(this.ctx, halfWidth - SpriteBox.score.width / 2, this.height - 340);

			SpriteBox.buttons.Ok.draw(this.ctx, game.okBtn.x, game.okBtn.y);

			SpriteBox.smallNumber.draw(this.ctx, halfWidth - 47, game.height - 304, game.score, null, 10);
			SpriteBox.smallNumber.draw(this.ctx, halfWidth - 47, game.height - 262, game.bestScore, null, 10);
		}

		// Text render
		if(this.currentState != States.Splash) {
			SpriteBox.bigNumber.draw(this.ctx, null, 20, this.score, halfWidth);
		}

		// Drawn twice because half is drawn each time
		// Due to it being slid across the screen
		SpriteBox.foreground.draw(this.ctx, this.foregroundPos, this.height - SpriteBox.foreground.height);
		SpriteBox.foreground.draw(this.ctx, this.foregroundPos + SpriteBox.foreground.width, this.height - SpriteBox.foreground.height);

		// if(this.currentState != States.Machine) {
		// 	this.ctx.fillStyle = "#212121";
		// 	this.ctx.font = "20px 'system'";

		// 	// this.ctx.fillText("Score: " + this.score, 10, this.height - SpriteBox.foreground.height + 35);
		// 	// this.ctx.fillText("Best Score: " + this.bestScore, 10, this.height - SpriteBox.foreground.height + 55);
		// }

		if(this.currentState === States.Machine) {
			this.ctx.fillStyle = "#212121";
			this.ctx.font = "20px 'system'";

			this.ctx.fillText("Fitness: " + this.fitness, 10, this.height - SpriteBox.foreground.height + 35);
			this.ctx.fillText("Max Fitness: " + this.maxFitness, 10, this.height - SpriteBox.foreground.height + 55);
		}

		let nextPipeX = 0;
		let nextPipeY = 0;

		for(let p of this.pipes) {
			if(p.x + p.width > this.bird.x) {
				nextPipeY = p.y + p.height + 40// / this.height;
				nextPipeX = p.x;

				break;
			}
		}

		this.ctx.fillStyle = '#f00';
		this.ctx.fillRect(60, nextPipeY, 5, 5);

		let self = this;
		requestAnimationFrame(function() {
			self.render();
		});
	}

	reset() {
		this.frames  = 0;
		this.pipes   = [];
		this.score   = 0;
		this.fitness = 0;
	
		this.bird.revive();
		for(let b of this.cybirds) {
			b.revive();
		}
	}
}

function deusExMachina(el) {
	if(el.checked) {
		document.getElementById("machine-label").className = "selected";
		document.getElementById("man-label").className = "";
		document.getElementById("btn-controls").className = "";

		document.getElementById("game-canvas").className = "nopointer";		
		game.currentState = States.Machine;
	} else {
		document.getElementById("machine-label").className = "";
		document.getElementById("man-label").className = "selected";
		document.getElementById("btn-controls").className = "disabled";

		document.getElementById("game-canvas").className = "pointer";
		game.currentState = States.Splash;
	}

	game.reset();
}

function changeSpeed(s) {
	let val = document.getElementById("speed-input").value;
	val = (val == 0) ? 0.5 : val;

	document.getElementById("speed-output").value = val;
	
	game.FPS = val * 60;
}

function pause() {
	if(game.currentState != States.Paused) {
		game.lastState = game.currentState;
		game.currentState = States.Paused;

		document.getElementById("pause-btn").innerHTML = "Unpause";
	} else {
		game.currentState = game.lastState;
		document.getElementById("pause-btn").innerHTML = "Pause";
	}
}

function onPress(evt) {
	let mx = evt.offsetX;
	let my = evt.offsetY;

	if(mx == null || my == null) {
		mx = evt.touches[0].clientX;
		my = evt.touches[0].clientY;
	}

	if(evt.target.id == "game-canvas") {
		switch(game.currentState) {
			case States.Splash:
				game.currentState = States.Game;
				game.bird.jump();
				break;
			case States.Game:
				game.bird.jump();
				break;
			case States.Machine:
				for(let bird of game.cybirds) {
					setTimeout(function() {
						if(!bird.isDead)
							bird.jump();
					}, Math.random() * 100);
				}
				break;
			case States.Score:
				if(game.okBtn.x < mx && 
					game.okBtn.x + game.okBtn.width > mx &&
					game.okBtn.y < my &&
					game.okBtn.y + game.okBtn.height > my) {

					game.reset();
					game.bird.revive();
					game.currentState = States.Splash;
				}
		}
	}
}

window.onload = function() {
	game = new Game();

	game.canvas = document.getElementById("game");

	game.width = window.innerWidth;
	game.height = window.innerHeight;

	let evt = "touchstart";
	if(game.width >= 500) {
		game.width = 320;
		game.height = 480;

		evt = "mousedown";
	}

	document.addEventListener(evt, onPress);
	game.canvas.width = game.width;
	game.canvas.height = game.height;

	game.ctx = game.canvas.getContext("2d");

	const img = new Image();
	img.onload = function() { start(); }

	img.src = "res/spritesheet.png";

	let start = function() {
		loadSprites(img);

		game.bird = new Bird();

		// TODO replace 50 with population variable
		for(let i = 50; i--;) {
			game.cybirds[i] = new Cyborg();
			game.cybirds[i].opacity = 0.7;

			game.cybirds[i].net = new Perceptron();
			game.cybirds[i].net.activation = Cortex.activation.sigmoid;
			game.cybirds[i].net.inputLayer = new Layer(2);
			game.cybirds[i].net.hiddenLayer = [new Layer(2)];
			game.cybirds[i].net.outputLayer = new Layer(1);

			game.cybirds[i].net.generate();

			game.cybirds[i].revive();
		}

		game.pipes = [];

		game.okBtn = {
			x: (game.width - SpriteBox.buttons.Ok.width) / 2,
			y: game.height - 200,
			width: SpriteBox.buttons.Ok.width,
			height: SpriteBox.buttons.Ok.height,
		}

		game.Evolution = new Darwin();
		game.Evolution.template = new FloatChromosome(false, -1, 1, 6);
		game.Evolution.popSize  = 50;
		game.Evolution.mutationRate = 0.1;
		game.Evolution.mutationRange = 0.5;
		game.Evolution.crossoverRate = 0.9;
		game.Evolution.elitism = 0.1;
		game.Evolution.newChromosomes = 0.1;
		game.Evolution.noBinary = true;

		game.Evolution.fittest = Covington.fittest.biggerIsBetter;
		game.Evolution.selection = Covington.selection.Top;
		game.Evolution.crossover = Covington.crossover.Uniform;
		game.Evolution.mutation = Covington.mutation.Addition;

		game.Evolution.newPopulation();

		game.start();
	};
}

/*
-0.9948435275018941
1
:
0.23510710501600007
2
:
-0.16054123012167776
3
:
-0.3977961081337882
4
:
-0.42351947353897534
5
:
0.3774847787329345

-0.9948435275018941,-0.9948435275018941,-0.16054123012167776,-0.3977961081337882,-0.42351947353897534,0.3774847787329345
*/