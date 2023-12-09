const fs = require('fs')

const chunks = fs.readFileSync('../input.txt', 'utf8').trim().split('\n\n')
const seeds = chunks.shift().split(": ")[1].trim().split(' ').map(Number)
const mappings = chunks.reduce((acc, chunk) => {
  const [name, value] = chunk.split(" map:\n")
  const mapping = value.trim().split('\n').map((map) => map.split(' ').map(Number));
  return { ...acc, [name]: mapping }
}, {});

const layers = Object.values(mappings).map(mapping => mapping.map((range) => ({
  sourceStart: range[1],
  sourceEnd: range[1] + range[2],
  destStart: range[0],
  destEnd: range[0] + range[2],
}))
  .sort((a, b) => a.sourceStart - b.sourceStart)
)

const lookup = (id, map) => {
  for (const [dest, source, length] of map) {
    if (id >= source && id <= source + length) {
      const offset = id - source;
      return dest + offset
    }
  }
  return id
}

const seedToLocation = (seed) => {
  let scratch = seed;
  for (const map of Object.values(mappings)) {
    scratch = lookup(scratch, map)
  }
  return scratch;
}

console.log('Part 1:', Math.min(...seeds.map(seedToLocation)))


const destinationRanges = (sourceRange, layerMappings) => {
  // given a source range, eg. 79..93
  // and a layer mapping, eg.
  // [
  // { sourceStart: 98, sourceEnd: 100, destStart: 50, destEnd: 52 },
  // { sourceStart: 50, sourceEnd: 98, destStart: 52, destEnd: 100 }
  // ],
  // create a new set of destinationRanges,
  // chunked into valid ranges from layer mappings, and from original unmapped i=i ranges

  // these mappings are always adjacent - so there won't be a gap between 2 applicable mappings for a source range - yippee
  const applicableMappings = layerMappings.filter((layerMapping) =>
    sourceRange.start <= layerMapping.sourceEnd && sourceRange.end >= layerMapping.sourceStart
  )
  if (applicableMappings.length) {
    const outputRanges = []
    if (sourceRange.start < applicableMappings[0].sourceStart) {
      outputRanges.push({ start: sourceRange.start, end: applicableMappings[0].sourceStart - 1 })
    }
    for (const applicableMapping of applicableMappings) {
      const startOffset = sourceRange.start > applicableMapping.sourceStart ? sourceRange.start - applicableMapping.sourceStart : 0;
      const endOffset = sourceRange.end < applicableMapping.sourceEnd ? sourceRange.end - applicableMapping.sourceEnd : 0;
      outputRanges.push({ start: applicableMapping.destStart + startOffset, end: applicableMapping.destEnd + endOffset })
    }
    if (sourceRange.end > applicableMappings[applicableMappings.length - 1].sourceEnd) {
      outputRanges.push({ start: applicableMappings[applicableMappings.length - 1].sourceEnd + 1, end: sourceRange.end })
    }
    return outputRanges;
  } else {
    return [sourceRange]
  }
}

const seedChunks = []
let minStartRangesForChunks = []
while (seeds.length) {
  const start = seeds.shift();
  const range = seeds.shift();
  let inputRanges = [{ start, end: start + range }]
  for (const layer of layers) {
    let newInputRanges = []
    for (const inputRange of inputRanges) {
      newInputRanges.push(destinationRanges(inputRange, layer))
    }
    inputRanges = newInputRanges.flat();
  }
  minStartRangesForChunks.push(inputRanges.map(i => i.start))
}

console.log('Part 2:', Math.min(...minStartRangesForChunks.flat()))
