Neuron = function(x, y)
{
	this.bias = 0;
	
	this.inputs = [];
	this.weights = [];
	this.allinputs = [];
	this.outputs = [];
	this.alloutputs = [];
	
	/**
	 * Used for Springy
	 */
	this.mass = 1;
	this.color = 0;
	this.label = 0;
	this.width = 5;
	this.height = 5;
	this.x = x;
	this.y = y;
	
	this.node = {};
	this.inputEdges = [];
	
	/**
	 * When any <code>Neuron</code> is inserted in the middle of all the <code>Neuron</code>s, the indices after that <code>Neuron</code> must be incremented
	 * @param x The index of the newly inserted <code>Neuron</code>
	 */
	this.incrementInputIndicesAfter = function(x)
	{
		for (var i = 0; i < this.inputs.length; i++)
			if (this.inputs[i] >= x)
				this.inputs[i]++;
		for (var i = 0; i < this.allinputs.length; i++)
			if (this.allinputs[i] >= x)
				this.allinputs[i]++;
		for (var i = 0; i < this.outputs.length; i++)
			if (this.outputs[i] >= x)
				this.outputs[i]++;
		for (var i = 0; i < this.alloutputs.length; i++)
			if (this.alloutputs[i] >= x)
				this.alloutputs[i]++;
	}
	
	/**
	 * When any <code>Neuron</code> is removed from the middle of all <code>Neuron</code>s, the indices after that must be decremented
	 * @param x The index of the removed <code>Neuron</code>
	 */
	this.decrementInputIndicesAfter = function(x)
	{
		for (var i = 0; i < this.inputs.length; i++)
			if (this.inputs[i] > x)
				this.inputs[i]--;
		for (var i = 0; i < this.allinputs.length; i++)
			if (this.allinputs[i] > x)
				this.allinputs[i]--;
		for (var i = 0; i < this.outputs.length; i++)
			if (this.outputs[i] > x)
				this.outputs[i]--;
		for (var i = 0; i < this.alloutputs.length; i++)
			if (this.alloutputs[i] > x)
				this.alloutputs[i]--;
	}
	
	/**
	 * Add a new <code>Neuron</code> to this <code>Neuron</code>'s inputs
	 * @param a the list of all <code>Neuron</code>s
	 * @param n the index of the to-add <code>Neuron</code>
	 * @param weight the weight of the newly added input
	 */
	this.addInput = function(a, n, weight)
	{
		//If the to-add neuron is this neuron or is already added, or this neuron is a sub-child of the to-add neuron,
		if (a[n] == this || this.inputs.indexOf(n) != -1 || a[n].allinputs.indexOf(a.indexOf(this)) != -1)
			return false; //Then don't add it
		
		//if (n == 0 || n >= a.length)
		//	return ("n: " + n + ", a.length: " + a.length);
		
		//Add the input
		this.inputs.push(n);
		this.weights.push(weight);
		
		//Tell the input neuron that this neuron is now an output neuron
		a[n].addOutput(a, a.indexOf(this));
		
		this.addedInput(a, n);
		for (var i = 0; i < this.alloutputs.length; i++)
			a[this.alloutputs[i]].addedInput(a, n);
		
		return true;
	}
	
	this.addedInput = function(a, n)
	{
		//Push the new input into this node's allinputs
		this.allinputs.push(n);
		
		//Push all of the new input's allinputs into this node's allinputs
		for (var i = 0; i < a[n].allinputs.length; i++)
			this.allinputs.push(a[n].allinputs[i]);
	}
	
	this.addOutput = function(a, n)
	{
		if (this.outputs.indexOf(n) != -1)
		{
			console.error("ERROR!! ADDING A NODES OUTPUT TWICE"); //has happened
			var x = [];
			x[1] = 5 / 0;
			return false; //TODO shouldn't happen
		}
		
		this.outputs.push(n);
		
		this.addedOutput(a, n);
		for (var i = 0; i < this.allinputs.length; i++) //Do the same for this node's allinputs
			a[this.allinputs[i]].addedOutput(a, n);
	}
	
	this.addedOutput = function(a, n)
	{
		//Push the new output into this node's alloutputs
		this.alloutputs.push(n);
		
		//Push all of the new output's alloutputs into this node's alloutputs
		for (var i = 0; i < a[n].alloutputs.length; i++)
			this.alloutputs.push(a[n].alloutputs[i]);
	}
	
	this.removeInput = function(a, n)
	{
		if (this.inputs.indexOf(n) == -1)
			return false;
		
		var ind = this.inputs.indexOf(n);
		
		this.weights.splice(ind, 1);
		this.inputs.splice(ind, 1);
		
		a[n].removeOutput(a, a.indexOf(this));
		
		this.removedInput(a, n);
		for (var i = 0; i < this.alloutputs.length; i++)
			a[this.alloutputs[i]].removedInput(a, n);
	}
	
	this.removedInput = function(a, n)
	{
		this.allinputs.splice(this.allinputs.indexOf(n), 1);
		
		for (var i = 0; i < a[n].allinputs.length; i++)
			this.allinputs.splice(this.allinputs.indexOf(a[n].allinputs[i]), 1);
	}
	
	this.removeOutput = function(a, n)
	{
		if (this.outputs.indexOf(n) == -1)
			return false;
		
		this.outputs.splice(this.outputs.indexOf(n), 1);
		
		this.removedOutput(a, n);
		for (var i = 0; i < this.allinputs.length; i++)
			a[this.allinputs[i]].removedOutput(a, n);
	}
	
	this.removedOutput = function(a, n)
	{
		this.alloutputs.splice(this.alloutputs.indexOf(n), 1);
		
		for (var i = 0; i < a[n].alloutputs.length; i++)
			this.alloutputs.splice(this.alloutputs.indexOf(a[n].alloutputs[i]), 1);
	}
	
	/**
	 * Calculates how excited this <code>Neuron</code> is
	 * @param neurons The input <code>Neuron</code>s
	 * @param t Tick number, to make sure no infinite loops happen
	 * @return How excited the <code>Neuron</code> is
	 */
	this.tick = function(neurons, t)
	{
		if (t == 100)
		{
			while (true)
				console.error("ERROR! 100");
			return;
		}
		var val = this.bias;
		
		for (var i = 0; i < this.inputs.length; i++)
			val += neurons[this.inputs[i]].tick(neurons, t + 1) * this.weights[i];
		
		var ret = (1 / (1 + Math.exp(-val * 2))) * 2 - 1;
		this.label = (ret * 100) + "%";
		
		var top = Math.round((ret < 0 ? -ret : ret) * 255);
		var bot = 255 - top;
		
		if (this.ret > 0)
			this.color = '#' + ('00000' + (top * 256 + bot).toString(16)).substr(-6);
		else
			this.color = '#' + ('00000' + (top * 256 * 256 + bot).toString(16)).substr(-6);
		
		return ret;
	}
	
	/**
	 * @return A <code>Neuron</code> that is an exact copy of this <code>Neuron</code>
	 */
	this.copy = function()
	{
		var n = new Neuron(this.x, this.y);
		n.bias = this.bias;
		
		for (var i = 0; i < this.inputs.length; i++)
			n.inputs.push(this.inputs[i]);
		for (var i = 0; i < this.weights.length; i++)
			n.weights.push(this.weights[i]);
		for (var i = 0; i < this.allinputs.length; i++)
			n.allinputs.push(this.allinputs[i]);
		for (var i = 0; i < this.outputs.length; i++)
			n.outputs.push(this.outputs[i]);
		for (var i = 0; i < this.alloutputs.length; i++)
			n.alloutputs.push(this.alloutputs[i]);
		
		return n;
	}
	
	/**
	 * @return A <code>Neuron</code> that is a slightly modified version of this <code>Neuron</code>
	 */
	this.mutate = function()
	{
		var n = new Neuron(this.x, this.y);
		n.bias = (Math.random() > 0.05 ? (this.bias + (Math.random() * 2 - 1) / 10) : (-this.bias + (Math.random() * 2 - 1) / 10));
		
		for (var i = 0; i < this.inputs.length; i++)
			n.inputs.push(this.inputs[i]);
		for (var i = 0; i < this.weights.length; i++)
			n.weights.push(Math.random() > 0.05 ? (this.weights[i] + (Math.random() * 2 - 1) / 10) : (-this.weights[i] + (Math.random() * 2 - 1) / 10));
		for (var i = 0; i < this.allinputs.length; i++)
			n.allinputs.push(this.allinputs[i]);
		for (var i = 0; i < this.outputs.length; i++)
			n.outputs.push(this.outputs[i]);
		for (var i = 0; i < this.alloutputs.length; i++)
			n.alloutputs.push(this.alloutputs[i]);
		
		return n;
	}
	
	
	this.createNode = function(graph)
	{
		this.node = graph.newNode(this); //TODO possible memory leak
	}
	
	this.createEdges = function(graph, n)
	{
		for (var i = 0; i < this.inputs.length; i++)
			this.inputEdges.push(graph.newEdge(n[this.inputs[i]].node, this.node, {weightz: this.weights[i]}));
	}
	
	this.clean = function(graph)
	{
		graph.removeNode(this.node);
		this.inputEdges = [];
		delete this.node;
		delete this.mass;
		delete this.color;
		delete this.label;
		delete this.width;
		delete this.height;
		delete this.inputEdges;
		//delete this.x;
		//delete this.y;
		
		//delete this.allinputs;
		//delete this.alloutputs;
		//delete this.outputs;
	}
}

InputNeuron = function(x, y)
{
	this.val = 0;
	this.outputs = [];
	this.alloutputs = [];
	this.inputs = [];
	this.allinputs = [];
	
	/**
	 * Used for Springy
	 */
	this.mass = 999999999999999;
	this.color = 0;
	this.x = x;
	this.y = y;
	this.width = 5;
	this.height = 5;
	this.input = true;
	
	this.node = {};
	
	this.setValue = function(val)
	{
		this.val = val;
		
		var top = Math.round((val < 0 ? -val : val) * 255);
		var bot = 255 - top;
		
		if (this.val > 0)
			this.color = '#' + ('00000' + (top * 256 + bot).toString(16)).substr(-6);
		else
			this.color = '#' + ('00000' + (top * 256 * 256 + bot).toString(16)).substr(-6);
	}
	
	/**
	 * When any <code>Neuron</code> is inserted in the middle of all the <code>Neuron</code>s, the indices after that <code>Neuron</code> must be incremented
	 * @param x The index of the newly inserted <code>Neuron</code>
	 */
	this.incrementInputIndicesAfter = function(x)
	{
		for (var i = 0; i < this.outputs.length; i++)
			if (this.outputs[i] >= x)
				this.outputs[i]++;
		for (var i = 0; i < this.alloutputs.length; i++)
			if (this.alloutputs[i] >= x)
				this.alloutputs[i]++;
	}
	
	/**
	 * When any <code>Neuron</code> is removed from the middle of all <code>Neuron</code>s, the indices after that must be decremented
	 * @param x The index of the removed <code>Neuron</code>
	 */
	this.decrementInputIndicesAfter = function(x)
	{
		for (var i = 0; i < this.outputs.length; i++)
			if (this.outputs[i] > x)
				this.outputs[i]--;
		for (var i = 0; i < this.alloutputs.length; i++)
			if (this.alloutputs[i] > x)
				this.alloutputs[i]--;
	}
	
	this.addInput = function(a, n, weight)
	{
		return false;
	}
	
	this.addedInput = function(a, n)
	{
		return false;
	}
	
	this.addOutput = function(a, n)
	{
		if (this.outputs.indexOf(n) != -1)
		{
			while (true)
				console.error("ERROR!! ADDING A NODES OUTPUT TWICE");
			return false; //TODO shouldn't happen
		}
		
		this.outputs.push(n);
		this.addedOutput(a, n);
	}
	
	this.addedOutput = function(a, n)
	{
		//Push the new output into this node's alloutputs
		this.alloutputs.push(n);
		
		//Push all of the new output's alloutputs into this node's alloutputs
		for (var i = 0; i < a[n].alloutputs.length; i++)
			this.alloutputs.push(a[n].alloutputs[i]);
	}
	
	this.removeInput = function(a, n)
	{
		return false;
	}
	
	this.removedInput = function(a, n)
	{
		return false;
	}
	
	this.removeOutput = function(a, n)
	{
		if (this.outputs.indexOf(n) == -1)
		{
			console.error("ERROR 388");
			var x = [];
			x[1] = 5 / 0;
			return false;
		}
		
		this.outputs.splice(this.outputs.indexOf(n), 1);
		
		this.removedOutput(a, n);
	}
	
	this.removedOutput = function(a, n)
	{
		this.alloutputs.splice(this.alloutputs.indexOf(n), 1);
		
		for (var i = 0; i < a[n].alloutputs.length; i++)
			this.alloutputs.splice(this.alloutputs.indexOf(a[n].alloutputs[i]), 1);
	}
	
	this.tick = function(neurons, t)
	{
		return this.val;
	}
	
	/**
	 * @return A <code>Neuron</code> that is an exact copy of this <code>Neuron</code>
	 */
	this.copy = function()
	{
		var n = new InputNeuron(x, y);
		
		for (var i = 0; i < this.outputs.length; i++)
			n.outputs.push(this.outputs[i]);
		
		for (var i = 0; i < this.alloutputs.length; i++)
			n.alloutputs.push(this.alloutputs[i]);
		
		return n;
	}
	
	/**
	 * @return A <code>Neuron</code> that is a slightly modified version of this <code>Neuron</code>
	 */
	this.mutate = function()
	{
		return this.copy();
	}
	
	
	this.createNode = function(graph)
	{
		this.node = graph.newNode(this);
	}
	
	this.createEdges = function(graph, n)
	{
	}
	
	this.clean = function(graph)
	{
		graph.removeNode(this.node);
		
		delete this.node;
		delete this.graph;
		
		delete this.mass;
		delete this.color;
		delete this.width;
		delete this.height;
		//delete this.input;
		
		//delete this.x;
		//delete this.y;
		
		delete this.val;
	}
}

Gene = function(n){
	this.neurons = n;
	this.inputsn = [];
	
	this.inputs = [];
	this.weights = [];
	this.allinputs = [];
	this.outputs = [];
	this.alloutputs = [];
	
	this.output = this.neurons[0];
	
	/**
	 * Used for Springy
	 */
	this.mass = 2;
	for (var i = 0; i < this.neurons.length; i++)
		this.mass += this.neurons[i].mass;
	this.color = 0;
	this.width = 10;
	this.height = 10;
	this.isGene = true;
	
	this.node = {};
	
	this.inputEdges = [];
	
	
	/**
	 * Container for inner elements
	 */
	this.graph = new Springy.Graph();
	
	this.addNeuron = function(n)
	{
		this.neurons.push(n);
		this.mass += n.mass;
	}
	
	
	/**
	 * When any <code>Neuron</code> is inserted in the middle of all the <code>Neuron</code>s, the indices after that <code>Neuron</code> must be incremented
	 * @param x The index of the newly inserted <code>Neuron</code>
	 */
	this.incrementInputIndicesAfter = function(x)
	{
		for (var i = 0; i < this.inputs.length; i++)
			if (this.inputs[i] >= x)
				this.inputs[i]++;
		for (var i = 0; i < this.allinputs.length; i++)
			if (this.allinputs[i] >= x)
				this.allinputs[i]++;
		for (var i = 0; i < this.outputs.length; i++)
			if (this.outputs[i] >= x)
				this.outputs[i]++;
		for (var i = 0; i < this.alloutputs.length; i++)
			if (this.alloutputs[i] >= x)
				this.alloutputs[i]++;
	}
	
	/**
	 * When any <code>Neuron</code> is removed from the middle of all <code>Neuron</code>s, the indices after that must be decremented
	 * @param x The index of the removed <code>Neuron</code>
	 */
	this.decrementInputIndicesAfter = function(x)
	{
		for (var i = 0; i < this.inputs.length; i++)
			if (this.inputs[i] > x)
				this.inputs[i]--;
		for (var i = 0; i < this.allinputs.length; i++)
			if (this.allinputs[i] > x)
				this.allinputs[i]--;
		for (var i = 0; i < this.outputs.length; i++)
			if (this.outputs[i] > x)
				this.outputs[i]--;
		for (var i = 0; i < this.alloutputs.length; i++)
			if (this.alloutputs[i] > x)
				this.alloutputs[i]--;
	}
	
	
	
	
	/**
	 * Add a new <code>Neuron</code> to this <code>Neuron</code>'s inputs
	 * @param a the list of all <code>Neuron</code>s
	 * @param n the index of the to-add <code>Neuron</code>
	 * @param weight the weight of the newly added input
	 */
	this.addInput = function(a, n, weight)
	{
		//If the to-add neuron is this neuron or is already added, or this neuron is a sub-child of the to-add neuron,
		if (a[n] == this || this.inputs.indexOf(n) != -1 || a[n].allinputs.indexOf(a.indexOf(this)) != -1)
			return false; //Then don't add it
		
		//if (n == 0 || n >= a.length)
		//	return ("n: " + n + ", a.length: " + a.length);
		
		//Add the input
		this.inputs.push(n);
		this.weights.push(weight);
		
		this.inputsn.push(this.neurons.length);
		this.addNeuron(new InputNeuron(0, 0));
		
		//Tell the input neuron that this neuron is now an output neuron
		a[n].addOutput(a, a.indexOf(this));
		
		this.addedInput(a, n);
		for (var i = 0; i < this.alloutputs.length; i++)
			a[this.alloutputs[i]].addedInput(a, n);
		
		return true;
	}
	
	this.addedInput = function(a, n)
	{
		//Push the new input into this node's allinputs
		this.allinputs.push(n);
		
		//Push all of the new input's allinputs into this node's allinputs
		for (var i = 0; i < a[n].allinputs.length; i++)
			this.allinputs.push(a[n].allinputs[i]);
	}
	
	this.addOutput = function(a, n)
	{
		if (this.outputs.indexOf(n) != -1)
		{
			console.error("ERROR!! ADDING A NODES OUTPUT TWICE"); //has happened
			var x = [];
			x[1] = 5 / 0;
			return false; //TODO shouldn't happen
		}
		
		this.outputs.push(n);
		
		this.addedOutput(a, n);
		for (var i = 0; i < this.allinputs.length; i++) //Do the same for this node's allinputs
			a[this.allinputs[i]].addedOutput(a, n);
	}
	
	this.addedOutput = function(a, n)
	{
		//Push the new output into this node's alloutputs
		this.alloutputs.push(n);
		
		//Push all of the new output's alloutputs into this node's alloutputs
		for (var i = 0; i < a[n].alloutputs.length; i++)
			this.alloutputs.push(a[n].alloutputs[i]);
	}
	
	this.removeInput = function(a, n)
	{
		if (this.inputs.indexOf(n) == -1)
			return false;
		
		var ind = this.inputs.indexOf(n);
		
		
		var remn = this.inputsn[ind];
		this.inputsn.splice(ind, 1);
		this.removeNeuron(remn);
		
		this.weights.splice(ind, 1);
		this.inputs.splice(ind, 1);
		
		a[n].removeOutput(a, a.indexOf(this));
		
		this.removedInput(a, n);
		for (var i = 0; i < this.alloutputs.length; i++)
			a[this.alloutputs[i]].removedInput(a, n);
	}
	
	this.removedInput = function(a, n)
	{
		this.allinputs.splice(this.allinputs.indexOf(n), 1);
		
		for (var i = 0; i < a[n].allinputs.length; i++)
			this.allinputs.splice(this.allinputs.indexOf(a[n].allinputs[i]), 1);
	}
	
	this.removeOutput = function(a, n)
	{
		if (this.outputs.indexOf(n) == -1)
			return false;
		
		this.outputs.splice(this.outputs.indexOf(n), 1);
		
		this.removedOutput(a, n);
		for (var i = 0; i < this.allinputs.length; i++)
			a[this.allinputs[i]].removedOutput(a, n);
	}
	
	this.removedOutput = function(a, n)
	{
		this.alloutputs.splice(this.alloutputs.indexOf(n), 1);
		
		for (var i = 0; i < a[n].alloutputs.length; i++)
			this.alloutputs.splice(this.alloutputs.indexOf(a[n].alloutputs[i]), 1);
	}
	
	this.removeNeuron = function(n)
	{
		if (neurons.length <= n)
			return false;
		
		var neur = neurons[n];
		
		while (neur.inputs.length > 0)
		{
			if (!neur.removeInput(neurons, neur.inputs[0]))
			{
				console.error("Can't remove input " + neur.inputs[0] + "!");
				return false;
			}
		}
		
		while (neur.outputs.length > 0)
		{
			if (!neurons[neur.outputs[0]].removeInput(neurons, n))
			{
				console.error("Can't remove output " + neur.outputs[0] + "!");
				return false;
			}
		}
		
		for (var i = 0; i < this.inputsn.length; i++)
			if (this.inputsn[i] > n)
				this.inputsn[i]--;
		
		this.mass -= neur.mass;
		
		neurons.splice(n, 1);
		
		for (var i = 0; i < neurons.length; i++)
			neurons[i].decrementInputIndicesAfter(n);
		
		return true;
	}
	
	
	this.tick = function(neurons, t)
	{
		if (t == 100)
		{
			console.log("ERROR! 100");
			return;
		}
		for (var i = 0; i < this.inputs.length; i++)
			this.neurons[this.inputsn[i]].setValue(neurons[this.inputs[i]].tick(neurons, t + 1) * this.weights[i]);
		var ret = output.tick(this.neurons, t);
		var col = Math.round(ret * 255);
		
		this.color = '#' + ('00000' + ((col * 256 + col) * 256 + col).toString(16).substr(-6));
		
		return ret;
	}
	
	this.copy = function()
	{
		//Create copies of all the neurons
		var newneurons = [];
		for (var i = 0; i < this.neurons.length; i++)
			newneurons[i] = this.neurons[i].copy();
		
		var g = new Gene(newneurons);
		
		for (var i = 0; i < this.inputs.length; i++)
		{
			g.inputs[i] = this.inputs[i];
			g.weights[i] = this.weights[i];
			g.inputsn[i] = this.inputsn[i];
		}
		
		for (var i = 0; i < this.outputs.length; i++)
			g.outputs[i] = this.outputs[i];
		
		for (var i = 0; i < this.allinputs.length; i++)
			g.allinputs[i] = this.allinputs[i];
		for (var i = 0; i < this.alloutputs.length; i++)
			g.alloutputs[i] = this.alloutputs[i];
		
		return g;
	}
	
	this.mutate = function()
	{
		//Create copies of all the neurons
		var newneurons = [];
		for (var i = 0; i < this.neurons.length; i++)
			newneurons[i] = this.neurons[i].copy();
		
		var g = new Gene(newneurons);
		
		for (var i = 0; i < this.inputs.length; i++)
		{
			g.inputs[i] = this.inputs[i];
			g.weights[i] = this.weights[i];
			g.inputsn[i] = this.inputsn[i];
		}
		
		for (var i = 0; i < this.outputs.length; i++)
			g.outputs[i] = this.outputs[i];
		
		for (var i = 0; i < this.allinputs.length; i++)
			g.allinputs[i] = this.allinputs[i];
		for (var i = 0; i < this.alloutputs.length; i++)
			g.alloutputs[i] = this.alloutputs[i];
		
		
		//Make a few new neurons
		if (Math.random() < 0.5)
			g.addNeuron(new Neuron());
		
		//Remove a few neurons
		if (g.neurons.length > 1 && Math.random() < 0.5)
		{
			var el = 1 + Math.floor(Math.random() * (g.neurons.length - 1));
			if (g.inputsn.indexOf(el) == -1)
				g.removeNeuron(el);
		}
		
		//Create a few random connections between neurons and check if every single neuron is somehow connected
		for (var i = 1; i < g.neurons.length; i++)
			while (g.neurons[0].allinputs.indexOf(i) == -1 || (Math.random() < 0.1))
				g.neurons[Math.floor(Math.random() * g.neurons.length)].addInput(g.neurons, i, Math.cbrt(Math.random() * 2 - 1));
		
		return g;
	}
	
	
	this.createNode = function(graph)
	{
		this.node = graph.newNode(this); //TODO possible memory leak
		for (var i = 0; i < this.neurons.length; i++)
			this.neurons[i].createNode(this.graph);
	}
	
	this.createEdges = function(graph, n)
	{
		for (var i = 0; i < this.inputs.length; i++)
			this.inputEdges.push(this.graph.newEdge(n[this.inputs[i]].node, this.node, /*n[this.inputs[i]].edgeData*/{weightz: this.weights[i]}));
	}
	
	this.clean = function(graph)
	{
		graph.removeNode(this.node);
		for (var i = 0; i < this.neurons.length; i++)
			this.neurons[i].clean(this.graph);
		
		delete this.node;
		delete this.mass;
		delete this.color;
		delete this.width;
		delete this.height;
		delete this.isGene;
		delete this.inputEdges;
	}
}

var Network = function(inp, out, ne/*, createdImages*/)
{
	//this.createdImages = createdImages;
	/**
	 * The outputs of the network
	 */
	this.outputs = out;

	/**
	 * The network's inputs
	 */
	this.inputs = inp;

	/**
	 * The AI's brain
	 */
	this.neurons = ne;
	
	/**
	 * The container of the network elements
	 */
	this.display = document.createElement("canvas");
	this.display.setAttribute("class", "ainetwork");
	var net = document.getElementById("network");
	
	while (net.lastChild)
		net.removeChild(net.lastChild);
	
	net.appendChild(this.display);
	
	this.graph = new Springy.Graph();
	for (var i = 0; i < ne.length; i++)
		ne[i].createNode(this.graph);
	for (var i = 0; i < ne.length; i++)
		ne[i].createEdges(this.graph, ne);
	
	this.display.width = this.display.scrollWidth;
	this.display.height = this.display.scrollHeight;
	
	var params = {
		graph: this.graph,
		canvas: this.display,
		alive: true
	};
	
	var springy = jQuery(this.display).springy(params);
	
	this.setInput = function(n, v)
	{
		this.neurons[this.inputs[n]].setValue(v);
	}
	
	this.getOutput = function(n)
	{
		this.graph.notify();
		return this.neurons[this.outputs[n]].tick(this.neurons, 0);
	}
	
	this.removeNeuron = function(n, neurons)
	{
		if (neurons.length <= n)
			return false;
		
		//console.log("Removing neuron " + n);
		
		var neur = neurons[n];
		
		//console.log(neur.inputs.length);
		//console.log(neur.outputs.length);
		
		while (neur.inputs.length > 0)
		{
			if (neur.removeInput(neurons, neur.inputs[0]) == false)
			{
				console.error("Can't remove input " + neur.inputs[0] + "!");
				return false;
			}
		}
		
		while (neur.outputs.length > 0)
		{
			if (neurons[neur.outputs[0]].removeInput(neurons, n) == false)
			{
				console.error("Can't remove output " + neur.outputs[0] + "!");
				return false;
			}
		}
		
		neurons.splice(n, 1);
		
		for (var i = 0; i < neurons.length; i++)
			neurons[i].decrementInputIndicesAfter(n);
		
		return true;
	}
	
	this.copy = function()
	{
		var neurons = [];
		var inputs = [];
		var outputs = [];
		
		for (var i = 0; i < this.neurons.length; i++)
			neurons[i] = this.neurons[i].copy();
		
		for (var i = 0; i < this.inputs.length; i++)
			inputs[i] = this.inputs[i];
		
		for (var i = 0; i < this.outputs.length; i++)
			outputs[i] = this.outputs[i];
		
		return new Network(inputs, outputs, neurons);
	}
	
	this.mutate = function(n2)
	{
		//console.log("Copying...");
		var neurons = [];
		var inputs = [];
		var outputs = [];
		
		//var images = [];
		
		if (n2 === undefined)
			for (var i = 0; i < this.neurons.length; i++)
				neurons[i] = this.neurons[i].mutate();
		else
			for (var i = 0; i < this.neurons.length; i++)
				neurons[i] = Math.random < 0.5 ? this.neurons[i].mutate() : (n2.neurons.length > i ? n2.neurons[i].mutate() : this.neurons[i].mutate()); //TODO risky, need to check which inputs/outputs exist and don't exist
		
		for (var i = 0; i < this.inputs.length; i++)
			inputs[i] = this.inputs[i];
		
		for (var i = 0; i < this.outputs.length; i++)
			outputs[i] = this.outputs[i];
		
		//images.push({action: "Beginning mutation", image: drawAI(neurons, canvas)});
		
		if (neurons.length > inputs.length + outputs.length)
		{
			var amt = Math.min(getRemovableNeuronsAmount(), neurons.length - inputs.length - outputs.length);
			//console.log("Removing " + amt + " elements (i: " + inputs.length + ", o: " + outputs.length + ", n: " + neurons.length + ")...");
			//console.log(this);
			//console.log(this.save());
			for (var i = 0; i < amt; i++)
			{
				var el = -1;
				//console.log("Getting el");
				do
				{
					el = Math.floor(Math.random() * neurons.length);
				} while (inputs.indexOf(el) != -1 || outputs.indexOf(el) != -1);
				//console.log("Got el: " + el);
				if (this.removeNeuron(el, neurons) == false)
				{
					console.error("Could not remove neuron!!! Malformed network!!!");
					return false;
				}
				//images.push({action: "Removing element " + el, image: drawAI(neurons, canvas)});
				//console.log("Removed neuron");
			}
		}
		
		/*if (neurons.length > inputs.length + outputs.length)
		{
			//console.log("Mutating...");
			var amt = Math.min(getMutatedNeuronsAmount(), neurons.length - inputs.length - outputs.length);
			for (var i = 0; i < amt; i++)
			{
				var el;
				do
				{
					el = Math.floor(Math.random() * neurons.length);
				} while (inputs.indexOf(el) != -1 || outputs.indexOf(el) != -1);
				neurons.push(neurons[el].mutate());
				//images.push({action: "Adding new mutation of " + el + " as " + neurons.length, image: drawAI(neurons, canvas)});
			}
		}*/
		
		var amt = getNewNeuronsAmount();
		
		//console.log("Adding...");
		for (var i = 0; i < amt; i++)
			neurons.push(new Neuron());
		
		//images.push({action: "Adding " + amt + " new empty neurons", image: drawAI(neurons, canvas)});
		
		//if (Math.random() < 0.05)
		//	neurons.push(new Gene([new Neuron()]));
		
		//console.log("Connecting...");
		//Create a few random inputs
		if (neurons.length > inputs.length + outputs.length)
			for (var i = 0; i < neurons.length; i++)
			{
				if (inputs.indexOf(i) == -1/* && outputs.indexOf(i) == -1*/)
				{
					//Create a new input if there are no inputs or by random chance
					while (neurons[i].inputs.length == 0 || Math.random() < 0.2)
					{
						var newinp;
						do
						{
							newinp = Math.floor(Math.random() * neurons.length);
						} while (outputs.indexOf(newinp) != -1)
						neurons[i].addInput(neurons, newinp, Math.round(Math.random()) * 2 - 1);
						//images.push({action: "Adding an input to " + i + ": " + newinp, image: drawAI(neurons, canvas)});
					}
					
					if (outputs.indexOf(i) == -1)
					{
						var containsOutput = false;
						
						for (j = 0; j < outputs.length; j++)
						{
							if (neurons[i].alloutputs.indexOf(outputs[j]) != -1)
							{
								containsOutput = true;
								break;
							}
						}
						
						if (!containsOutput)
						{
							var whichoutput = outputs[Math.floor(Math.random() * outputs.length)];
							neurons[whichoutput].addInput(neurons, i, Math.round(Math.random()) * 2 - 1);
							//images.push({action: "Adding input " + i + " to " + whichoutput, image: drawAI(neurons, canvas)});
						}
					}
				}
			}
		
		//console.log("Splitting...");
		amt = getSplittableNeuronInputAmount();
		for (var i = 0; i < amt; i++)
		{
			var out = outputs[Math.floor(Math.random() * outputs.length)];
			
			var newneur = neurons.length;
			
			if (neurons[out].inputs.length > 0)
			{
				var ind = Math.floor(neurons[out].inputs.length * Math.random());
				var old = neurons[out].inputs[ind];
				var oldweight = neurons[out].weights[ind];
				
				neurons.push(new Neuron());
				//images.push({action: "Adding a new empty neuron at " + newneur, image: drawAI(neurons, canvas)});
				
				neurons[out].removeInput(neurons, old);
				//images.push({action: "Removing input " + old + " from " + out, image: drawAI(neurons, canvas)});
				neurons[out].addInput(neurons, newneur, oldweight);
				//images.push({action: "Adding input " + newneur + " to " + out, image: drawAI(neurons, canvas)});
				neurons[newneur].addInput(neurons, old, Math.round(Math.random()) * 2 - 1);
				//images.push({action: "Adding input " + old + " to " + newneur, image: drawAI(neurons, canvas)});
			}
		}
		//images.push({action: "Finished!!!", image: drawAI(neurons, canvas)});
		return new Network(inputs, outputs, neurons/*, images*/);
	}
	
	this.clean = function()
	{
		for (var i = 0; i < this.neurons.length; i++)
			this.neurons[i].clean(this.graph);
		params.alive = false;
		this.display.parentElement.removeChild(this.display);
		
		delete this.graph;
		delete this.display;
	}
	
	this.save = function()
	{
		return {neurons: this.neurons, inputs: this.inputs, outputs: this.outputs};
	}
}

function getNewNeuronsAmount()
{
	return Math.round(Math.pow(Math.random(), 2) * 4);
}

function getMutatedNeuronsAmount()
{
	return Math.round(Math.pow(Math.random(), 2) * 3);
}

function getRemovableNeuronsAmount()
{
	return Math.round(Math.pow(Math.random(), 2) * 4);
}

function getSplittableNeuronInputAmount()
{
	return Math.round(Math.pow(Math.random(), 3) * 3);
}


/*var canvas = document.createElement("canvas");
canvas.width = 1920;
canvas.height = 600;

var drawAI = function(neurons, canv)
{
	var draw = canv.getContext("2d");
	draw.clearRect(0, 0, canv.width, canv.height);
	draw.fillStyle = "#000";
	draw.font = "25px Open Sans";
	draw.textAlign = "center";
	draw.beginPath();
	draw.moveTo(0, 260 + 17.5);
	draw.lineTo(canv.width, 260 + 17.5);
	draw.stroke();
	for (var i = 0; i < neurons.length; i++)
	{
		draw.strokeStyle = "#000";
		draw.strokeRect(10 + i * 50, 10, 35, 35);
		draw.fillText(i + "", 27.5 + i * 50, 35);
		
		draw.strokeRect(10 + i * 50, 510, 35, 35);
		draw.fillText(i + "", 27.5 + i * 50, 535);
		
		draw.strokeStyle = "#007";
		draw.beginPath();
		for (var j = 0; j < neurons[i].outputs.length; j++)
		{
			draw.moveTo(10 + i * 50 + 17.5, 45);
			draw.lineTo((neurons[i].outputs[j]) * 50 + 27.5, 510);
		}
		draw.stroke();
		draw.strokeStyle = "#000";
		draw.beginPath();
		for (var j = 0; j < neurons[i].inputs.length; j++)
		{
			draw.moveTo(10 + i * 50 + 17.5, 27.5);
			draw.lineTo((neurons[i].inputs[j]) * 50 + 27.5, 527.5);
		}
		draw.stroke();
	}
	
	return canv.toDataURL("image/png");
}

var checkingImages;

function checkImage(i)
{
	var image = new Image();
	image.src = checkingImages[i];
	image.onload = function()
	{
		var ni = document.getElementById("networkimage");
		while (ni.hasChildNodes())
			ni.removeChild(ni.lastChild);
		
		ni.appendChild(image);
	};
}*/