import NeuralChromosome from "../../src/chromosomes/NeuralChromosome";
import Cerebrum from "../../src/chromosomes/Cerebrum.js/Cerebrum";

describe("Neural Chromosome", () => {
  let chrom1: NeuralChromosome;
  let chrom2: NeuralChromosome;

  beforeEach(() => {
    chrom1 = new NeuralChromosome({
      inputLength: 2,
      hiddenLength: [2],
      outputLength: 1,
      activation: NeuralChromosome.sigmoid
    });

    chrom2 = new NeuralChromosome({
      inputLength: 2,
      hiddenLength: [2],
      outputLength: 1,
      activation: NeuralChromosome.tanh
    });
  });

  test("Check if chromosome is initiated", () => {
    expect(chrom1).toBeInstanceOf(NeuralChromosome);
    expect(chrom2).toBeInstanceOf(NeuralChromosome);
  });

  test("Gene array is initialized properly", () => {
    expect(chrom1.length).toBe(6);
    expect(chrom2.length).toBe(6);
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

    for (const gene of chrom1.genes) {
      expect(gene).toBeGreaterThanOrEqual(0);
      expect(gene).toBeLessThanOrEqual(1);
    }
  });

  test("Cerebrum export", () => {
    const exported = chrom1.export();
    expect(exported.neuronsInLayer).toBeTruthy();
    expect(exported.neuronWeights).toBeTruthy();
  });

  test("Cerebrum import", () => {
    const exported = chrom1.export();
    chrom2.import(exported);

    expect(chrom1.getWeights()).toEqual(chrom2.getWeights());
  });

  test("Compute", () => {
    const computed = chrom1.compute([Math.random(), Math.random()]);
    computed.forEach(n => {
      expect(n).toBeLessThan(1);
      expect(n).toBeGreaterThanOrEqual(0);
    });
  });

  test("Set weights", () => {
    const weights = Array(6)
      .fill(0)
      .map(x => Math.random());
    chrom1.setWeights(weights);
    expect(chrom1.getWeights()).toEqual(weights);
  });

  test("On Compute", () => {
    const hook = jest.fn();
    chrom2.onCompute(hook);
    chrom2.compute([0.5, 0.5]);
    expect(hook).toBeCalled();
  });

  test("Get Cerebrum", () => {
    expect(chrom1.cerebrum).toBeInstanceOf(Cerebrum);
  });
});
