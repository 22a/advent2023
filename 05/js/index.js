const fs = require('fs')

const chunks = fs.readFileSync('../input.txt', 'utf8').trim().split('\n\n')
const seeds = chunks.shift().split(": ")[1].trim().split(' ').map(Number)
const layerMappings = chunks.map((chunk) => {
  const [_name, value] = chunk.split(" map:\n")
  const layerMapping = value.trim().split('\n')
    .map((mapping) => mapping.split(' ').map(Number))
    .map((range) => ({
      sourceStart: range[1],
      sourceEnd: range[1] + range[2],
      destStart: range[0],
      destEnd: range[0] + range[2],
    }))
    .sort((a, b) => a.sourceStart - b.sourceStart)
  return layerMapping;
});

const lookup = (id, layerMap) => {
  for (const { sourceStart, sourceEnd, destStart } of layerMap) {
    if (id >= sourceStart && id <= sourceEnd) {
      const offset = id - sourceStart;
      return destStart + offset
    }
  }
  return id
}

const seedToLocation = (seed) => {
  let scratch = seed;
  for (const layerMap of layerMappings) {
    scratch = lookup(scratch, layerMap)
  }
  return scratch;
}

console.log('Part 1:', Math.min(...seeds.map(seedToLocation)))

const destinationRanges = (sourceRange, layerMappings) => {
  // given a source range, eg. 79..93
  // and a layer mapping, eg. [ { sourceStart: 98, sourceEnd: 100, destStart: 50, destEnd: 52 }, { sourceStart: 50, sourceEnd: 98, destStart: 52, destEnd: 100 } ],
  // create a new set of "destinationRanges" chunked into valid ranges from layer mappings, and from original unmapped i=i ranges
  // these mappings are always adjacent - so there won't be a gap between 2 applicable mappings for a source range which means no re-stitching of i=i mappings, yippee

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

let minStartRangesForChunks = []
while (seeds.length) {
  const start = seeds.shift();
  const range = seeds.shift();
  let inputRanges = [{ start, end: start + range }]
  for (const layer of layerMappings) {
    let newInputRanges = []
    for (const inputRange of inputRanges) {
      newInputRanges.push(destinationRanges(inputRange, layer))
    }
    inputRanges = newInputRanges.flat();
  }
  minStartRangesForChunks.push(inputRanges.map(i => i.start))
}

console.log('Part 2:', Math.min(...minStartRangesForChunks.flat()))
