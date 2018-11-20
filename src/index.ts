import { GenericChromosome } from './chromosomes'

export default class Darwin {
  private _populationSize: number;
  private _templateChromosome: GenericChromosome<any>;
  // private _mutationRate: number;
	// private _mutationRange: number;
	// private _crossoverRate: number;
	// private _elitism: number;
	// private _newChromosomes: number;

  // private _selection: (chromosomes: GenericChromosome<any>[], num: number) => GenericChromosome<any>[];
	// private _crossover: (parent1: GenericChromosome<any>, parent2: GenericChromosome<any>) => GenericChromosome<any>[];
	// private _mutation: (chromosomes: GenericChromosome<number>[], chance: number, mutationRange: number) => GenericChromosome<any>[]

	// private _history: Population[] = [];

	// private _population: Population;

  constructor({
    populationSize = 50,
    templateChromosome
  }: ConstructorOptions) {
    this._populationSize = populationSize;
    this._templateChromosome = templateChromosome
  }
}

interface ConstructorOptions {
  populationSize: number,
  templateChromosome: GenericChromosome<any>,
  mutationRate?: number,
  mutationRange?: number,
  crossoverRate?: number,
  elitism?: number,
  
  selection?: (chromosomes: GenericChromosome<any>[], num: number) => GenericChromosome<any>[],
	crossover?: (parent1: GenericChromosome<any>, parent2: GenericChromosome<any>) => GenericChromosome<any>[],
	mutation?: (chromosomes: GenericChromosome<number>[], chance: number, mutationRange: number) => GenericChromosome<any>[]

}