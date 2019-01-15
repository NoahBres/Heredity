import Heredity from "../../src/Heredity";
import NumberChromosome from "../../src/chromosomes/NumberChromosome";
import TopGenesViz from "../../src/viz/TopGenesViz";

describe("Top Genes Viz", () => {
  let heredity: Heredity;
  let viz: TopGenesViz;

  let initSpy: jest.SpyInstance;
  let updateSpy: jest.SpyInstance;

  beforeEach(() => {
    heredity = new Heredity({
      populationSize: 10,
      templateChromosome: new NumberChromosome({}, 5)
    });

    document.body.innerHTML = `
      <div id="top-genes-viz"></div>
    `;

    initSpy = jest.spyOn(TopGenesViz.prototype, "init");
    updateSpy = jest.spyOn(TopGenesViz.prototype, "update");

    viz = new TopGenesViz(
      <HTMLElement>document.getElementById("top-genes-viz"),
      heredity
    );
  });

  test("Initialize with id", () => {
    viz = new TopGenesViz("top-genes-viz", heredity);
    expect(
      document.getElementById("top-genes-viz")!.childElementCount
    ).not.toBe(0);
  });

  test("Initialize with dom object", () => {
    expect(
      document.getElementById("top-genes-viz")!.childElementCount
    ).not.toBe(0);
  });

  test("Generate Population Hook", () => {
    heredity.generatePopulation();

    expect(initSpy).toHaveBeenCalled();
  });

  test("Next Generation Hook", () => {
    heredity.generatePopulation();
    heredity.nextGeneration();

    expect(updateSpy).toHaveBeenCalled();
  });

  test("Link", () => {
    expect(viz.link(viz)).toBeFalsy();
  });
});
