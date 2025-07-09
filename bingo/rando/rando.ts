const l = 8
const m = 7

const houses = {
  dis: l,
  logos: l,
  redemption: m,
  sanctum: m,
  saurian: l,
  shadows: l,
  star_alliance: l,
  untamed: l,
}
  
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

function pickRandomHouses(houses: Record<string, number>, count: number = 3): string[] {
  const houseNames = Object.keys(houses)
  // Build a weighted pool
  const weightedPool: string[] = []
  for (const house of houseNames) {
    for (let i = 0; i < houses[house]; i++) {
      weightedPool.push(house)
    }
  }

  shuffleArray(weightedPool)

  const picked: string[] = []
  for (const house of weightedPool) {
    if (picked.includes(house)) continue
    if (
      (house === 'sanctum' && picked.includes('redemption')) ||
      (house === 'redemption' && picked.includes('sanctum'))
    ) {
      continue
    }
    picked.push(house)
    if (picked.length === count) break
  }

  return picked
}

const results: Record<string, number> = {}
const n = 100000000
// const n = 5750

for (let i = 0; i < n; i++) {
  const picked = pickRandomHouses(houses)
  for (const house of picked) {
    results[house] = (results[house] || 0) + 1
  }
  // console.log(picked)
}

console.log('Results after', n, 'runs:')
console.log('House         | Count   | Percentage')
console.log('--------------|---------|-----------')
for (const house of Object.keys(houses)) {
  const count = results[house] || 0
  const percentage = ((count / n) * 100).toFixed(2)
  console.log(house.padEnd(13) + ' | ' + String(count).padEnd(7) + ' | ' + percentage.padEnd(9) + '%')
}
