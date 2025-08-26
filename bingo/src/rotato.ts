const spawn = require('cross-spawn')

const io = {stdio: ['inherit', 'inherit', 'inherit']}
const wolves = ['blep', 'cool', 'grrr']
const imageSize = 1500
const offset = imageSize / 2 - imageSize / 10
let gen: boolean = false
gen = true

const outputs: Record<(typeof wolves)[number], string[]> = {
  cool: [],
  grrr: [],
  blep: [],
}
for (const wolf of wolves) {
  for (let i = 0; i <= 71; i++) {
    const out = `./rotato/${wolf}-${String(i).padStart(2, '0')}.png`
    if (gen) {
      // magick blep-000.png -virtual-pixel none -distort SRT -040 -page +200+200 -background none -flatten blep-000t.png
      const randomX = Math.floor(Math.random() * (2 * offset)) - offset
      const randomY = Math.floor(Math.random() * (2 * offset)) - offset

      let args = []
      args.push(...[`PNG32:./${wolf}.png`])
      args.push(...['-virtual-pixel', 'none'])
      args.push(...['-distort', 'SRT', `${i * 10}`])
      args.push(...['-page', `+${randomX}+${randomY}`])
      args.push(...['-background', 'none'])
      args.push(...['-flatten'])
      args.push(...[`PNG32:${out}`])
      spawn.sync('magick', args, io)
    }
    outputs[wolf].push(out)
  }
}

// Randomize the outputs array
for (const key of Object.keys(outputs)) {
  const array = outputs[key]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

const interleaved: string[] = []
const maxLength = Math.max(...Object.values(outputs).map((arr) => arr.length))
for (let i = 0; i < maxLength; i++) {
  for (const key of Object.keys(outputs)) {
    if (outputs[key][i]) {
      interleaved.push(outputs[key][i])
    }
  }
}

interleaved.splice(150)
interleaved.shift()
interleaved.pop()

let args = []
args.push(...['-dispose', 'none'])
args.push(...['-gravity', 'center'])
args.push(...['-delay', '50', `./cool.png`])
args.push(...['-delay', '5'], ...interleaved)
args.push(...['-delay', '200', `./blep.png`])
args.push(...['-loop', '0'])
args.push(...['stamp.gif'])
spawn.sync('magick', args, io)

// 2884 6188 6449
