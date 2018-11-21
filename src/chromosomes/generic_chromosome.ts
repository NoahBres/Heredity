export default class GenericChromosome<T> {
  protected _fitness: number;
  protected _genes: T[];
  protected _length: number = 0;

  constructor(length: number, genes: T[] = [], score: number = 0) {
    this._length = length;
    this._genes = genes;
    this._fitness = score;

    if(this._genes.length == 0)
      this._genes = new Array(length);
  }

  duplicate(): GenericChromosome<T> {
    return new GenericChromosome(this._length, this._genes, this._fitness);
  }

  generate(): GenericChromosome<T> {
    this._genes = new Array(this._length);
    // for(let i = 0; i < this._length; i++) {
    //   this._genes.push(0);
    // }

    return this;
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

