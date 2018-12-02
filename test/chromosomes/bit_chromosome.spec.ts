import { BitChromosome } from "../../src/chromosomes";

describe("Generic Chromosome", () => {
  let chrom: BitChromosome;

  beforeEach(() => {
    chrom = new BitChromosome(5);
  });

  test("Check if chromosome is initiated", () => {
    expect(chrom).toBeInstanceOf(BitChromosome);
  });

  test("Duplicate chromosome", () => {
    const dupe = chrom.duplicate();
    expect(dupe).toEqual(chrom);
  });

  test("Generate chromosome", () => {
    chrom.generate();

    for (const gene of chrom.genes) {
      expect(typeof gene).toBe("boolean");
    }
  });
});
