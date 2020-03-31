var game;

function init()
{
	game = new Game();
}

var Game = function Game()
{
	this.tick = function tickGame()
	{
		if (!game.pause && (game.intervaltime == 0 || (Date.now() - game.lastupdate >= game.intervaltime)))
		{
			board.tick();
			if (game.intervaltime != 0)
				game.lastupdate = Date.now();
		}
		if (game.repaint)
			board.render(context);
		window.requestAnimationFrame(game.tick);
	};
	
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	
	canvas.addEventListener('dragover', function(e)
	{
		e.stopPropagation();
		e.preventDefault();
		board.dragframe = true;
		e.dataTransfer.dropEffect = 'copy';
	});
	
	canvas.addEventListener('dragleave', function(e)
	{
		board.dragframe = false;
	});
	
	canvas.addEventListener('drop', function(e)
	{
		e.stopPropagation();
		e.preventDefault();
		var files = e.dataTransfer.files;
		for (var i = 0, file; file = files[i]; i++)
		{
			var reader = new FileReader();
			reader.onload = function(evt)
			{
				try
				{
					board.ai.load(JSON.parse(evt.target.result));
				} catch (e)
				{
				}
			}
			reader.readAsText(file);
		}
		board.dragframe = false;
	});

	
	var board = this.board = new Gameboard();
	
	document.body.onkeydown = board.keydown;
	document.body.onkeyup = board.keyup;
	
	this.pause = false;
	this.lastupdate = 0;
	this.repaint = true;
	this.intervaltime = 50;
	
	window.requestAnimationFrame(this.tick);
}

var SnakeAI = function SnakeAI()
{
	var neurons = []
	var inputs = [];
	var outputs = [];
	
	var mapsize = 9;
	var maptotal = mapsize * mapsize;
	
	for (var i = 0; i < maptotal + 2; i++)
	{
		inputs.push(i);
		neurons.push(new InputNeuron(
			i < maptotal ? ((i % mapsize) - (mapsize - 1) / 2) : (4 - (i - maptotal)),
			i < maptotal ? (Math.floor(i / mapsize) - (mapsize - 1) / 2) : (mapsize - (mapsize - 3) / 2))
		);
	}
	outputs.push(maptotal);
	neurons.push(new Neuron(0, 2 * mapsize));
	outputs.push(maptotal + 1);
	neurons.push(new Neuron(0, 2 * -mapsize));
	
	this.attempts = [];
	this.attemptsMax = 50;
	this.current = 0;
	
	this.perAttempt = 3;
	this.currentAI = null;
	
	if (localStorage.getItem("savedAI") === null)
	{
		var emptyNetwork = new Network(inputs, outputs, neurons);
		emptyNetwork.clean();
		
		this.attempts[0] = {ai: emptyNetwork, score: 3};
		
		for (var i = 1; i < this.attemptsMax; i++)
		{
			this.attempts[i] = {ai: emptyNetwork.copy(), score: 3};
			this.attempts[i].ai.clean();
		}
		
		this.currentAI = this.attempts[0].ai.mutate();
	} else
	{
		this.loadData = JSON.parse(localStorage.getItem("savedAI"));
	}
	
	this.update = function update()
	{
		if (!!this.loadData)
		{
			if(!!this.currentAI)
				this.currentAI.clean();
			this.attempts = [];
			this.current = 0;
			
			for (var i = 0; i < this.loadData.length; i++)
			{
				var ai = this.loadData[i].ai;
				var neur = new Array(ai.neurons.length);
				
				for (var j = 0; j < ai.neurons.length; j++)
				{
					var neuron = ai.neurons[j];
					if (neuron.input)
						neur[j] = new InputNeuron(neuron.x, neuron.y);
					else
						(neur[j] = new Neuron(neuron.x, neuron.y)).bias = neuron.bias;
				}
				
				for (var j = 0; j < ai.neurons.length; j++)
				{
					var neuron = ai.neurons[j];
					
					for (var k = 0; k < neuron.inputs.length; k++)
						neur[j].addInput(neur, neuron.inputs[k], neuron.weights[k]);
				}
				
				this.attempts[i] = {score: this.loadData[i].score, ai: new Network(ai.inputs, ai.outputs, neur)};
				this.attempts[i].ai.clean();
			}
			
			this.currentAI = this.attempts[0].ai.mutate();
			delete this.loadData;
		}
		if (!game.board.alive)
		{
			this.attempts.push({ai: this.currentAI, score: game.board.getScore() + game.board.getLife() / 100});
			this.currentAI.clean();
			this.current++;
			if (this.current >= this.perAttempt * this.attemptsMax)
			{
				console.log("Selecting " + this.attemptsMax + " fittest...")
				this.attempts.sort(function(a, b){
					return b.score - a.score;
				});
				this.current = 0;
				this.attempts.splice(this.attemptsMax, this.attempts.length - this.attemptsMax);
				
				this.storeInLocalStorage();
			}
			this.currentAI = this.attempts[Math.floor(this.current / this.perAttempt)].ai.mutate();
			if (this.currentAI == false)
			{
				console.error("Current AI is false!!! AI network is malformed!!!");
				game.intervaltime = 0;
				return false;
			}
			game.board.generateMap();
		} else
		{
			var map = game.board.getMap(mapsize);
			for (var i = 0; i < map.length; i++)
				for (var j = 0; j < map[i].length; j++)
					this.currentAI.setInput(i * map.length + j, map[i][j]);
			this.currentAI.setInput(maptotal, game.board.getAngle());
			this.currentAI.setInput(maptotal + 1, game.board.getHunger());
			
			var right = this.currentAI.getOutput(0);
			var left = this.currentAI.getOutput(1);
			
			if (3 * left > 1 && 3 * right <= 1)
				game.board.turnLeft();
			else if (3 * right > 1 && 3 * left <= 1)
				game.board.turnRight();
			else
				game.board.setStr8();
		}
	}
	
	this.getTopAttempts = function()
	{
		var copyattempts = [];
		for (var i = 0; i < this.attempts.length; i++)
			copyattempts[i] = this.attempts[i];
		
		copyattempts.sort(function(a, b){
			return b.score - a.score;
		});
		copyattempts.splice(this.attemptsMax, copyattempts.length - this.attemptsMax);
		
		for (var i = 0; i < copyattempts.length; i++)
			copyattempts[i] = {score: copyattempts[i].score, ai: copyattempts[i].ai.save()};
		
		return copyattempts;
	}
	
	this.storeInLocalStorage = function()
	{
		localStorage.setItem("savedAI", JSON.stringify(this.getTopAttempts()));
	}
	
	this.save = function()
	{
		var blob = new Blob([JSON.stringify(this.getTopAttempts())], {type: "application/json"});
		
		var url = URL.createObjectURL(blob);
		
		var link = document.createElement("a");
		link.style.display = "none";
		link.href = url;
		
		document.body.appendChild(link);
		
		link.download = "dank-memes.json";
		
		link.click();
		
		URL.revokeObjectURL(url);
	}
	
	this.load = function(data)
	{
		this.loadData = data;
	}
}

var Gameboard = function Gameboard()
{
	var SIZE = 25;
	
	this.obstaclechance = 0.025;
	
	this.obstacles = [];
	this.snake = [];
	
	this.foodx;
	this.foody;
	
	this.frontx = 2;
	this.fronty = 0;
	//1: right, 2: down, 3: left, 4: up
	
	this.backx = 0;
	this.backy = 0;
	
	var isPaused = false;
	
	var repaint = true;
	
	this.alive = true;
	
	this.score = 3;
	this.life = 0;
	
	this.dragframe = false;
	
	this.hunger = 0;
	
	this.custominput = 0;
	
	this.ai = new SnakeAI();
	
	this.generateMap = function generateMap()
	{
		this.alive = false;
		this.score = 0;
		this.life = 0;
		this.hunger = 0;
		this.generateSnake();
		this.generateObstacles();
		this.generateFood();
		this.alive = true;
	}
	
	this.generateSnake = function generateSnake()
	{
		this.snake = [];
		for (var i = 0; i < SIZE; i++)
		{
			this.snake[i] = [];
			for (var j = 0; j < SIZE; j++)
				this.snake[i][j] = 0;
		}
		this.snake[1][1] = this.snake[2][1] = this.snake[3][1] = 1;
		this.frontx = 3;
		this.fronty = 1;
		this.backx = 1;
		this.backy = 1;
	}
	
	this.generateObstacles = function generateObstacles()
	{
		this.obstacles = [];
		for (var i = 0; i < SIZE; i++)
		{
			this.obstacles[i] = [];
			for (var j = 0; j < SIZE; j++)
				this.obstacles[i][j] = Math.random() < this.obstaclechance && this.snake[i][j] == 0 || i == 0 || j == 0 || i == SIZE - 1 || j == SIZE - 1;
		}
	}
	
	this.generateFood = function generateFood()
	{
		while (true)
		{
			var x = Math.floor(Math.random() * SIZE);
			var y = Math.floor(Math.random() * SIZE);
			if (!this.obstacles[x][y] && this.snake[x][y] == 0 && this.frontx != x && this.fronty != y)
			{
				this.foodx = x;
				this.foody = y;
				break;
			}
		}
	}
	
	this.render = function render(ctx)
	{
		var width = ctx.canvas.scrollWidth;
		var height = ctx.canvas.scrollHeight;
		
		ctx.canvas.width = width;
		ctx.canvas.height = height;
		
		var smallest = Math.min(width, height);
		
		var size = smallest / SIZE;
		ctx.translate(width / 2, height / 2);
		ctx.scale(size, size);
		ctx.translate(-SIZE / 2, -SIZE / 2);
		
		ctx.fillStyle = "#66f";
		ctx.fillRect(0, 0, SIZE, SIZE);
		
		ctx.fillStyle = "#000";

		for (var i = 0; i < this.obstacles.length; i++)
			for (var j = 0; j < this.obstacles[i].length; j++)
				if (this.obstacles[i][j])
					ctx.fillRect(i, j, 1, 1);

		ctx.fillStyle = "#6f6";
		ctx.fillRect(this.foodx, this.foody, 1, 1);

		ctx.fillStyle = "#bf6";
		for (var i = 0; i < this.snake.length; i++)
			for (var j = 0; j < this.snake[i].length; j++)
				if (this.snake[i][j] != 0)
					ctx.fillRect(i, j, 1, 1);
				
		ctx.translate(SIZE / 2, SIZE / 2);
		ctx.scale(1 / size, 1 / size);
		ctx.translate(-width / 2, -height / 2);
		
		/*if (!this.alive)
		{
			ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
			ctx.fillRect(0, 0, width, height);
			
			ctx.fillStyle = "white";
			ctx.font = "1000px Verdana";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("rekt", width / 2, height / 2);
			//loomen++;
		}*/
		
		ctx.fillStyle = "white";
		ctx.font = "50px Verdana";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText("Score: " + this.score, 0, 0);
		
		if (this.dragframe)
		{
			ctx.strokeStyle = "red";
			ctx.lineWidth = 10;
			ctx.strokeRect(20, 20, width - 40, height - 40);
		}
		
		//if (!this.alive)
		//	ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);
		
		/*if (loomen == 60)
		{
			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, width, height);
			
			ctx.fillStyle = "white";
			ctx.font = "400px Verdana";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("ILLUMINATI", width / 2, height / 2);
		} else if (loomen == 90 || loomen == 100)
		{
			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, width, height);
			
			ctx.fillStyle = "white";
			ctx.font = "400px Verdana";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("MELT FUEL", width / 2, height / 2 - 350);
			ctx.fillText("CAN'T STEEL", width / 2, height / 2);
			ctx.fillText("JET BEAMS", width / 2, height / 2 + 350);
		}*/
	}
	
	this.updateSnake = function updateSnake()
	{
		this.checkKeys();
		if (!this.updateFront())
			this.updateBack();
	}
	
	this.checkKeys = function checkKeys()
	{
		var right = this.custominput == 1;
		var left = this.custominput == -1;
		
		if (right)
			this.hunger += 0.005;
		if (left)
			this.hunger += 0.005;
		
		this.custominput = 0;
		
		switch (this.snake[this.frontx][this.fronty])
		{
			case 1:
				this.snake[this.frontx][this.fronty] = left ? (right ? this.snake[this.frontx][this.fronty] : 4) : (right ? 2 : this.snake[this.frontx][this.fronty]);
				break;
			case 2:
				this.snake[this.frontx][this.fronty] = left ? (right ? this.snake[this.frontx][this.fronty] : 1) : (right ? 3 : this.snake[this.frontx][this.fronty]);
				break;
			case 3:
				this.snake[this.frontx][this.fronty] = right ? (left ? this.snake[this.frontx][this.fronty] : 4) : (left ? 2 : this.snake[this.frontx][this.fronty]);
				break;
			case 4:
				this.snake[this.frontx][this.fronty] = right ? (left ? this.snake[this.frontx][this.fronty] : 1) : (left ? 3 : this.snake[this.frontx][this.fronty]);
				break;
		}
	}
	
	this.updateFront = function updateFront()
	{
		var keeptail = false;
		var first = this.snake[this.frontx][this.fronty];
		switch (first)
		{
			case 1:
				this.frontx++;
				break;
			case 2:
				this.fronty++;
				break;
			case 3:
				this.frontx--;
				break;
			case 4:
				this.fronty--;
				break;
		}
		if (this.hunger >= 1 || this.obstacle(this.frontx, this.fronty) || this.snake[this.frontx][this.fronty] != 0)
		{
			this.alive = false;
			//akbar();
			return true;
		}
		if (this.food(this.frontx, this.fronty))
		{
			this.hunger = 0;
			this.score++;
			keeptail = true;
			this.generateFood();
		}
		this.snake[this.frontx][this.fronty] = first;
		return keeptail;
	}
	
	this.updateBack = function updateBack()
	{
		var last = this.snake[this.backx][this.backy];
		this.snake[this.backx][this.backy] = 0;
		switch (last)
		{
			case 1:
				this.backx++;
				break;
			case 2:
				this.backy++;
				break;
			case 3:
				this.backx--;
				break;
			case 4:
				this.backy--;
				break;
		}
	}
	
	this.food = function food(x, y)
	{
		return this.foodx == x && this.foody == y;
	}
	
	this.obstacle = function obstacle(x, y)
	{
		if (x < 0 || x >= SIZE || y < 0 || y >= SIZE)
			return true;
		return this.obstacles[x][y] || this.snake[x][y] != 0;
	}
	
	this.snake = function snake(x, y)
	{
		if (x < 0 || x >= SIZE || y < 0 || y >= SIZE)
			return 0;
		return this.snake[x][y];
	}
	
	this.turnRight = function turnRight()
	{
		this.custominput = 1;
	}
	
	this.turnLeft = function turnLeft()
	{
		this.custominput = -1;
	}
	
	this.setStr8 = function setStr8()
	{
		this.custominput = 0;
	}
	
	this.isAlive = function isAlive()
	{
		return this.alive;
	}
	
	this.getScore = function getScore()
	{
		return this.score;
	}
	
	this.getLife = function getLife()
	{
		return this.life;
	}
	
	this.getHunger = function getHunger()
	{
		return this.hunger;
	}
	
	this.getAngle = function getAngle()
	{
		if (!this.isAlive())
			return 0;
		var dir = this.snake[this.frontx][this.fronty];
		
		var difx = this.foodx - this.frontx;
		var dify = this.foody - this.fronty;
		
		switch (dir)
		{
			case 1:
				var dift = difx;
				difx = dify;
				dify = dift;
				break;
			case 2:
				//difx = -difx;
				//dify = -dify;
				break;
			case 3:
				var dift = difx;
				difx = -dify;
				dify = -dift;
				break;
			case 4:
				difx = -difx;
				dify = -dify;
				break;
		}
		
		return Math.max(-1, Math.min(1, 2 * Math.atan2(difx, dify) / Math.PI)) * ((dir % 2 == 1) ? 1 : -1);
	}
	
	this.getMap = function getMap(mapsize)
	{
		var map = [];
		
		for (var i = 0; i < mapsize; i++)
		{
			map[i] = [];
			for (var j = 0; j < mapsize; j++)
				map[i][j] = 0;
		}
		
		if (!this.isAlive())
			return map;
		
		var dir = this.snake[this.frontx][this.fronty];
		
		var offset = Math.floor(mapsize / 2);
		var end = Math.ceil(mapsize / 2);
		
		for (var i = -offset; i < end; i++)
			for (var j = -offset; j < end; j++)
			{
				var val = 0;
				switch (dir)
				{
					case 1:
						val = this.obstacle(this.frontx + j, this.fronty + i) ? -1 : (this.food(this.frontx + j, this.fronty + i) ? 1 : 0);
						break;
					case 2:
						val = this.obstacle(this.frontx - i, this.fronty + j) ? -1 : (this.food(this.frontx - i, this.fronty + j) ? 1 : 0);
						break;
					case 3:
						val = this.obstacle(this.frontx - j, this.fronty - i) ? -1 : (this.food(this.frontx - j, this.fronty - i) ? 1 : 0);
						break;
					case 4:
						val = this.obstacle(this.frontx + i, this.fronty - j) ? -1 : (this.food(this.frontx + i, this.fronty - j) ? 1 : 0);
						break;
				}
				map[i + offset][j + offset] = val;
			}
		return map;
	}
	
	this.tick = function tick()
	{
		this.ai.update();
		if (this.alive)
		{
			this.hunger += 0.005;
			this.updateSnake();
			this.life++;
		}
		return true;
	}

	this.keydown = function keydown(e)
	{
		switch (e.keyCode)
		{
			case 68: //D
				game.board.turnRight();
				break;
			case 65: //A
				game.board.turnLeft();
				break;
			case 27: //Esc
				game.board.alive = false;
				break;
			case 82: //R
				game.repaint = !game.repaint;
				break;
			case 80: //P
				game.pause = !game.pause;
				break;
			case 84: //T
				game.intervaltime = 50 - game.intervaltime;
				break;
			case 83: //S
				game.pause = true;
				game.board.ai.save();
				break;
			case 76: //L
				//TODO load
				break;
			case 73: //I
				if (document.body.hasAttribute("full"))
					document.body.removeAttribute("full");
				else
					document.body.setAttribute("full", "");
				break;
		}
	}
		
	this.generateMap();
}
