import GenericChromosome from "./chromosomes/GenericChromosome";

/**
 * ## Population (internal)
 * Contains a population of chromosomes
 *
 * #### Basic usage
 * @example
 * ```typescript
 *
 * //Declare a population with 5 chromosomes
 * const p = new Population(5);
 *
 * // Declare a number chromosome with 3 genes
 * // All genes within the population will be based off of this chromosome
 * const template = new NumberChromosome({}, 3);
 * // Generate a population
 * // Will create a random population with the length stated in the constructor
 * p.generate(template);
 *
 * // Set fitness of population
 * p.setFitness([ 4, 6, 9, 10, 1 ]);
 * ```
 */
export default class Population {
  /** List of chromosomes */
  private _chromosomes: GenericChromosome<any>[];
  /** Size of population */
  private _size: number = 0;

  /**
   * @example
   * ```typescript
   *
   * // Sets a population with 3 BitChromosomes
   * const p = new Population(3,
   *  [
   *    new BitChromosome(3),
   *    new BitChromosome(3),
   *    new BitChromosome(3)
   *  ]
   * );
   * ```
   * @param size Size of the population
   * @param chromosomes (optional) Set population of chromosomes
   */
  constructor(size: number, chromosomes: GenericChromosome<any>[] = []) {
    this._chromosomes = chromosomes;
    this._size = size;

    if (this._chromosomes.length === 0) {
      this._chromosomes = Array(this._size);
    }
  }

  /**
   * Generates a randomized population using the template chromsome.
   * Calls <code>templateChromosome.generate()</code> to get generated chromosomes
   * @param templateChromosome
   */
  generate(templateChromosome: GenericChromosome<any>): Population {
    this._chromosomes = [];

    for (let i = 0; i < this._size; i++) {
      const c = templateChromosome.duplicate().generate();

      this._chromosomes.push(c);
    }

    return this;
  }

  /** Returns duplicate population */
  duplicate(): Population {
    return new Population(this._size, this._chromosomes);
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
    let top = this._chromosomes[0].fitness;

    let index = 0;
    for (let i = 0; i < this._chromosomes.length; i++) {
      const val = this._chromosomes[i].fitness;

      if (val > top) {
        index = i;
        top = val;
      }
    }

    return {
      index,
      fitness: this._chromosomes[index].fitness,
      chromosome: this._chromosomes[index]
    };
  }

  /**
   * Returns lowest chromsome
   * @returns Object formatted in `TopChromosmeObject` interface
   * ```typescript
   * p.lowestChromosome();
   * // {
   * //   index: 1,
   * //   fitness: 15,
   * //   chromsome: NumberChromosome
   * // }
   * ```
   */
  lowestChromosome(): TopChromosomeObject {
    let low = this._chromosomes[0].fitness;

    let index = 0;
    for (let i = 0; i < this._chromosomes.length; i++) {
      const val = this._chromosomes[i].fitness;

      if (val < low) {
        index = i;
        low = val;
      }
    }

    return {
      index,
      fitness: this._chromosomes[index].fitness,
      chromosome: this._chromosomes[index]
    };
  }

  /**
   * Sorts the population by <code>fitness</code>.
   * A higher score means that the chromosome is better.
   */
  sort() {
    // Sort descending. Highest fitness is in position 0
    this._chromosomes.sort((a, b) => b.fitness - a.fitness);
  }

  /**
   * Set <score>fitness</score>
   * Can either set entire population or single index
   * @param scores Accepts array of numbers or a single number
   * @param index The index to set if scores is not an array
   *
   * @example
   * ```typescript
   *
   * // Sets the of the entire population
   * p.setFitness([ 5, 10, 8 ]);
   * // Sets the fitness of chromosome at index 5 to 10
   * p.setFitness(10, 5);
   * ```
   */
  setFitness(scores: number[] | number, index = 0) {
    if (scores instanceof Array) {
      this._chromosomes.forEach((val, index) => (val.fitness = scores[index]));
    } else this._chromosomes[index].fitness = scores;
  }

  /**
   * Get all the genes in the population.
   * Returns in nested form.
   *
   * @example
   * ```typescript
   *
   * p.getGenes();
   * // [[0.5, 0.8, 0.5], [0.6, 0.4, 0.1], [7.4, 3.9, 2.3]]
   * ```
   */
  getGenes(): any[] {
    return this._chromosomes.map(x => x.genes);
  }

  /**
   * Get all the genes in a population.
   * Returns a flattened array.
   *
   * @example
   * ```typescript
   *
   * p.getGenesFlat();
   * //  [0.5, 0.8, 0.5, 0.6, 0.4, 0.1, 7.4, 3.9, 2.3]
   * ```
   */
  getGenesFlat(): any[] {
    return this._chromosomes
      .map(x => x.genes)
      .reduce((acc, val) => acc.concat(val), []);
  }

  get chromosomes(): GenericChromosome<any>[] {
    return this._chromosomes;
  }

  get size(): number {
    return this._chromosomes.length;
  }
}

/** Type checking for topChromsome and lowestChromosome */
interface TopChromosomeObject {
  index: number;
  fitness: number;
  chromosome: GenericChromosome<any>;
}
