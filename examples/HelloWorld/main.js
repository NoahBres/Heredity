let d;
let characterSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 123456789!';
let output      = document.getElementById('output');

let count        = 0;
let lastSolution = '';
let compare      = '';

document.getElementById("textInput").value = "Hello World!";
document.getElementById("solve").addEventListener("click", function(event) {
	event.preventDefault();
	solveThing();
});

function compareAndHighlight(input, compare) {
	input = input.split("");
	for(let i = 0; i < input.length; i++) {
		if(input[i] != compare.charAt(i))
			input[i] = "<span class='red'>" + input[i] + "</span>";
	}

	return input.join("");
}

function fitnessFunction(string1, string2) {
	let total = 0;

	for(let i = 0; i < string1.length; i++) {
		if(string1[i] == string2[i])
			total += 1;

		total += (Math.abs(characterSet.indexOf(string1[i]) - characterSet.indexOf(string2[i]), 2)) / characterSet.length;
	}

	return total;
}

function solveThing() {
	count = 0;

	document.getElementById("found").className = "description";
	compare = document.getElementById("textInput").value;

	d           = new Darwin();
	d.template  = new CharChromosome(characterSet, compare.length);
	d.genParams = [];

	d.popSize        = document.getElementById('pop-size').value;
	d.mutationRate   = document.getElementById('mutation-rate').value;
	d.crossoverRate  = document.getElementById('crossover-rate').value;
	d.elitism        = document.getElementById('elitism').value;
	d.newChromosomes = document.getElementById('new-chromosomes').value;
	d.noBinary       = document.getElementById('to-binary').checked;
	d.fittest        = Covington.fittest.biggerIsBetter;

	switch(document.querySelector('input[name="selection"]:checked').value) {
		case 'roulette-selection':
			d.selection = Covington.selection.RouletteWheel;
			break;
		case 'rank-selection':
			d.selection = Covington.selection.Rank;
			break;
		default:
			d.selection = Covington.selection.RouletteWheel;
			break;
	}

	switch(document.querySelector('input[name="crossover"]:checked').value) {
		case 'singlepoint-crossover':
			d.crossover = Covington.crossover.SinglePoint;
			break;
		case 'twopoint-crossover':
			d.crossover = Covington.crossover.TwoPoint;
			break;
		case 'uniform-crossover':
			d.crossover = Covington.crossover.Uniform;
			break;
		default:
			d.crossover = Covington.crossover.Uniform;
			break;
	}
	d.mutation  = Covington.mutation.BitFlip;
	switch(document.querySelector('input[name="mutation"]:checked').value) {
		case 'bitflip-mutation':
			d.mutation = Covington.mutation.BitFlip;
			break;
		case 'no-mutation':
			d.mutation = Covington.mutation.NoMutate;
			break;
		default:
			d.mutation = Covington.mutation.BitFlip;
			break;
	}

	d.newPopulation();

	output.innerHTML = "";

	loop();

	console.log("Solution found");
}

function loop() {
	let values   = d.getPopulation().getGeneValues();
	let combined = [];
	for(let i = 0; i < values.length; i++) {
		combined.push(values[i].join(""));
	}

	for(let i = 0; i < combined.length; i++) {
		d.getPopulation().getChromosomes()[i].setFitness(fitnessFunction(compare, combined[i]));
	}

	// console.log(d.getPopulation().topFitness());
	// console.log(d.getPopulation().topIndividual().toString());

	if(!(d.getPopulation().topIndividual().toString() == compare)) {
		if(d.getPopulation().topIndividual().toString() != lastSolution) {
			console.log('Gen ' + count + ' (Fit ' + d.getPopulation().topFitness() + '): ' + d.getPopulation().topIndividual().toString());
			output.insertAdjacentHTML('afterbegin', '<tr><td>#' + count + '</td><td>' + d.getPopulation().topFitness() + '</td><td>' + compareAndHighlight(d.getPopulation().topIndividual().toString(), compare) +'</td></tr>');
			lastSolution = d.getPopulation().topIndividual().toString();
		}

		d.nextGeneration();
		count++;
		setTimeout(loop, 5);
	} else {
		output.insertAdjacentHTML('afterbegin', '<tr><td>#' + count + '</td><td>' + d.getPopulation().topFitness() + '</td><td>' + d.getPopulation().topIndividual().toString() +'</td></tr>');
		document.getElementById("found").className = "description found";
		console.log("Solution Found! Took " + count + " generations.");
	}
}