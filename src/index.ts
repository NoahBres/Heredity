import { GenericChromosome } from "./chromosomes";
import Population from "./population";

export default class Darwin {
  private _populationSize: number;
  private _templateChromosome: GenericChromosome<any>;
  private _mutationRate: number;
  private _mutationRange: number;
  private _crossoverRate: number;
  private _elitism: number;
  private _newChromosomes: number;

  // private _selection: (chromosomes: GenericChromosome<any>[], num: number) => GenericChromosome<any>[];
  // private _crossover: (parent1: GenericChromosome<any>, parent2: GenericChromosome<any>) => GenericChromosome<any>[];
  // private _mutation: (chromosomes: GenericChromosome<number>[], chance: number, mutationRange: number) => GenericChromosome<any>[]

  private _history: Population[] = [];

  private _population: Population;

  constructor({
    populationSize,
    templateChromosome,
    mutationRate = 0.2,
    mutationRange = 0.5,
    crossoverRate = 0.9,
    elitism = 0.1,
    newChromosomes = 0.1
  }: ConstructorOptions) {
    this._populationSize = populationSize;
    this._templateChromosome = templateChromosome;
    this._mutationRate = mutationRate;
    this._mutationRange = mutationRange;
    this._crossoverRate = crossoverRate;
    this._elitism = elitism;
    this._newChromosomes = newChromosomes;
  
    this._population = new Population(this._populationSize);
  }

  generatePopulation(): Darwin {
    this._population.generate(this._templateChromosome.duplicate());
    
    return this;
  }

  nextGeneration(): Darwin {
    this._history.push(this._population.duplicate());
    this._population.sort();

    let elitistCount = Math.floor(this._elitism * this._population.size);
		let freshCount = Math.floor(this._newChromosomes * this._population.size);
		let operationCount = this._population.size - (elitistCount + freshCount);
		let crossCount = Math.round(operationCount * this._crossoverRate);
			crossCount = (crossCount % 2) == 0 ? crossCount : crossCount - 1;
		let plebCount = operationCount - crossCount;

		console.log({ elitistCount, freshCount, operationCount, crossCount, plebCount });

		let totalChromosomes = [];
		let elitistChromosomes = [];
		let freshChromosomes = [];
		let crossedChromosomes = [];
		let plebChromosomes = [];

    for(let i = 0; i < elitistCount; i++) {
      elitistChromosomes.push(this._population.chromosomes[i]);
    }

    let fresh = new Population(freshCount);
    fresh.generate(this._templateChromosome.duplicate());
    freshChromosomes = fresh.chromosomes;

    console.log(freshChromosomes);

    // const toBeCrossed = this._se

    return this;
  }

  setFitness(scores: number[] | number, index: number = 0) {
    this._population.setFitness(scores, index);
  }
  
  topChromosome(): TopChromosomeObject {
    return this._population.topChromosome();
  }
  
  lowestChromosome(): TopChromosomeObject {
    return this._population.lowestChromosome();
  }

  getGenes() {
    return this._population.getGenes();
  }

  getGenesFlat() {
    return this._population.getGenesFlat();
  }

  get population(): Population {
    return this._population;
  }

  set population(pop: Population) {
    this._population = pop;
  }

  get chromosomes(): GenericChromosome<any>[] {
    return this._population.chromosomes;
  }
}

interface ConstructorOptions {
  populationSize: number;
  templateChromosome: GenericChromosome<any>;
  mutationRate?: number;
  mutationRange?: number;
  crossoverRate?: number;
  elitism?: number;
  newChromosomes?: number;

  selection?: (
    chromosomes: GenericChromosome<any>[],
    num: number
  ) => GenericChromosome<any>[];
  crossover?: (
    parent1: GenericChromosome<any>,
    parent2: GenericChromosome<any>
  ) => GenericChromosome<any>[];
  mutation?: (
    chromosomes: GenericChromosome<number>[],
    chance: number,
    mutationRange: number
  ) => GenericChromosome<any>[];
}

interface TopChromosomeObject {
  index: number,
  fitness: number,
  chromosome: GenericChromosome<any>
}