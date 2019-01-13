import Neuron from "../../../src/chromosomes/Cerebrum.js/Neuron";

describe("Neuron", () => {
  let neuron: Neuron;

  test("Initialize neuron", () => {
    neuron = new Neuron(3);
    expect(neuron).toBeInstanceOf(Neuron);
  });
});
