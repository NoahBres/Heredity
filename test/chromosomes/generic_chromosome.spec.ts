import { GenericChromosome } from '../../src/chromosomes'

describe('Generic Chromosome', () => {
  test('Constructor initializes gene array', () => {
    // const spy = jest.spyOn(GenericChromosome, '')
    const genChrom = new GenericChromosome<number>(5);
    expect(genChrom.genes.length).toBe(5);
  })
})