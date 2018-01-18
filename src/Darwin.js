//TODO thorough documentation

class Gene {
	constructor(value) {
		this.value = value;
	}

	setValue(value) {
		this.value = value;
	}

	duplicate() {
		return new Gene(this.value);
	}
}

// Functions as a template class
class Chromosome {
	constructor(length, fitness, age, genes, isBinary) {
		this.length   = length   || 0;
		this.fitness  = fitness  || 0;
		this.age      = age      || 0;
		this.genes    = genes    || [];
		this.isBinary = isBinary || false;
	}

	getFitness() {
		return this.fitness;
	}

	setFitness(fitness) {
		this.fitness = fitness;
	}

	// Template for generation
	generate() { }

	// Template function for conversion to binary
	toBinary() { }

	// Template function for conversion from binary
	fromBinary() { }

	// Returns all the gene values in a string format
	toString() {
		let str = '';

		if(this.genes.length == 0)
			throw 'Array Not Generated';

		for(let i = 0; i < this.length; i++) {
			str += this.genes[i].value.toString();
		}

		return str;
	}

	// Returns all the gene values in an array format
	toArray() {
		let arr = [];

		if(this.genes.length == 0)
			throw 'Array Not Generated';

		for(let i = 0; i < this.length; i++) {
			arr.push(this.genes[i].value);
		}

		return arr;
	}

	getGenes() { 
		return this.genes;
	}

	setGenes(genes) { 
		this.genes = genes;
	}

	getValues() {
		let vals = [];

		for(let i = 0; i < this.genes.length; i++) {
			vals.push(this.genes[i].value);
		}

		return vals;
	}

	setValues(arr) {
		let jeans = [];

		for(let i = 0; i < arr.length; i++) {
			let jean = new Gene(arr[i]);
			jeans.push(jean);
		}

		this.genes = jeans;
	}

	duplicate() { 
		return new Chromosome(this.length, this.fitness, this.age, this.genes, this.isBinary);
	}
}

class Population {
	constructor(size, chromosomes) {
		this.size        = size        || 0;
		this.chromosomes = chromosomes || [];
	}

	generate(chromosome, params) {
		this.chromosomes = [];

		for(let i = 0; i < this.size; i++) {
			let c = chromosome.duplicate();
				c.generate.apply(c, params);
			this.chromosomes.push(c.duplicate());
		}
	}

	duplicate() {
		return new Population(this.size, this.chromosomes);
	}

	toBinary() {
		let chromosomes = [];

		for(let i = 0; i < this.chromosomes.length; i++) {
			chromosomes.push(this.chromosomes[i].duplicate());

			// TODO Fore some reason this half works
			//if(!chromosomes[i].isBinary)
				chromosomes[i].toBinary();
		}

		this.chromosomes = chromosomes;
	}

	fromBinary() {
		let chromosomes = [];

		for(let i = 0; i < this.chromosomes.length; i++) {
			chromosomes.push(this.chromosomes[i].duplicate());

			// TODO For some reason this doesn't work
			//if(chromosomes[i].isBinary)
				chromosomes[i].fromBinary();
		}

		this.chromosomes = chromosomes;
	}

	// Returns top fitness value in population
	topFitness() {
		let top = this.chromosomes[0].fitness;

		for(let c of this.chromosomes) {
			let val = c.fitness;
			top = val > top ? val : top;
		}

		return top;
	}

	lowestFitness() {
		let low = this.chromosomes[0].fitness;

		for(let c of this.chromosomes) {
			let val = c.fitness;
			low = val < low ? val : low;
		}

		return low;
	}

	// Returns the highest fitness chromosome in population
	topIndividual() {
		let topIndividual = this.chromosomes[0];

		for(let c of this.chromosomes) {
			topIndividual = c.fitness > topIndividual.fitness ? c : topIndividual;
		}

		return topIndividual.duplicate();
	}

	lowestIndividual() {
		let lowestIndividual = this.chromosomes[0];

		for(let c of this.chromosomes) {
			lowestIndividual = c.fitness < lowestIndividual.fitness ? c : lowestIndividual;
		}

		return lowestIndividual.duplicate();
	}

	addChromosome(chromosome) {
		this.chromosomes.push(chromosome);
	}

	setChromosomes(chromosomes) {
		this.chromosomes = chromosomes;
	}

	getChromosomes(chromosomes) {
		return this.chromosomes;
	}

	// Returns all genes for the current generation in a nested form
	getGenes() {
		let geneList = [];

		for(let c of this.chromosomes) {
			let jeans = [];

			for(let g of c.genes) {
				jeans.push(g);
			}

			geneList.push(jeans);
		}

		return geneList;
	}

	// Returns all genes for the current generation but in a flat array rather than nested
	getGenesFlat() {
		let jeans = [];

		for(let c of this.chromosomes) {
			for(let g of c.genes) {
				jeans.push(g);
			}
		}

		return jeans;
	}

	// Returns all the gene values for the current generation in a nested form
	getGeneValues() {
		let jeans = [];

		for(let c of this.chromosomes) {
			let jean = [];

			for(let g of c.genes) {
				jean.push(g.value);
			}

			jeans.push(jean);
		}

		return jeans;
	}

	// Returns all the gene values for the current generation in a flat array rather than nested
	getGeneValuesFlat() {
		let jeans = [];

		for(let c of this.chromosomes) {
			for(let g of c.genes) {
				jeans.push(g.value);
			}
		}

		return jeans;
	}
}

class BitChromosome extends Chromosome {
	constructor(length, fitness, age, genes) {
		super(length, fitness, age, genes);

		this.isBinary = true;
	}	

	generate() {
		this.genes = [];

		for(let i = 0; i < this.length; i++) {
			let value = Math.floor(Math.random() * 2);
			this.genes.push(new Gene(value));
		}
	}

	duplicate() {
		return new BitChromosome(this.length, this.fitness, this.age, this.genes);
	}

	toBinary() {
		//return new BitChromosome(this.fitness, this.age, this.length, this.genes);
	}

	fromBinary() {
		//return new BitChromosome(this.fitness, this.age, this.length, this.genes);
	}
}

class CharChromosome extends Chromosome {
	constructor(characterSet, length, fitness, age, genes) {
		super(length, fitness, age, genes);

		this.characterSet = characterSet || '';
	}

	// Characterset parameter is optional if you set it in the constructor
	generate(characterSet) {
		this.characterSet = characterSet || this.characterSet;

		this.genes = [];

		for(let i = 0; i < this.length; i++) {
			let randomNum = Math.floor(Math.random() * (this.characterSet.length));
			let value     = this.characterSet.charAt(randomNum);

			this.genes.push(new Gene(value));
		}
	}

	duplicate() {
		return new CharChromosome(this.characterSet, this.length, this.fitness, this.age, this.genes);
	}

	toBinary() {
		let maxBitLength = (this.characterSet.length - 1).toString(2).length;

		let jeans = [];

		for(let i = 0; i < this.genes.length; i++) {
			let value = this.genes[i].value;
				value = (this.characterSet.indexOf(value)).toString(2);

			let padding = '0'.repeat(maxBitLength - value.length);
			value = padding.toString() + value.toString();

			jeans.push(new Gene(value));
		}

		this.isBinary = true;
		this.genes    = jeans;
	}

	fromBinary() {
		let jeans = [];

		for(let i = 0; i < this.genes.length; i++) {
			let value = this.genes[i].value;
				value = parseInt(value, 2);

			if(value > this.characterSet.length - 1)
				value = this.characterSet.length - 2;

			value = this.characterSet.charAt(value);

			jeans.push(new Gene(value));
		}

		this.isBinary = false;
		this.genes    = jeans;
	}
}

class IntChromosome extends Chromosome {
	constructor(clamp, lowerBound, upperBound, length, fitness, age, genes) {
		super(length, fitness, age, genes);
		
		this.clamp = clamp || false;

		this.lowerBound = lowerBound || -1;
		this.upperBound = upperBound || 1;

		if(this.lowerBound > this.upperBound)
			[this.lowerBound, this.upperBound] = [this.upperBound, this.lowerBound];
	}

	// Lower and upper boundaries are optional if declared in constructor
	generate(lowerBound, upperBound) {
		this.lowerBound = lowerBound || this.lowerBound;
		this.upperBound = upperBound || this.upperBound;

		if(this.lowerBound > this.upperBound)
			[this.lowerBound, this.upperBound] = [this.upperBound, this.lowerBound];

		this.genes = [];

		for(let i = 0; i < this.length; i++) {
			let value = Math.floor(Math.random() * (this.upperBound + 1 - this.lowerBound) + this.lowerBound);

			this.genes.push(new Gene(value));
		}
	}

	duplicate() {
		return new IntChromosome(this.clamp, this.lowerBound, this.upperBound, this.length, this.fitness, this.age, this.genes);
	}

	toBinary() {
		let jeans = [];

		for(let i = 0; i < this.genes.length; i++) {
			let value = this.genes[i].value;
				value = Covington._flt2bin(value, 32);

			jeans.push(new Gene(value));
		}

		this.isBinary = true;
		this.genes    = jeans;
	}

	fromBinary() {
		let jeans = [];

		for(let i = 0; i < this.genes.length; i++) {
			let value = this.genes[i].value;
				value = Math.floor(Covington._bin2flt(value, 32));
		
			if(value < this.lowerBound && this.clamp)
				value = this.lowerBound;

			if(value > this.upperBound && this.clamp)
				value = this.upperBound;

			jeans.push(new Gene(value));
		}

		this.isBinary = false;
		this.genes    = jeans;
	}
}


class FloatChromosome extends Chromosome {
	constructor(clamp, lowerBound, upperBound, length, fitness, age, genes) {
		super(length, fitness, age, genes);
		
		this.clamp = clamp || false;

		this.lowerBound = lowerBound || -1;
		this.upperBound = upperBound || 1;

		if(this.lowerBound > this.upperBound)
			[this.lowerBound, this.upperBound] = [this.upperBound, this.lowerBound];
	}

	// Lower and upper boundaries are optional if declared in constructor
	generate(lowerBound, upperBound) {
		this.lowerBound = lowerBound || this.lowerBound;
		this.upperBound = upperBound || this.upperBound;

		if(this.lowerBound > this.upperBound)
			[this.lowerBound, this.upperBound] = [this.upperBound, this.lowerBound];

		this.genes = [];

		for(let i = 0; i < this.length; i++) {
			let value = Math.random() * (this.upperBound + 1 - this.lowerBound) + this.lowerBound;

			this.genes.push(new Gene(value));
		}
	}

	duplicate() {
		return new DoubleChromosome(this.clamp, this.lowerBound, this.upperBound, this.length, this.fitness, this.age, this.genes);
	}

	toBinary() {
		let jeans = [];

		for(let i = 0; i < this.genes.length; i++) {
			let value = this.genes[i].value;
				value = Covington._flt2bin(value, 32);

			jeans.push(new Gene(value));
		}

		this.isBinary = true;
		this.genes    = jeans;
	}

	fromBinary() {
		let jeans = [];

		for(let i = 0; i < this.genes.length; i++) {
			let value = this.genes[i].value;
				value = Covington._bin2flt(value, 32);
		
			if(value < this.lowerBound && this.clamp)
				value = this.lowerBound;

			if(value > this.upperBound && this.clamp)
				value = this.upperBound;

			jeans.push(new Gene(value));
		}

		this.isBinary = false;
		this.genes    = jeans;
	}
}

class DoubleChromosome extends Chromosome {
	constructor(clamp, lowerBound, upperBound, length, fitness, age, genes) {
		super(length, fitness, age, genes);
		
		this.clamp = clamp || false;

		this.lowerBound = lowerBound || -1;
		this.upperBound = upperBound || 1;

		if(this.lowerBound > this.upperBound)
			[this.lowerBound, this.upperBound] = [this.upperBound, this.lowerBound];
	}

	// Lower and upper boundaries are optional if declared in constructor
	generate(lowerBound, upperBound) {
		this.lowerBound = lowerBound || this.lowerBound;
		this.upperBound = upperBound || this.upperBound;

		if(this.lowerBound > this.upperBound)
			[this.lowerBound, this.upperBound] = [this.upperBound, this.lowerBound];

		this.genes = [];

		for(let i = 0; i < this.length; i++) {
			let value = Math.random() * (this.upperBound + 1 - this.lowerBound) + this.lowerBound;

			this.genes.push(new Gene(value));
		}
	}

	duplicate() {
		return new DoubleChromosome(this.clamp, this.lowerBound, this.upperBound, this.length, this.fitness, this.age, this.genes);
	}

	toBinary() {
		let jeans = [];

		for(let i = 0; i < this.genes.length; i++) {
			let value = this.genes[i].value;
				value = Covington._flt2bin(value, 64);

			jeans.push(new Gene(value));
		}

		this.isBinary = true;
		this.genes    = jeans;
	}

	fromBinary() {
		let jeans = [];

		for(let i = 0; i < this.genes.length; i++) {
			let value = this.genes[i].value;
				value = Covington._bin2flt(value, 64);
		
			if(value < this.lowerBound && this.clamp)
				value = this.lowerBound;

			if(value > this.upperBound && this.clamp)
				value = this.upperBound;

			jeans.push(new Gene(value));
		}

		this.isBinary = false;
		this.genes    = jeans;
	}
}

// TODO Complete this. Necessary for a traveling salesman problem
class PermutationsChromosome extends Chromosome {

}

// TODO Complete this too
class TreeChromosome extends Chromosome {

}

class Darwin {
	constructor(template, genParams, popSize, mutationRate, mutationRange, crossoverRate, elitism, newChromosomes, noBinary, fittest, population) {
		this.template  = template  || new BitChromosome(5); // Serves as a reference for future population generation
		this.genParams = genParams || [];                   // Parameters used for generation

		this.popSize        = popSize        || 50;    // Dictates population size
		this.mutationRate   = mutationRate   || 0.2;   // Dictates rate of mutation
		this.mutationRange  = mutationRange  || 0.5;   // Dictates range of mutation (only used in Arithmetic mutations at this point)
		this.crossoverRate  = crossoverRate  || 0.9;   // Dictates rate of crossover
		this.elitism        = elitism        || 0.1;   // Dictates the percent of the highest fitness individuals which are guaranteed to go to the next generation
		this.newChromosomes = newChromosomes || 0.1;   // Dictates the percent of new chromosomes injected into the next generation
		this.noBinary       = noBinary       || false; // Dictates whether chromosomes are converted to binary during the mutation/crossover process
	
		this.fittest = fittest || Covington.fittest.biggerIsBetter; // Determines how fittest is considered

		this.population = population || null; // The population

		this.history = []; // A history of populations

		this.selection = Covington.selection.RouletteWheel;
		this.crossover = Covington.crossover.TwoPoint;
		this.mutation  = Covington.mutation.BitFlip;
	}

	// Parameters not needed if declared in constructor
	newPopulation(template, genParams) {
		this.template  = template  || this.template;
		this.genParams = genParams || this.genParams;

		let pop = new Population(this.popSize);
			pop.generate(this.template.duplicate(), this.genParams);
		//console.log(this.template);

	
		this.population = pop;
	}

	nextGeneration() {
		// Sort current population by fitness
		this.population.chromosomes.sort(this.fittest);
	
		// Push to history for safekeeping
		this.history.push(this.population);

		let pop = this.population.duplicate();
			pop.chromosomes.sort(this.fittest);

		if(!this.noBinary) {
			pop.toBinary();
		}
		
		let elitistCount;    // Number of chromosomes at the top which will be kept
		let freshCount;      // Number of fresh chromosomes to be inserted into the population
		let operationCount;  // Number of chromosomes which will have mutations/crossovers
		let crossCount;      // Number of chromosomes which will be crossed over. Must be even because of how crossovers are done
		let plebCount;       // Number of chromosomes which won't be touched at all and inserted back into the new population

		elitistCount   = Math.floor(this.elitism        * pop.chromosomes.length);
		freshCount     = Math.floor(this.newChromosomes * pop.chromosomes.length);
		operationCount = pop.chromosomes.length - (elitistCount + freshCount);
		crossCount     = Math.round(operationCount * this.crossoverRate);
		crossCount     = (crossCount % 2) == 0 ? crossCount : crossCount - 1;
		plebCount      = operationCount - crossCount;

		// console.log("Elitist Count:   " + elitistCount);
		// console.log("Fresh Count:     " + freshCount);
		// console.log("Operation Count: " + operationCount);
		// console.log("Crossover Count: " + crossCount);
		// console.log("Pleb Count:      " + plebCount);

		let totalChromosomes   = [];
		let elitistChromosomes = [];
		let freshChromosomes   = [];
		let crossedChromosomes = [];
		let plebChromosomes    = [];

		// Elitist genes
		for(let i = 0; i < elitistCount; i++) {
			elitistChromosomes.push(pop.chromosomes[0].duplicate());
		}

		// Fresh genes
		let fresh = new Population(freshCount);
			fresh.generate(this.template.duplicate(), this.genParams);
		if(!this.noBinary)	
			fresh.toBinary();
		freshChromosomes = fresh.chromosomes;


		// Select for crossing
		let toBeCrossed = this.selection.apply(this, [pop.chromosomes, crossCount]);
		
		// Cross 'em
		for(let i = 0; i < toBeCrossed.length; i += 2) {
			let children = this.crossover.apply(this, [toBeCrossed[i].duplicate(), toBeCrossed[i + 1].duplicate()]);
			crossedChromosomes.push(children[0]);
			crossedChromosomes.push(children[1]);
		}

		// Poor surviving chromosomes that aren't crossed over :(
		plebChromosomes = this.selection.apply(this, [pop.chromosomes, plebCount]);

		totalChromosomes = crossedChromosomes.concat(plebChromosomes);

		// console.log(totalChromosomes.length)

		// for(let totes of totalChromosomes) {
		// 	console.log(totes.toString());
		// }

		if(!this.noBinary)
			totalChromosomes = this.mutation.apply(this, [totalChromosomes, this.mutationRate]);
		else
			totalChromosomes = this.mutation.apply(this, [totalChromosomes, this.mutationRate, this.mutationRange]);

		// for(let totes of totalChromosomes) {
		// 	console.log(totes.toString());
		// }

		totalChromosomes = totalChromosomes.concat(elitistChromosomes, freshChromosomes);

		//console.log(totalChromosomes);
		for(let i = 0; i < totalChromosomes.length; i++) {
			totalChromosomes[i].setFitness(0);
		}

		let newPop = new Population(pop.size, totalChromosomes);	
		if(!this.noBinary)
			newPop.fromBinary();

		this.population = newPop;
	}

	getPopulation() {
		return this.population;
	}

	setPopulation(population) {
		this.population = population;
	}

	getHistory() {
		return this.history;
	}
}

// Context: Covington was Darwin's assistant
let Covington = {
	fittest: {
		sizeDoesntMatter(a, b) {
			return a.fitness - b.fitness;
		},

		biggerIsBetter(a, b) {
			return b.fitness - a.fitness;
		}
	},

	selection: {
		RouletteWheel(chromosomes, num) {
			let selections = [];

			let totalFitness = 0;
			for(let i = 0; i  < chromosomes.length; i++) {
				totalFitness += chromosomes[i].fitness;
			}

			while(selections.length < num) {
				let goal = Math.random() * totalFitness;

				let sum = 0;
				for(let j = 0; j < chromosomes.length; j++) {
					sum += chromosomes[j].fitness;

					if(sum >= goal) {
						selections.push(chromosomes[j].duplicate());
						break;
					}
				}
			}

			return selections;
		},

		Rank(chromosomes, num) {
			let selections = [];

			let totalRank = 0;
			for(let i = 0; i  < chromosomes.length; i++) {
				totalRank += chromosomes.length - i;
			}

			while(selections.length < num) {
				let goal = Math.random() * totalRank;

				let sum = 0;
				for(let j = 0; j < chromosomes.length; j++) {
					sum += chromosomes.length - j;

					if(sum >= goal) {
						selections.push(chromosomes[j].duplicate());
						break;
					}
				}
			}

			return selections;
		},

		Top(chromosomes, num) {
			let selections = [];

			for(let i = 0; i < num; i++) {
				selections.push(chromosomes[i].duplicate());
			}

			return selections;
		},

		Random(chromosomes, num) {
			let selections = [];

			for(let i = 0; i < num; i++) {
				let random = Math.floor(Math.random() * chromosomes.length);
				selections.push(chromosomes[random].duplicate());
			}

			return selections;
		}
	},

	crossover: {
		SinglePoint(parent1, parent2) {
			let child1 = parent1.duplicate();
			let child2 = parent2.duplicate();

			let crossoverPoint = Math.floor(Math.random() * parent1.length);

			child1.setValues(parent1.getValues().slice(0, crossoverPoint).concat(parent2.getValues().slice(crossoverPoint)));
			child2.setValues(parent2.getValues().slice(0, crossoverPoint).concat(parent1.getValues().slice(crossoverPoint)));

			return [child1, child2];
		},

		TwoPoint(parent1, parent2) {
			let child1 = parent1.duplicate();
			let child2 = parent2.duplicate();

			let crossoverPoint1 = Math.floor(Math.random() * parent1.length);
			let crossoverPoint2 = Math.floor(Math.random() * parent2.length);

			if(crossoverPoint1 > crossoverPoint2)
				[crossoverPoint1, crossoverPoint2] = [crossoverPoint2, crossoverPoint1];

			child1.setValues(parent1.getValues().slice(0, crossoverPoint1).concat(parent2.getValues().slice(crossoverPoint1, crossoverPoint2 - crossoverPoint1), parent1.getValues().slice(crossoverPoint2)));
			child2.setValues(parent2.getValues().slice(0, crossoverPoint1).concat(parent1.getValues().slice(crossoverPoint1, crossoverPoint2 - crossoverPoint1), parent2.getValues().slice(crossoverPoint2)));

			return [parent1, parent2];
		},

		SinglePointBinary(parent1, parent2) {
			let child1;
			let child2;

			let geneLength;
			let chromosomeLength;
			let crossoverPoint;

			geneLength = parent1.genes[0].value.length;

			parent1String = parent1.toString();
			parent2String = parent2.toString();

			chromosomeLength = parent1String.toString();

			crossoverPoint = Math.floor(Math.random() * chromosomeLength);

			child1 = parent1String.substr(0, crossoverPoint) + parent2String.substr(crossoverPoint);
			child2 = parent2String.substr(0, crossoverPoint) + parent1String.substr(crossoverPoint);

			child1 = child1.match(new RegExp('.{1,' + geneLength + '}', 'g'));
			child2 = child2.match(new RegExp('.{1,' + geneLength + '}', 'g'));

			// let jeans1 = [];
			// let jeans2 = [];
			// for(let i = 0; i < child1.length; i++) {
			// 	jeans1.push(new Gene(child1[i]));
			// 	jeans2.push(new Gene(child2[i]));
			// }

			// parent1.genes = jeans1;
			// parent2.genes = jeans2;

			parent1.setValues(child1);
			parent2.setValues(child2);

			return [parent1, parent2];
		},

		TwoPointBinary(parent1, parent2) {
			let child1;
			let child2;

			let geneLength;
			let chromosomeLength;
			let crossoverPoint1;
			let crossoverPoint2;

			geneLength = parent1.genes[0].value.length;

			parent1String = parent1.toString();
			parent2String = parent2.toString();

			chromosomeLength = parent1String.length;

			crossoverPoint1 = Math.floor(Math.random() * chromosomeLength);
			crossoverPoint2 = Math.floor(Math.random() * chromosomeLength);

			if(crossoverPoint1 > crossoverPoint2)
				[crossoverPoint1, crossoverPoint2] = [crossoverPoint2, crossoverPoint1];

			child1 = parent1String.substr(0, crossoverPoint1) + parent2String.substr(crossoverPoint1, crossoverPoint2 - crossoverPoint1) + parent1String.substr(crossoverPoint2);
			child2 = parent2String.substr(0, crossoverPoint1) + parent1String.substr(crossoverPoint1, crossoverPoint2 - crossoverPoint1) + parent2String.substr(crossoverPoint2);

			child1 = child1.match(new RegExp('.{1,' + geneLength + '}', 'g'));
			child2 = child2.match(new RegExp('.{1,' + geneLength + '}', 'g'));

			// let jeans1 = [];
			// let jeans2 = [];
			// for(let i = 0; i < child1.length; i++) {
			// 	jeans1.push(new Gene(child1[i]));
			// 	jeans2.push(new Gene(child2[i]));
			// }

			// parent1.genes = jeans1;
			// parent2.genes = jeans2;

			parent1.setValues(child1);
			parent2.setValues(child2);

			return [parent1, parent2];
		},

		Uniform(parent1, parent2) {
			let child1 = parent1.getValues();
			let child2 = parent2.getValues();

			let newValue1 = [];
			let newValue2 = [];

			for(let i = 0; i < child1.length; i++) {
				if(Math.random() >= 0.5) {
					newValue1.push(child2[i]);
					newValue2.push(child1[i]);
				} else {
					newValue1.push(child1[i]);
					newValue2.push(child2[i]);
				}
			}

			parent1.setValues(newValue1);
			parent2.setValues(newValue2);

			return [parent1, parent2];
		},

		UniformBinary(parent1, parent2) {
			let child1 = '';
			let child2 = '';

			let geneLength = parent1.genes[0].value.length;

			parent1String = parent1.toString();
			parent2String = parent2.toString();

			for(let i = 0; i < parent1String.length; i++) {
				if(Math.random() >= 0.5) {
					child1 += parent2String[i];
					child2 += parent1String[i];
				} else {
					child1 += parent1String[i];
					child2 += parent2String[i];
				}
			}

			child1 = child1.match(new RegExp('.{1,' + geneLength + '}', 'g'));
			child2 = child2.match(new RegExp('.{1,' + geneLength + '}', 'g'));

			parent1.setValues(child1);
			parent2.setValues(child2);

			return [parent1, parent2];
		},

		// Returns 2 children copies
		ArithmeticBlend(parent1, parent2) {
			let child1 = parent1.getValues();
			let child2 = parent2.getValues();

			let newValues = [];

			for(let i = 0; i < child1.length; i++) {
				newValues.push((child1[i] + child2[i]) / 2);
			}

			parent1.setValues(newValues);
			parent2.setValues(newValues);

			return [parent1, parent2];
		}
	},

	mutation: {
		BitFlip(chromosomes, chance) {
			// for(let i = 0; i < chromosomes.length; i++) {
			// 	console.log(chromosomes[i].toString());
			// }

			//This results in waaaaaaaaaaay too many mutations
			// for(let i = 0; i < chromosomes.length; i++) {
			// 	for(let j = 0; j < chromosomes[i].genes.length; j++) {
			// 		for(let k = 0; k < chromosomes[i].genes[j].value.length; k++) {
			// 			let rand = Math.random();

			// 			if(rand <= chance) {
			// 				let flip = chromosomes[i].genes[j].value[k] == '1' ? 0 : 1;
			// 				chromosomes[i].genes[j].setValue(Covington.charReplace(chromosomes[i].genes[j].value, k, flip.toString()));
						
			// 				//console.log(flip + ', ' + i +':'  + j + ':'+ k);
			// 			}
			// 		}
			// 	}
			// }
			// for(let i = 0; i < chromosomes.length; i++) {

			// 	for(let j = 0; j < chromosomes[i].genes.length; j++) {
			// 		let rand = Math.random();
			// 		if(rand >= chance ) {
			// 			let randPos = Math.floor(Math.random() * chromosomes[i].genes.length);

			// 			let flip = chromosomes[i].genes[j].value[randPos] == '1' ? 0 : 1;
			// 			chromosomes[i].genes[j].setValue(Covington.charReplace(chromosomes[i].genes[j].value, randPos, flip.toString()));
			// 			//console.log(flip + ', ' + i +':'  + j + ':'+ randPos);
			// 		}
			// 	}
			// }

			for(let i = 0; i < chromosomes.length; i++) {
				let rand = Math.random();

				if(rand >= chance) {
					let randGene = Math.floor(Math.random() * chromosomes[i].genes.length);
					let randNum  = Math.floor(Math.random() * chromosomes[i].genes[randGene].length);

					for(let j = 0; j < randNum; j++) {
						let randPos  = Math.floor(Math.random() * chromosomes[i].genes[randGene].length);
						let flip = chromosomes[i].genes[randGene].value[randPos] == '1' ? 0 : 1;
						chromosomes[i].genes[randGene].setValue(Covington.charReplace(chromosomes[i].genes[randGene].value, randPos, flip.toString()));
					}				
				}
			}

			//console.log('-'.repeat(10));

			// for(let i = 0; i < chromosomes.length; i++) {
			// 	console.log(chromosomes[i].toString());
			// }
			return chromosomes;
		},

		Addition(chromosomes, chance, mutationRange) {
			for(let i = 0; i < chromosomes.length; i++) {
				for(let j = 0; j < chromosomes[i].genes.length; j++) {
					//console.log(chromosomes[i].genes[j]);

					let rand = Math.random();

					if(rand <= chance) {
						//console.log("No");

						let value = chromosomes[i].genes[j].value;
						// console.log(value);
						//let randPlus = (Math.random() * (mutationRange + 1 + mutationRange) - mutationRange);
						let randPlus = Math.random() * mutationRange * 2 - mutationRange;
						// console.log(randPlus);
						value = value + randPlus;
						// console.log(value);
						// console.log("--");
						chromosomes[i].genes[j].setValue(value);
					}
					/*for(let k = 0; k < chromosomes[i].genes[j].value.length; k++) {

						let rand = Math.random();

						if(rand <= chance) {
							let value = chromosomes[i].genes[j] + (Math.random() * (mutationRange + 1 + mutationRange) - mutationRange);
							chromosomes[i].genes[j].setValue(value);
						
							console.log("MUTATE ME DADDY");
						}
					}*/
				}
			}

			return chromosomes;
		},

		Multiplication(chromosomes, chance, mutationRange) {
			for(let i = 0; i < chromosomes.length; i++) {
				for(let j = 0; j < chromosomes[i].genes.length; j++) {
					for(let k = 0; k < chromosomes[i].genes[j].value.length; k++) {
						let rand = Math.random();

						if(rand <= chance) {
							let value = chromosomes[i].genes[j] * (Math.random() * (mutationRange + 1 + mutationRange) - mutationRange);
							chromosomes[i].genes[j].setValue(value);
						}
					}
				}
			}

			return chromosomes;
		},

		NoMutate(chromosomes, chance) {
			return chromosomes;
		}
	},

	// Used for copying objects because JS's call-by-sharing but not pass-by-vaule treatment is vexatious
	copy(obj) {
		let copy      = Object.create(Object.getPrototypeOf(obj));
		let propNames = Object.getOwnPropertyNames(obj);

		propNames.forEach(function(name) {
			let desc = Object.getOwnPropertyDescriptor(obj, name);
			Object.defineProperty(copy, name, desc);
		});

		return copy;
	},

	charReplace(string, index, char) {
		return string.substr(0, index) + char + string.substr(index + char.length);
	},

	// Float to binary converter by @nizarmah_
	// I am not responsible for any intraocular melanoma due to looking at his code
	// <3 you nizar
	_convert(string, base) {
 		string = string.toString().trim().split(".");
  		base = +base || 2;

 		return (parseInt(string[0].replace("-", ""), base) + (string[1] || "").split("").reduceRight(function(sum, bit) {
    		return (sum + parseInt(bit, base)) / base;
  		}, 0)) * (+(string[0][0] !== "-") || -1);
	},

	_sniffer(bit) {
		let expSize;

		switch (bit) {
			case 16:
				expSize = 5;
				break;
			case 32:
				expSize = 8;
				break;
			case 64:
				expSize = 11;
				break;
			case 128:
				expSize = 15;
				break;
			case 256:
				expSize = 19;
				break;
			default: return false;
		}

		return { exp: expSize, flt: bit - (expSize + 1), bias: ((Math.pow(2, (expSize - 1))) - 1) };
	},

	_flt2bin(flt, bit) {
		let bin = "";
		let binList;
		bit = bit || 32;

		binSizes = this._sniffer(bit);
			if (!binSizes)
				return false;

		if (flt == Infinity || flt == -Infinity || flt == NaN) {
			if (flt.indexOf("-") > -1)
				bin += "1";
			else bin += "0";

			var pow = "";
			while (pow.length < binSizes.exp)
				pow += "1";
			bin += pow;

			if (flt == NaN)
				bin += "1";
			
			while (bin.length < bit)
				bin += "0";

			return bin;
		} 

		if (flt >= 0)
			bin += "0";
		else bin += "1";

		flt = Math.abs(flt);

		if (!flt.toString().indexOf(".")) {
			binList = [ (flt).toString(2) ];
		} else binList = (flt).toString(2).split(".");

		var exp;
		if (binList[0] != 0) {
			exp = binList[0].length - 1;
		} else {
			if (binList.length > 1) {
				if (binList[1].indexOf("1") > -1) {
					exp = -1 * (binList[1].indexOf("1") + 1);
				} else exp = -binSizes.bias;
			} else exp = -binSizes.bias;
		}

		let expBias = (exp + binSizes.bias).toString(2).split("");
		while (expBias.length < binSizes.exp)
			expBias.unshift("0");
		bin += expBias.toString().replace(/,/g, '');

		if (exp >= 0) {
			bin += binList[0].substr(1, binList[0].length);

			if (binList.length > 1)
				bin += binList[1];
		} else {
			if (binList.length > 1)
				bin += binList[1].substr(Math.abs(exp), binList[1].length);
			else bin += "0";
		}

		if (bin.length >= bit) {
			bin = bin.substr(0, bit);
		} else {
			while (bin.length < bit)
				bin += "0";
		}

		return bin;
	},

	_bin2flt(bin, bit) {
		let binList = bin.split("");
		bit = bit || 32;

		binSizes = this._sniffer(bit);
			if (!binSizes)
				return false;

		let s, e, m;
		for (let i = 0; i < bit; i++) {
			if (i < 1) {
				s = binList[i];
			} else if (i < (binSizes.exp + 1)) {
				if (i == 1) e = binList[i];
				else e += binList[i];
			} else if (i < binList.length) {
				if (i == (binList.length - binSizes.flt)) m = binList[i];
				else m += binList[i];
			}
		}

		if (e.indexOf("0") < 0) {
			if (m.indexOf("1") < 0) {
				if (s == 1)
					return -Infinity;
				else return Infinity;
			} else return NaN;
		}

		if (s == "1") s = "-1";
		else s = "1";

		e = this._convert(e, 2);
		e = e - binSizes.bias;

		m = "1." + m;
		m = this._convert(m, 2);

		return (s * m * Math.pow(2, e));
	}
}