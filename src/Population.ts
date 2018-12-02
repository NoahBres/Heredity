import { GenericChromosome } from "./chromosomes";

export default class Population {
  private _chromosomes: GenericChromosome<any>[];
  private _size: number = 0;

  constructor(size: number, chromosomes: GenericChromosome<any>[] = []) {
    this._chromosomes = chromosomes;
    this._size = size;

    if (this._chromosomes.length === 0) {
      this._chromosomes = Array(this._size);
    }
  }

  generate(templateChromosome: GenericChromosome<any>): Population {
    this._chromosomes = [];

    for (let i = 0; i < this._size; i++) {
      const c = templateChromosome.duplicate().generate();

      this._chromosomes.push(c);
    }

    return this;
  }

  duplicate(): Population {
    return new Population(this._size, this._chromosomes);
  }

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

  sort() {
    // Sort descending. Highest fitness is in position 0
    this._chromosomes.sort((a, b) => b.fitness - a.fitness);
  }

  setFitness(scores: number[] | number, index = 0) {
    if (scores instanceof Array) {
      this._chromosomes.forEach((val, index) => (val.fitness = scores[index]));
    } else this._chromosomes[index].fitness = scores;
  }

  getGenes(): any[] {
    return this._chromosomes.map(x => x.genes);
  }

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

interface TopChromosomeObject {
  index: number;
  fitness: number;
  chromosome: GenericChromosome<any>;
}
