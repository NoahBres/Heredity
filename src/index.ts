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
    populationSize = 50,
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
    this._population.sort();

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