import GenericChromosome from "./chromosomes/GenericChromosome";
import Population from "./Population";
import { rankSelect } from "./selections";
import { uniformCross } from "./crossovers";
import { noMutate } from "./mutations";

/**
 * ## Heredity
 *
 * #### Basic usage:
 * @example
 * ```typescript
 *
 * import { Heredity, NumberChromosome } from "heredity";
 * import { Selection, Crossover, Mutation } from "heredity";
 *
 * // Initialize
 * const h = new Heredity({
 *    // Population of 5 chromosomes
 *    populationSize: 5,
 *    // The population will comprise of number chromosomes with 3 genes
 *    templateChromosome: new NumberChromosome({}, 3),
 *
 *    // Use rank selection
 *    selection: Selection.rankSelect,
 *    // Use uniform crossover
 *    crossover: Crossover.uniformCross,
 *    // Use addition mutation
 *    mutation: Mutation.additionMutate
 * });
 *
 * // Generate population
 * h.generatePopulation();
 *
 * // Set fitness of population
 * // The higher the number the higher the fitness
 * h.setFitness([ 5, 10, 64, 10, 4...]);
 *
 * // Evolve population
 * h.nextGeneration();
 *
 * // Get genes of new evolved population
 * h.getGenes();
 * ```
 */
export default class Heredity {
  /** Population size */
  private _populationSize: number;
  /** Chromosome to be used as a template for population generation */
  private _templateChromosome: GenericChromosome<any>;
  /** The percentage of chromosomes to be mutated (0-1) */
  private _mutationRate: number;
  /** The percentage of chromosomes to be crossed over (0-1) */
  private _crossoverRate: number;
  /** Percentage of top chromosomes to be kept for the next generation (0-1) */
  private _elitism: number;
  /** Percentage of the top chromosomes that are only the top scoring chromsome */
  private _elitismTop: number;
  /** Percentage of population that will be new chromosomes */
  private _newChromosomes: number;

  /**
   * Options that will be passed to the mutation function.
   * Allows for standardized mutation functions.
   * Pass in options as an object.
   */
  private _mutationOptions: {};

  /** Selection function
   * @param chromosomes Population of chromosomes to be selected
   * @param num Number of chromosomes to be returned
   * @returns Returns selected chromosomes
   */
  private _selection: (
    chromosomes: GenericChromosome<any>[],
    num: number
  ) => GenericChromosome<any>[];

  /** Crossover function
   * @param parent1 First parent to be crossed over
   * @param parent2 Second parent to be crossed over
   * @returns Returns crossed over chromosomes
   */
  private _crossover: (
    parent1: GenericChromosome<any>,
    parent2: GenericChromosome<any>
  ) => GenericChromosome<any>[];

  /** Mutation function
   * @param chromosomes Population of chromosomes to be mutated
   * @param chance The percentage (0-1) of genes to be mutated
   * @param mutationOptions Options to be used for the mutation
   * @returns Returns the mutated chromosomes
   */
  private _mutation: (
    chromosomes: GenericChromosome<number>[],
    chance: number,
    mutationOptions: any
  ) => GenericChromosome<any>[];

  /**
   * A history of past populations.
   * Current population gets passed into array prior to next population is generated.
   */
  private _history: Population[] = [];

  /** Current population of chromosomes */
  private _population: Population;

  private _genPopPreHook: HookObject[] = [];
  private _genPopPostHook: HookObject[] = [];

  private _nextGenPreHook: HookObject[] = [];
  private _nextGenPostHook: HookObject[] = [];

  /**
   * Constructor options:
   * @example
   * ```typescript
   *
   * const h = new Heredity({
   *    populationSize: 50, // Required
   *    templateChromosome: new NumberChromosome({}, 5), // Required
   *    mutationRate: 0.2,
   *    crossoverRate: 0.9,
   *    elitism: 0.1,
   *    elitismTop: 0.5,
   *    newChromosome: 0.1,
   *
   *    mutationOptions: {},
   *
   *    selection: rankSelect,
   *    crossover: uniformCross,
   *    mutation: noMuate
   * });
   * ```
   */
  constructor({
    populationSize,
    templateChromosome,
    mutationRate = 0.2,
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

  /**
   * Generates a brand new randomized population.
   * Will wipe the current population.
   */
  generatePopulation(): Heredity {
    this._genPopPreHook.forEach(e => {
      e.func.apply(e.thisVal, []);
    });

    this._population.generate(this._templateChromosome.duplicate());

    this._genPopPostHook.forEach(e => {
      e.func.apply(e.thisVal, []);
    });

    return this;
  }

  /**
   * Evolves the next generation.
   * Performs selection, mutation, and crossover.
   * Past generation is pushed to history[] arraya\
   */
  nextGeneration(): Heredity {
    this._nextGenPreHook.forEach(e => {
      e.func.apply(e.thisVal, []);
    });

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
      const pos = elitistTopCurr++ > elitistTopCount ? 0 : i;
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

    this._nextGenPostHook.forEach(e => {
      e.func.apply(e.thisVal, []);
    });

    return this;
  }

  addHook(type: string, thisVal: any, hook: () => void) {
    switch (type) {
      case "genPopPre":
        this._genPopPreHook.push({ thisVal, func: hook });
        break;
      case "genPopPost":
        this._genPopPostHook.push({ thisVal, func: hook });
        break;
      case "nextGenPre":
        this._nextGenPreHook.push({ thisVal, func: hook });
        break;
      case "nextGenPost":
        this._nextGenPostHook.push({ thisVal, func: hook });
        break;
    }
  }

  /**
   * Set <code>fitness</code>
   * Can either set entire population or single index
   * @param scores Accepts array of numbers or a single number
   * @param index The index to set if scores is not an array
   *
   * @example
   * ```typescript
   *
   * // Sets the of the entire population
   * h.setFitness([ 5, 10, 8 ]);
   * // Sets the fitness of chromosome at index 5 to 10
   * h.setFitness(10, 5);
   * ```
   */
  setFitness(scores: number[] | number, index: number = 0) {
    this._population.setFitness(scores, index);
  }

  /**
   * Returns highest chromsome
   * @returns Object formatted in TopChromosmeObject interface
   * ```typescript
   * p.topChromosome();
   * // {
   * //   index: 4,
   * //   fitness: 53,
   * //   chromsome: NumberChromosome
   * // }
   * ```
   */
  topChromosome(): TopChromosomeObject {
    return this._population.topChromosome();
  }

  /**
   * Returns lowest chromsome
   * @returns Object formatted in `TopChromosmeObject` interface
   * ```typescript
   * h.lowestChromosome();
   * // {
   * //   index: 1,
   * //   fitness: 15,
   * //   chromsome: NumberChromosome
   * // }
   * ```
   */
  lowestChromosome(): TopChromosomeObject {
    return this._population.lowestChromosome();
  }

  /**
   * Get all the genes in current population.
   * Returns in nested form.
   *
   * @example
   * ```typescript
   *
   * h.getGenes();
   * // [[0.5, 0.8, 0.5], [0.6, 0.4, 0.1], [7.4, 3.9, 2.3]]
   * ```
   */
  getGenes() {
    return this._population.getGenes();
  }

  /**
   * Get all the genes in current population.
   * Returns a flattened array.
   *
   * @example
   * ```typescript
   *
   * h.getGenesFlat();
   * //  [0.5, 0.8, 0.5, 0.6, 0.4, 0.1, 7.4, 3.9, 2.3]
   * ```
   */
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

/** Type checking for constructor */
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
    mutationOptions: any
  ) => GenericChromosome<any>[];
}

/** Type checking for topChromosome and lowestChromosome */
interface TopChromosomeObject {
  index: number;
  fitness: number;
  chromosome: GenericChromosome<any>;
}

/** Type checking for pre/post hooks */
interface HookObject {
  thisVal: any;
  func: () => void;
}
