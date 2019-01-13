import GenericChromosome from "../../src/chromosomes/GenericChromosome";

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

    expect(chrom.genes).toEqual(Array(5));
  });

  test("Get and set fitness", () => {
    chrom.fitness = 20;
    expect(chrom.fitness).toBe(20);
  });

  test("Get and set genes", () => {
    chrom.genes = [5, 5, 5, 5, 5];
    expect(chrom.genes).toEqual([5, 5, 5, 5, 5]);
  });

  test("Get Colors", () => {
    const colors = chrom.getColorsHue();

    // Should be empty because it's the generic class
    expect(colors).toEqual([]);
  });

  test("Tag Manager add", () => {
    chrom.tags.add("dead");
    expect(chrom.tags.has("dead")).toBeTruthy();
  });

  test("Tag Manager clear", () => {
    chrom.tags.add("test");
    chrom.tags.clear();
    expect(chrom.tags.size).toEqual(0);
  });

  test("Tag Manager delete", () => {
    chrom.tags.add("test");
    chrom.tags.add("test");
    chrom.tags.delete("test 2");
    expect(chrom.tags.size).toEqual(1);
  });

  test("Tag Manager onChange", () => {
    const hook = jest.fn();
    chrom.tags.onChange(null, hook);
    chrom.tags.add("test");
    chrom.tags.clear();
    chrom.tags.delete("clear");
    expect(hook).toBeCalledTimes(3);
  });
});
