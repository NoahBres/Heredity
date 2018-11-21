import Population from "../src/population";
import { NumberChromosome, BitChromosome } from "../src/chromosomes";
import { AdditionMutate, BitFlipMutate } from "../src/mutations";

describe("Mutation functions", () => {
  let pop: Population;

  test("Addition mutation", () => {
    pop = new Population(5);
    pop.generate(new NumberChromosome({}, 5));

    let chromosomes = [...pop.chromosomes];
    let mutated = AdditionMutate(chromosomes, 0.2, {});
    expect(mutated).not.toEqual(chromosomes);
  });

  test("Bitflip mutation", () => {
    pop = new Population(5);
    pop.generate(new BitChromosome(5));

    let chromosomes = [...pop.chromosomes];
    let mutated = BitFlipMutate(chromosomes, 0.2, {})
    expect(mutated).not.toEqual(chromosomes);
  })
})