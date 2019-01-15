import NumberChromosome from "../../src/chromosomes/NumberChromosome";

describe("Number Chromosome", () => {
  let chrom1: NumberChromosome;
  let chrom2: NumberChromosome;
  let chrom3: NumberChromosome;

  beforeEach(() => {
    chrom1 = new NumberChromosome(
      {
        lowerBound: 5,
        upperBound: 0,
        round: false,
        clamp: false
      },
      5
    );

    chrom2 = new NumberChromosome(
      {
        lowerBound: 0,
        upperBound: 5,
        round: true,
        clamp: false
      },
      5
    );

    chrom3 = new NumberChromosome({}, 5);
  });

  test("Check if chromosome is initiated", () => {
    expect(chrom1).toBeInstanceOf(NumberChromosome);
    expect(chrom2).toBeInstanceOf(NumberChromosome);
    expect(chrom3).toBeInstanceOf(NumberChromosome);
  });

  test("Gene array is initialized properly", () => {
    expect(chrom1.length).toBe(5);
    expect(chrom2.length).toBe(5);
    expect(chrom3.length).toBe(5);
  });

  test("Duplicate chromosome", () => {
    const dupe1 = chrom1.duplicate();
    const dupe2 = chrom2.duplicate();
    expect(dupe1).toEqual(chrom1);
    expect(dupe2).toEqual(chrom2);
    expect(dupe1).not.toEqual(dupe2);
  });

  test("Chromosome is within bounds", () => {
    chrom1.generate();
    chrom2.generate();
    chrom3.generate();

    for (const gene of chrom1.genes) {
      expect(gene).toBeGreaterThanOrEqual(0);
      expect(gene).toBeLessThanOrEqual(5);
    }

    for (const gene of chrom2.genes) {
      expect(gene).toBeGreaterThanOrEqual(0);
      expect(gene).toBeLessThanOrEqual(5);
    }

    for (const gene of chrom3.genes) {
      expect(gene).toBeGreaterThanOrEqual(0);
      expect(gene).toBeLessThanOrEqual(1);
    }
  });

  test("Chromosome is rounded", () => {
    chrom2.generate();

    for (const gene of chrom2.genes) {
      expect(gene % 1 === 0).toBeTruthy();
    }
  });

  test("Get Colors Hue", () => {
    chrom1.generate();
    const colors = chrom1.getColorsHue();
    colors.forEach(c => {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(255);
    });
  });
});
