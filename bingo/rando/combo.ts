const housers = ['dis', 'logos', 'redemption', 'sanctum', 'saurian', 'shadows', 'star_alliance', 'untamed']

function getCombinations(arr: string[], k: number): string[][] {
  const results: string[][] = []
  function helper(start: number, combo: string[]) {
    if (combo.length === k) {
      results.push([...combo])
      return
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i])
      helper(i + 1, combo)
      combo.pop()
    }
  }
  helper(0, [])
  return results
}

const combos = getCombinations(housers, 3).filter(
  (combo) => !(combo.includes('sanctum') && combo.includes('redemption')),
)

console.log(combos)
console.log(combos.length)
const houseCounts = housers.reduce<Record<string, number>>((acc, house) => {
  acc[house] = combos.filter(combo => combo.includes(house)).length
  return acc
}, {})

console.log(houseCounts)
