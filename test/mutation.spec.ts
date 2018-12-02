import Population from "../src/Population";
import { NumberChromosome, BitChromosome } from "../src/chromosomes";
import { additionMutate, bitFlipMutate } from "../src/mutations";

describe("Mutation functions", () => {
  let pop: Population;

  test("Addition mutation", () => {
    pop = new Population(5);
    pop.generate(new NumberChromosome({}, 5));

    const chromosomes = [...pop.chromosomes];
    const mutated = additionMutate(chromosomes, 0.2, {});
    expect(mutated).not.toEqual(chromosomes);
  });

  test("Bitflip mutation", () => {
    pop = new Population(5);
    pop.generate(new BitChromosome(5));

    const chromosomes = [...pop.chromosomes];
    const mutated = bitFlipMutate(chromosomes, 0.2, {});
    expect(mutated).not.toEqual(chromosomes);
  });
});
