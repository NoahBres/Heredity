import Heredity from "../../src/Heredity";
import NumberChromosome from "../../src/chromosomes/NumberChromosome";
import { DnaPill } from "../../src/viz/VizClass";
import GenericChromosome from "../../src/chromosomes/GenericChromosome";

describe("DNA Pill", () => {
  let heredity: Heredity;
  let pill: DnaPill;
  let chromosome: GenericChromosome<any>;

  beforeEach(() => {
    heredity = new Heredity({
      populationSize: 10,
      templateChromosome: new NumberChromosome({}, 5)
    });

    heredity.generatePopulation();

    chromosome = heredity.chromosomes[0];

    pill = new DnaPill(heredity.chromosomes[0]);
  });

  test("Update chromosome dead tag", () => {
    chromosome.tags.add("dead");
    pill.update();

    expect(chromosome.tags.has("dead")).toBeTruthy();

    chromosome.tags.delete("dead");
    pill.update();

    expect(chromosome.tags.has("dead")).toBeFalsy();
  });

  test("Set Chromosome", () => {
    const newChromosome = new NumberChromosome({}, 5);
    pill.setChromosome(newChromosome);
  });

  test("Update when dirty", () => {
    const html = pill.element.innerHTML;

    const newChromosome = new NumberChromosome({}, 5).generate();
    pill.setChromosome(newChromosome);
    pill.update();

    const newHtml = pill.element.innerHTML;

    expect(html).not.toBe(newHtml);
  });

  test("Alternative class name test", () => {
    pill.alternativeClassName = "test-class-name";
    pill.update();
    expect(pill.element.classList.contains("test-class-name"));
  });

  test("Get base class name", () => {
    expect(pill.baseClassName.length).toBeGreaterThan(0);
  });
});
