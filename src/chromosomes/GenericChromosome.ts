/**
 * ## GenericChromosome
 * A template for chromosomes. Used to create other chromosomes.
 *
 * #### Basic Usage - Extending another chromosome
 * @example
 * ```typescript
 *
 * import GenericChromosome from "heredity";
 *
 * class BitChromosome extends GenericChromosome<boolean> {
 *    generate(): BitChromosome {
 *        // Generate code
 *    }
 *
 *    duplicate(): BitChromosome {
 *        return new BitChromosome(this._length, this._genes, this._fitness);
 *    }
 * }
 * ```
 */

export default class GenericChromosome<T> {
  /** Fitness of chromosome. */
  protected _fitness: number;
  /** Gene list of chromosome. Takes type T. */
  protected _genes: T[];
  /** Length of chromosome. Primarily used for generation. */
  protected _length: number = 0;

  tags = new TagManager();

  /**
   * @example
   * ```typescript
   *
   * // Sets a chromosome with 3 gene values and a fitness of 5
   * const p = new GenericChromosome<boolean>(
   *    3,
   *    [ true, false, false ],
   *    5
   * );
   *  ```
   * @param length Length of the chromosome. Primarily used in generate function.
   * @param genes Array of gene values
   * @param score Fitness of the chromosome
   */
  constructor(length: number, genes: T[] = [], score: number = 0) {
    this._length = length;
    this._genes = genes;
    this._fitness = score;

    if (this._genes.length === 0) {
      this._genes = Array(length);
    }
  }

  /** Returns duplicated chromosome */
  duplicate(): GenericChromosome<T> {
    return new GenericChromosome(this._length, this._genes, this._fitness);
  }

  /** Generate function. To be overriden. */
  generate(): GenericChromosome<T> {
    this._genes = Array(this._length);

    return this;
  }

  getColorsHue(): number[] {
    return [];
  }

  get fitness(): number {
    return this._fitness;
  }

  set fitness(fitness: number) {
    this._fitness = fitness;
  }

  get genes(): T[] {
    return this._genes;
  }

  set genes(genes: T[]) {
    this._genes = genes;
  }

  get length(): number {
    return this._genes.length;
  }
}

class TagManager extends Set {
  private _changeListeners: (() => void)[] = [];

  add(value: any) {
    super.add(value);

    this._changeListeners.forEach(f => {
      f.apply(f, []);
    });

    return this;
  }

  clear() {
    super.clear();

    this._changeListeners.forEach(f => {
      f.apply(f, []);
    });
  }

  delete(value: any) {
    this._changeListeners.forEach(f => {
      f.apply(f, []);
    });

    return super.delete(value);
  }

  onChange(listener: () => void) {
    this._changeListeners.push(listener);
  }
}
