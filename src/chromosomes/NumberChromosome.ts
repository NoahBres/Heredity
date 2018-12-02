import GenericChromosome from "./GenericChromosome";

export default class NumberChromosome extends GenericChromosome<number> {
  private _upperBound: number;
  private _lowerBound: number;
  private _round: boolean;
  private _clamp: boolean;

  constructor(
    {
      lowerBound = 0,
      upperBound = 1,
      round = false,
      clamp = false
    }: ConstructorOptions,
    length: number,
    genes: number[] = [],
    score: number = 0
  ) {
    super(length, genes, score);

    this._upperBound = upperBound;
    this._lowerBound = lowerBound;
    this._round = round;
    this._clamp = clamp;

    if (this._lowerBound > this._upperBound) {
      [this._lowerBound, this._upperBound] = [
        this._upperBound,
        this._lowerBound
      ];
    }
  }

  generate(): NumberChromosome {
    this._genes = [];

    for (let i = 0; i < this._length; i++) {
      let min = this._lowerBound;
      let max = this._upperBound;

      if (this._round) {
        min = Math.ceil(this._lowerBound);
        max = Math.floor(this._upperBound);
      }

      let value = Math.random() * (max - min + (this._round ? 1 : 0)) + min;
      value = this._round ? Math.floor(value) : value;

      this._genes.push(value);
    }

    return this;
  }

  duplicate(): NumberChromosome {
    return new NumberChromosome(
      {
        lowerBound: this._lowerBound,
        upperBound: this._upperBound,
        round: this._round,
        clamp: this._clamp
      },
      this._length,
      this._genes,
      this._fitness
    );
  }
}

interface ConstructorOptions {
  lowerBound?: number;
  upperBound?: number;
  round?: boolean;
  clamp?: boolean;
}
