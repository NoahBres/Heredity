import GenericChromosome from "./GenericChromosome";

export default class BitChromosome extends GenericChromosome<boolean> {
  generate(): BitChromosome {
    this._genes = [];

    for (let i = 0; i < this._length; i++) {
      const value = Math.floor(Math.random() * 2) === 0;
      this._genes.push(value);
    }

    return this;
  }

  duplicate(): BitChromosome {
    return new BitChromosome(this._length, this._genes, this._fitness);
  }
}
