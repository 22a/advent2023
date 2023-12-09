const fs = require('fs')

const chunks = fs.readFileSync('../input.txt', 'utf8').trim().split('\n\n')
const seeds = chunks.shift().split(": ")[1].trim().split(' ').map(Number)
const mappings = chunks.reduce((acc, chunk) => {
  const [name, value] = chunk.split(" map:\n")
  const mapping = value.trim().split('\n').map((map) => map.split(' ').map(Number));
  return { ...acc, [name]: mapping }
}, {});

const lookup = (id, map) => {
  if (map.cache && map.cache[id]) {
    return map.cache[id]
  }
  for (const [dest, source, length] of map) {
    if (id >= source && id <= source + length) {
      const offset = id - source;
      map.cache = map.cache || {};
      map.cache[id] = dest + offset;
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

const costs = []

while (seeds) {
  const start = seeds.shift();
  const range = seeds.shift();
  for (let i = start; i < start + range; i++) {
    costs.push(seedToLocation(i))
  }
}

console.log('Part 2:', Math.min(...costs))
