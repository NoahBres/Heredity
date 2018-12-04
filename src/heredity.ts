import { GenericChromosome } from "./chromosomes";
import Population from "./Population";
import { rankSelect } from "./selections";
import { uniformCross } from "./crossovers";
import { noMutate } from "./mutations";

export default class Heredity {
  private _populationSize: number;
  private _templateChromosome: GenericChromosome<any>;
  private _mutationRate: number;
  private _crossoverRate: number;
  private _elitism: number;
  private _elitismTop: number;
  private _newChromosomes: number;

  private _mutationOptions: {};

  private _selection: (
    chromosomes: GenericChromosome<any>[],
    num: number
  ) => GenericChromosome<any>[];
  private _crossover: (
    parent1: GenericChromosome<any>,
    parent2: GenericChromosome<any>
  ) => GenericChromosome<any>[];
  private _mutation: (
    chromosomes: GenericChromosome<number>[],
    chance: number,
    mutationRange: number
  ) => GenericChromosome<any>[];

  private _history: Population[] = [];

  private _population: Population;

  constructor({
    populationSize,
    templateChromosome,
    mutationRate = 0.2,
    // mutationRange = 0.5,
    crossoverRate = 0.9,
    elitism = 0.1,
    elitismTop = 0.5,
    newChromosomes = 0.1,

    mutationOptions = {},

    selection = rankSelect,
    crossover = uniformCross,
    mutation = noMutate
  }: ConstructorOptions) {
    this._populationSize = populationSize;
    this._templateChromosome = templateChromosome;
    this._mutationRate = mutationRate;
    this._crossoverRate = crossoverRate;
    this._elitism = elitism;
    this._elitismTop = elitismTop;
    this._newChromosomes = newChromosomes;

    this._mutationOptions = mutationOptions;

    this._population = new Population(this._populationSize);
    this._selection = selection;
    this._crossover = crossover;
    this._mutation = mutation;
  }

  generatePopulation(): Heredity {
    this._population.generate(this._templateChromosome.duplicate());

    return this;
  }

  nextGeneration(): Heredity {
    this._history.push(this._population.duplicate());
    this._population.sort();

    const elitistCount = Math.floor(this._elitism * this._population.size);
    const elitistTopCount = Math.floor(elitistCount * this._elitismTop);
    const freshCount = Math.floor(this._newChromosomes * this._population.size);
    const operationCount = this._population.size - (elitistCount + freshCount);
    let crossCount = Math.round(operationCount * this._crossoverRate);
    /* istanbul ignore next */
    crossCount = crossCount % 2 === 0 ? crossCount : crossCount - 1;
    const plebCount = operationCount - crossCount;

    let totalChromosomes = [];
    let freshChromosomes = [];
    let plebChromosomes = [];
    const elitistChromosomes = [];
    const crossedChromosomes = [];

    let elitistTopCurr = 0;
    for (let i = 0; i < elitistCount; i++) {
      const pos = elitistTopCurr++ > elitistTopCount? 0 : i;
      elitistChromosomes.push(this._population.chromosomes[pos]);
    }

    const fresh = new Population(freshCount);
    fresh.generate(this._templateChromosome.duplicate());
    freshChromosomes = fresh.chromosomes;

    const toBeCrossed = this._selection.apply(this, [
      this._population.chromosomes,
      crossCount
    ]);

    for (let i = 0; i < toBeCrossed.length; i += 2) {
      const children = this._crossover.apply(this, [
        toBeCrossed[i].duplicate(),
        toBeCrossed[i + 1].duplicate()
      ]);
      crossedChromosomes.push(children[0]);
      crossedChromosomes.push(children[1]);
    }

    plebChromosomes = this._selection.apply(this, [
      this._population.chromosomes,
      plebCount
    ]);

    totalChromosomes = [
      ...elitistChromosomes,
      ...freshChromosomes,
      ...crossedChromosomes,
      ...plebChromosomes
    ];

    totalChromosomes = this._mutation.apply(this, [
      totalChromosomes,
      this._mutationRate,
      this._mutationOptions
    ]);

    this._population = new Population(
      totalChromosomes.length,
      totalChromosomes
    );

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

  get history(): Population[] {
    return this._history;
  }
}

interface ConstructorOptions {
  populationSize: number;
  templateChromosome: GenericChromosome<any>;
  mutationRate?: number;
  crossoverRate?: number;
  elitism?: number;
  elitismTop?: number;
  newChromosomes?: number;

  mutationOptions?: any;

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
  index: number;
  fitness: number;
  chromosome: GenericChromosome<any>;
}
