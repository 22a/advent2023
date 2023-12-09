const fs = require('fs')

const chunks = fs.readFileSync('../input.tst', 'utf8').trim().split('\n\n')
const seeds = chunks.shift().split(": ")[1].trim().split(' ').map(Number)
const mappings = chunks.reduce((acc, chunk) => {
  const [name, value] = chunk.split(" map:\n")
  const mapping = value.trim().split('\n').map((map) => map.split(' ').map(Number));
  return { ...acc, [name]: mapping }
}, {});

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
  // Seed 79, soil 81, fertilizer 81, water 81, light 74, temperature 78, humidity 78, location 82.
  let scratch = seed;
  for (const map of Object.values(mappings)) {
    scratch = lookup(scratch, map)
  }
  return scratch;
}

console.log('Part 1:', Math.min(...seeds.map(seedToLocation)))

// i guess pojos preserve insertion order?
const bottomUpMappings = Object.entries(mappings).reverse();

let restrictions = { bottom: null, top: null }
for (const [name, mapping] of bottomUpMappings) {
  const cheapestValidRange = mapping.reduce((acc, [dest, source, range]) => {
    const rangeisValid = restrictions.bottom !== undefined
      && dest >= restrictions.bottom
      && dest <= restrictions.top;
    if (rangeisValid && acc[0] > dest) {
      return [dest, source, range]
    } else {
      return acc
    }
  }, [Infinity, null, null])
  if (cheapestValidRange[0] === Infinity) {
    throw new Error(`we fucked up on mapping ${name}`)
  }
  restrictions.bottom = cheapestValidRange[1];
  restrictions.top = cheapestValidRange[1] + cheapestValidRange[2];
  console.log({ restrictions })
}
