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

export default class GenericChromosome<GeneType> {
  /** Fitness of chromosome. */
  protected _fitness: number;
  /** Gene list of chromosome. Takes type T. */
  protected _genes: GeneType[];
  /** Length of chromosome. Primarily used for generation. */
  protected _length: number = 0;

  /** Local TagManager */
  tags: TagManager = new TagManager(this);

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
  constructor(length: number, genes: GeneType[] = [], score: number = 0) {
    this._length = length;
    this._genes = genes;
    this._fitness = score;

    if (this._genes.length === 0) {
      this._genes = Array(length);
    }
  }

  /** Returns duplicated chromosome */
  duplicate(): GenericChromosome<GeneType> {
    return new GenericChromosome(this._length, this._genes, this._fitness);
  }

  /** Generate function. To be overriden. */
  generate(): GenericChromosome<GeneType> {
    this._genes = Array(this._length);

    return this;
  }

  /**
   * Returns an array of hues representing each gene.
   * Should be caclulated in the overriden class.
   * GenericChromosome will return an empty array.
   *
   * @example
   * ```typescript
   *
   * chromosome.getColorsHue()
   * // []
   * // Generic chromosome actually returns an empty array
   * ```
   */
  getColorsHue(): number[] {
    return [];
  }

  /** Returns the fitness of the chromosome */
  get fitness(): number {
    return this._fitness;
  }

  /** Set the fitness of the chromosome */
  set fitness(fitness: number) {
    this._fitness = fitness;
  }

  /** Return genes */
  get genes(): GeneType[] {
    return this._genes;
  }

  /** Set genes */
  set genes(genes: GeneType[]) {
    this._genes = genes;
  }

  /** Returns length of chromosome */
  get length(): number {
    return this._genes.length;
  }
}

/**
 * ## TagManager
 * Manages the tags for a chromosome. Basically just extends set but implements an onChange listener.
 *
 * #### Basic usage
 * @example
 * ```typescript
 *
 * const chrom = new GenericChromosome<boolean>(3);
 *
 * const tagManager = new TagManager(chrom);
 *
 * // Add a `dead` tag
 * tagManager.add('dead');
 *
 * // Clear tags
 * tagManager.clear()
 *
 * // Check if tag exists
 * tagManager.has('dead')
 *
 * // Delete tag
 * tagManager.delete('dead')
 *
 * // On Change Listener
 * tagManager.onChange(() => {
 *    console.log("I'm called when anything is added or deleted!")
 * });
 *
 * tagManager.add('test');
 * // I'm called when anything is added or deleted!
 * ```
 */
class TagManager extends Set {
  /** List of on change listeners */
  private _changeListeners: ListenerObject[] = [];
  /** Chromosome that the tag is attached too */
  private _chromosome: GenericChromosome<any>;

  /**
   * TagManager is initialized by passing in a chromosome. This chromosome is
   * attached and passed into each onChange call to indicate the change.
   *
   * @example
   * ```typescript
   *
   * const chrom = new GenericChromosome<boolean>(3);
   *
   * // Takes in any extension of GenericChromsome
   * const tagManager = new TagManager(chrom);
   * ```
   *
   * @param chromosome Chromsome to attach to
   */
  constructor(chromosome: GenericChromosome<any>) {
    super();

    this._chromosome = chromosome;
  }

  /**
   * Adds a tag to the chromosome
   *
   * @example
   * ```typescript
   *
   * tagManager.add('test')
   * ```
   *
   * @param value Tag to add
   */
  add(value: any) {
    super.add(value);

    this._changeListeners.forEach(f => {
      f.listener.apply(f.thisVal, [this._chromosome]);
    });

    return this;
  }

  /**
   * Clears the tags in a chromosome
   *
   * @example
   * ```typescript
   *
   * tagManager.add('test')
   * tagManager.has('test') // True
   *
   * tagManager.clear()
   * tagManager.has('test) // False
   * ```
   */
  clear() {
    super.clear();

    this._changeListeners.forEach(f => {
      f.listener.apply(f.thisVal, [this._chromosome]);
    });
  }

  /**
   * Delete a specific tag.
   * Returns `false` if the tag does not exist.
   *
   * @example
   * ```typescript
   *
   * tagManager.add('test');
   * tagManager.has('test'); // True
   *
   * tagManager.delete('test');
   * tagManager.has('test'); // False
   * ``
   *
   * @param value Tag to delete
   */
  delete(value: any) {
    this._changeListeners.forEach(f => {
      f.listener.apply(f.thisVal, [this._chromosome]);
    });

    return super.delete(value);
  }

  /**
   * Sets a listener for tag changes.
   *
   * @example
   * ```typescript
   *
   * tagManager.onChange(chromsome => {
   *    console.log("The following chromosome has changed: ");
   *    console.log(chromsome);
   * })
   * ```
   *
   * @param listener
   * @param thisVal
   */
  onChange(
    listener: (chromosome: GenericChromosome<any>) => void,
    thisVal?: any
  ) {
    this._changeListeners.push({ thisVal, listener });
  }
}

/** Type checking for the listener object */
interface ListenerObject {
  thisVal: any;
  listener: (chromosome: GenericChromosome<any>) => void;
}
