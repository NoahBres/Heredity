import { GenericChromosome } from "../../src/chromosomes";

describe("Generic Chromosome", () => {
  let chrom: GenericChromosome<number>;

  beforeEach(() => {
    chrom = new GenericChromosome<number>(5);
  });

  test("Check if chromosome is initiated", () => {
    expect(chrom).toBeInstanceOf(GenericChromosome);
  });

  test("Gene array is initialized properly", () => {
    expect(chrom.length).toBe(5);
  });

  test("Duplicate chromosome", () => {
    const dupe = chrom.duplicate();
    expect(dupe).toEqual(chrom);
  });

  test("Generate chromosome", () => {
    chrom.generate();

    expect(chrom.genes).toEqual(new Array(5));
  });

  test("Get and set fitness", () => {
    chrom.fitness = 20;
    expect(chrom.fitness).toBe(20);
  });

  test("Get and set genes", () => {
    chrom.genes = [5, 5, 5, 5, 5];
    expect(chrom.genes).toEqual([5, 5, 5, 5, 5]);
  });
});
