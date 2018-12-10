import GenericChromosome from "./chromosomes/GenericChromosome";
import NumberChromosome from "./chromosomes/NumberChromosome";
import BitChromosome from "./chromosomes/BitChromosome";

import * as Selection from "./selections";
import * as Mutation from "./mutations";
import * as Crossover from "./crossovers";

export { default as Heredity } from "./Heredity";

export { Selection };
export { Mutation };
export { Crossover };

export { NumberChromosome };
export { GenericChromosome };
export { BitChromosome };

export { default as DnaViz } from "./viz/DnaViz";
