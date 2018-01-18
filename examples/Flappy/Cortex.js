/**
* @summary A helper object. Contains functions that can be used by the Perceptron
* @namespace Cortex
* @public
*/
let Cortex = {
	/**
	* @summary object containing activation functions offered by Cortex
	* @namespace Cortext.activation.function
	* @public
	*/
	activation: {
		/**
		* @summary Sigmoid function
		* @function
		* @public
		*
		* @param {Number} x - input
		* @returns {Number} - Returns x passed through a sigmoid equation
		* 
		* @example
		* Cortex.activation.sigmoid(0.5);
		* > 0.622493312018546
		*/
		sigmoid(x) {
			return (1 / (1 + Math.exp(-x)));
		},

		/**
		* @summary Tanh function
		* @function
		* @public
		*
		* @param {Number} x - input
		* @returns {Number} - Returns x passed through a tanh equation
		* 
		* @example
		* Cortex.activation.tanh(0.5);
		* > 0.46211715726000974
		*/
		tanh: function(x) {
			e = Math.exp(2 * x);
			return (e - 1) / (e + 1);
		}
	}
}

class Perceptron {
	/**
	* @summary Create an instance of a Perceptron
	* @name Perceptron
	*
	* @class
	* @public
	* 
	* @param {Function} activation - Activation function
	* @param {Layer} input - Onput layer
	* @param {Layer} hidden - An array of the hidden layers
	* @param {Layer} output - Output layer
	* 
	* @example
	* let perceptron = new Perceptron(Cortext.activation.sigmoid, new Layer(2), [new Layer(2)], new Layer(1));
	* 
	* // or
	*
	* let perceptron = new Perceptron();
	* perceptron.activation = Cortext.activation.sigmoid;
	* perceptron.inputLayer = new Layer(2);
	* perceptron.hiddenLayer = [new Layer(2), new Layer(2)];
	* perceptron.outputLayer = new Layer(2);
	*/
	constructor(activation, input, hidden, output) {
		this.activation  = activation || Cortex.activation.sigmoid;
		this.inputLayer  = input      || new Layer(1);
		this.hiddenLayer = hidden     || [new Layer(1)];
		this.outputLayer = output     || new Layer(1);
	
		this.layers = [];
	}

	/**
	* @summary Generate a perceptron
	* @method
	* @public
	* 
	* @example
	* let perceptron = new Perceptron(Cortext.activation.sigmoid, new Layer(2), [new Layer(2)], new Layer(1));
	* perceptron.generate();
	*/
	generate() {
		this.inputLayer.init(0);

		this.hiddenLayer[0].init(this.inputLayer.neuronCount);
		for(let i = 1; i < this.hiddenLayer.length; i++) {
			this.hiddenLayer[i].init(this.hiddenLayer[i - 1].neuronCount);
		}

		this.outputLayer.init(this.hiddenLayer[this.hiddenLayer.length - 1].neuronCount);
	
		this.layers = this.layers.concat(this.inputLayer, this.hiddenLayer, this.outputLayer);
	}

	/**
	* @summary Propagate the network
	* @method
	* @public
	* 
	* @param {Number[]} Array of numbers for the input neurons
	* @returns {Number[]} Returns the values for the output neurons
	* 
	* @example
	* let perceptron = new Perceptron(Cortext.activation.sigmoid, new Layer(2), [new Layer(2)], new Layer(1));
	* perceptron.generate();
	* perceptron.activate();
	* > [0.25345]
	*/
	activate(inputs) {
		for(let i in inputs) {
			this.layers[0].neurons[i].value = inputs[i];
		}

		let previousLayer = 0;
		for(let i = 1; i < this.layers.length; i++) {
			for(let j = 0; j < this.layers[i].neurons.length; j++) {
				let sum = 0;

				for(let k = 0; k < this.layers[previousLayer].neurons.length; k++) {
					sum += this.layers[previousLayer].neurons[k].value * this.layers[i].neurons[j].weights[k];
				}

				this.layers[i].neurons[j].value = this.activation(sum);
			}

			previousLayer = i;
		}

		let output = [];
		let lastLayer = this.layers[this.layers.length - 1];
		for(let i in lastLayer.neurons) {
			output.push(lastLayer.neurons[i].value);
		}

		return output;
	}

	/**
	* @summary Get the neuron values
	* @method
	* @public
	* 
	* @returns {Number[]} Returns the values for all the neurons in an array
	* 
	* @example
	* let perceptron = new Perceptron(Cortext.activation.sigmoid, new Layer(2), [new Layer(2)], new Layer(1));
	* perceptron.generate();
	* perceptron.activate();
	* let values = perceptron.getNeuronValues();
	* > [0.25345, 0.3456345, 0.76356, 0.653456, 0.76356, 0.6435]
	*/
	getNeuronValues() {
		let output = [];

		for(let i = 0; i < this.layers.length; i++) {
			for(let j = 0; j < this.layers[i].neurons.length; j++) {
				output.push(this.layers[i].neurons[j].value);
			}
		}

		return output;
	}

	/**
	* @summary Set the neuron values. Probably shouldn't be used unless you want to manually change values
	* @method
	* @public
	* 
	* @param {Number[]} Array of numbers for the neurons
	* 
	* @example
	* let perceptron = new Perceptron(Cortext.activation.sigmoid, new Layer(2), [new Layer(2)], new Layer(1));
	* perceptron.generate();
	* perceptron.activate();
	* perceptron.setNeuronValues([0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
	*/
	setNeuronValues(input) {
		let count = 0;

		for(let i = 0; i < this.layers.length; i++) {
			for(let j = 0; j < this.layers[i].neurons.length; j++) {
				this.layers[i].neurons[j].value = input[count];
				count++;
			}
		}
	}

	/**
	* @summary Get neuron weights
	* @method
	* @public
	* 
	* @returns {Number[]} Returns the weights
	* 
	* @example
	* let perceptron = new Perceptron(Cortext.activation.sigmoid, new Layer(2), [new Layer(2)], new Layer(1));
	* perceptron.generate();
	* perceptron.activate();
	* let weights = perceptron.getWeights();
	* > [0.5, 0.5, 0.5, 0.5]
	*/
	getWeights() {
		let output = [];

		for(let i = 0; i < this.layers.length; i++) {
			for(let j = 0; j < this.layers[i].neurons.length; j++) {
				for(let k = 0; k < this.layers[i].neurons[j].weights.length; k++) {
					output.push(this.layers[i].neurons[j].weights[k]);
				}
			}
		}

		return output;
	}

	/**
	* @summary Set weights for the perceptron
	* @method
	* @public
	* 
	* @param {Number[]} Array of numbers for the weights
	* 
	* @example
	* let perceptron = new Perceptron(Cortext.activation.sigmoid, new Layer(2), [new Layer(2)], new Layer(1));
	* perceptron.generate();
	* perceptron.activate();
	* perceptron.setWeights([0.5, 0.5, 0.5, 0.5]);
	*/
	setWeights(input) {
		let count = 0;

		for(let i = 1; i < this.layers.length; i++) {
			for(let j = 0; j < this.layers[i].neurons.length; j++) {
				for(let k = 0; k < this.layers[i].neurons[j].weights.length; k++) {
					this.layers[i].neurons[j].weights[k] = input[count];
					count++;
				}
			}
		}
	}
}

class Layer {
	/**
	* @summary Layer of neurons
	* @name Layer
	*
	* @class
	* @private
	* 
	* @param {Number} neuronCount - Number of neurons in the layer
	* @param {Array} neurons - Array of Neurons the manually set the Layer
	*/
	constructor(neuronCount, neurons) {
		this.neuronCount = neuronCount || 0;
		this.neurons     = neurons     || [];
	}

	/**
	* @summary Initialize the layer
	* @method
	* @private
	* 
	* @param {Number[]} Array of inputs for the weight connections
	*/
	init(inputs) {
		this.neurons = [];

		for(let i = 0; i < this.neuronCount; i++) {
			let n = new Neuron();
				n.gen(inputs);

			this.neurons.push(n);
		}
	}
}

class Neuron {
	/**
	* @summary A single Neuron
	* @name Neuron
	*
	* @class
	* @private
	* 
	* @param {Number} value - Value of the neuron
	* @param {Array} weights - Array of weights to set the neuron connections
	*/
	constructor(value, weights) {
		this.value   = value   || 0;
		this.weights = weights || [];
	}

	/**
	* @summary Generate a neuron with a random value between -1 and 1
	* @method
	* @private
	* 
	* @param {Number} Number of weights to generate
	*/
	gen(weights) {
		this.weights = [];

		for(let i = 0; i < weights; i++) {
			this.weights.push(Math.random() * 2 - 1);
		}
	}
}