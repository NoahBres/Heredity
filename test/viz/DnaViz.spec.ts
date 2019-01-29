import Heredity from "../../src/Heredity";
import NumberChromosome from "../../src/chromosomes/NumberChromosome";
import DnaViz from "../../src/viz/DnaViz";
import PerceptronViz from "../../src/viz/PerceptronViz";

describe("DNA Viz", () => {
  let heredity: Heredity;
  let viz: DnaViz;

  const initSpy: jest.SpyInstance = jest.spyOn(DnaViz.prototype, "init");
  const updateSpy: jest.SpyInstance = jest.spyOn(DnaViz.prototype, "update");

  beforeEach(() => {
    heredity = new Heredity({
      populationSize: 10,
      templateChromosome: new NumberChromosome({}, 5)
    });

    document.body.innerHTML = `
      <div id="dna-viz"></div>
    `;

    initSpy.mockClear();
    updateSpy.mockClear();
  });

  test("Initialize with id", () => {
    viz = new DnaViz("dna-viz", heredity);
    expect(document.getElementById("dna-viz-style-id")).not.toBeUndefined();
  });

  test("Initialize with dom object", () => {
    viz = new DnaViz(<HTMLElement>document.getElementById("dna-viz"), heredity);
    expect(document.getElementById("dna-viz-style-id")).not.toBeUndefined();
  });

  test("Generate Population Hook", () => {
    viz = new DnaViz("dna-viz", heredity);

    heredity.generatePopulation();

    expect(initSpy).toHaveBeenCalled();
  });

  test("Next Generation Hook", () => {
    viz = new DnaViz("dna-viz", heredity);

    heredity.generatePopulation();
    heredity.nextGeneration();

    expect(updateSpy).toHaveBeenCalled();
  });

  test("Disable hook", () => {
    viz = new DnaViz("dna-viz", heredity, true);

    heredity.generatePopulation();
    heredity.nextGeneration();

    expect(initSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  test("Link", () => {
    viz = new DnaViz("dna-viz", heredity);

    expect(viz.link(viz)).toBeFalsy();
  });

  test("Link with PerceptronViz", () => {
    viz = new DnaViz("dna-viz", heredity);

    document.body.innerHTML += '<div id="perceptron-viz"></div>';

    const perceptronViz = new PerceptronViz(
      document.getElementById("perceptron-viz")!,
      heredity,
      {
        index: 0,
        threshhold: (i: number) => i > 0.5
      }
    );
    expect(viz.link(perceptronViz)).toBeTruthy();
  });

  test("Already initialized test", () => {
    viz = new DnaViz("dna-viz", heredity);

    heredity.generatePopulation();
    heredity.generatePopulation();

    expect(updateSpy).toHaveBeenCalled();
  });

  test("Init Tags OnChange", () => {
    viz = new DnaViz("dna-viz", heredity);

    heredity.generatePopulation();
    heredity.population.chromosomes[0].tags.add("dead");

    expect(document.querySelector(".dead")).not.toBeUndefined();
  });

  test("Update Tags OnChange", () => {
    viz = new DnaViz("dna-viz", heredity);

    heredity.generatePopulation();
    heredity.nextGeneration();
    heredity.population.chromosomes[0].tags.add("dead");

    expect(document.querySelector(".dead")).not.toBeUndefined();
  });

  test("Update Chromosome hasn't changed branch", () => {
    viz = new DnaViz("dna-viz", heredity);

    heredity.generatePopulation();
    viz.update();
    viz.update();
  });

  test("Pill hover test", () => {
    viz = new DnaViz("dna-viz", heredity);

    heredity.generatePopulation();

    const event = new MouseEvent("mouseover", {
      view: window,
      bubbles: true,
      cancelable: true
    });

    const hook = jest.fn();

    viz.onPillHover(null, hook);

    let pickPill = document.querySelector(".viz__base-dna-pill");
    pickPill!.dispatchEvent(event);

    expect(hook).toBeCalled();

    // Test update loop run
    heredity.generatePopulation();

    pickPill = document.querySelector(".viz__base-dna-pill");
    pickPill!.dispatchEvent(event);

    expect(hook).toBeCalledTimes(2);
  });

  test("Pill hover leave test", () => {
    viz = new DnaViz("dna-viz", heredity);

    heredity.generatePopulation();

    const event = new MouseEvent("mouseleave", {
      view: window,
      bubbles: true,
      cancelable: true
    });

    const hook = jest.fn();

    viz.onPillHoverLeave(null, hook);

    let pickPill = document.querySelector(".viz__base-dna-pill");
    pickPill!.dispatchEvent(event);

    expect(hook).toBeCalled();

    // Test update loop run
    heredity.generatePopulation();

    pickPill = document.querySelector(".viz__base-dna-pill");
    pickPill!.dispatchEvent(event);

    expect(hook).toBeCalledTimes(2);
  });
});
