import { GenericChromosome } from './chromosomes'

export default class Darwin {
  private _populationSize: number;
  private _templateChromosome: GenericChromosome<any>;
  // private _templateChromosome:

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