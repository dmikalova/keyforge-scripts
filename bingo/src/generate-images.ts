const spawn = require('cross-spawn')
import fs from 'fs'
import path from 'path'
import data from './data'

// prepare dir
const io = {stdio: ['inherit', 'inherit', 'inherit']}

// prepare spots data
let gen = false
// gen = true
const boardCount = 10
const spots = data.spots.map((spot, i) => ({...spot, id: i.toString().padStart(4, '0')}))
const squareSize = 512
const margin = 25
const border = 5
const textSize = squareSize - margin * 2 - border * 2
const backgroundSize = textSize - 25
const cardSize = squareSize * 6

if (gen) {
  spawn.sync('rm', ['-rf', './squares', './assets-resized', './cards'], io)
  spawn.sync('mkdir', ['./squares', './assets-resized', './cards'], io)
}

// blank background
if (gen) {
  let args = []
  args.push(...['-size', `${textSize}x${textSize}`])
  args.push(...['canvas:transparent'])
  args.push(...[`PNG32:./assets-resized/canvas.png`])
  spawn.sync('magick', args, io)

  // resize assets
  fs.readdirSync(path.join(__dirname, '../', 'assets', 'square-backgrounds'))
    .filter((file) => file.endsWith('.png'))
    .forEach((file) => {
      const filepath = path.join(__dirname, '../', 'assets', 'square-backgrounds', file)

      // resize smaller than canvas
      let args = []
      args.push(...[filepath])
      args.push(...['-resize', `${backgroundSize}x${backgroundSize}`])
      args.push(...['-channel', 'A', '-evaluate', 'multiply', '0.10', '+channel'])
      args.push(...[`./assets-resized/${file}`])

      spawn.sync('magick', args, io)

      // merge onto canvas
      args = []
      args.push(...['composite'])
      args.push(...['-colorspace', 'sRGB'])
      args.push(...['-gravity', 'center'])
      args.push(...[`./assets-resized/${file}`])
      args.push(...[`./assets-resized/canvas.png`])
      args.push(...[`./assets-resized/${file}`])

      spawn.sync('magick', args, io)
    })

  function generateSquares() {
    spots.forEach((spot) => {
      let outpath = `./squares/${spot.id}.png`

      // generate text
      let args = []
      args.push(...['-background', 'none'])
      args.push(...['-gravity', 'center'])
      args.push(...['-font', 'TeutonFett'])
      args.push(...['-size', `${textSize}x${textSize}`])
      args.push(...[`caption:${spot.text}`])
      args.push(...[outpath])

      spawn.sync('magick', args, io)

      // add background
      if (spot.background) {
        args = []
        args.push(...['composite'])
        args.push(...['-size', `${textSize}x${textSize}`])
        args.push(...['-colorspace', 'sRGB'])
        args.push(...['-gravity', 'center'])
        args.push(...[outpath])
        args.push(...[`./assets-resized/${spot.background}.png`])
        args.push(...[outpath])

        spawn.sync('magick', args, io)
      }

      // add border
      args = []
      args.push(...[outpath])
      args.push(...['-size', `${textSize}x${textSize}`])
      args.push(...['-bordercolor', 'white', '-border', margin])
      args.push(...['-bordercolor', 'gold1', '-border', border])
      args.push(...[outpath])

      spawn.sync('magick', args, io)
    })
  }

  generateSquares()
}

// generate board

// title 6*512: unofficial keyforge bingo
// keys on top
// rules on bottom

function generateBoard(index: number) {
  let spotsCopy = [...spots]

  function generateRow(index: number, impossible: number) {
    const row = []
    // Add two "easy" spots to the row
    for (let i = 0; i < 2; i++) {
      const easySpots = spotsCopy.filter((spot) => spot.difficulty === 'easy')
      const randomIndexEasy = Math.floor(Math.random() * easySpots.length)
      const randomSpotEasy = easySpots.splice(randomIndexEasy, 1)[0]
      spotsCopy.splice(spotsCopy.indexOf(randomSpotEasy), 1) // Remove from original spots array
      row.push(randomSpotEasy)

      // Remove all spots with the same category
      if (randomSpotEasy.category) {
        spotsCopy = spotsCopy.filter((spot) => spot.category !== randomSpotEasy.category)
      }
    }

    // Add two "medium" spots to the row
    for (let i = 0; i < 2; i++) {
      const mediumSpots = spotsCopy.filter((spot) => spot.difficulty === 'medium')
      const randomIndexMedium = Math.floor(Math.random() * mediumSpots.length)
      const randomSpotMedium = mediumSpots.splice(randomIndexMedium, 1)[0]
      spotsCopy.splice(spotsCopy.indexOf(randomSpotMedium), 1) // Remove from original spots array
      row.push(randomSpotMedium)

      // Remove all spots with the same category
      if (randomSpotMedium.category) {
        spotsCopy = spotsCopy.filter((spot) => spot.category !== randomSpotMedium.category)
      }
    }

    // Add one "hard" or "impossible" spot to the row
    let difficulty = 'hard'
    if (impossible === index) {
      difficulty = 'impossible'
    }
    const hardSpots = spotsCopy.filter((spot) => spot.difficulty === difficulty)
    const randomIndexHard = Math.floor(Math.random() * hardSpots.length)
    const randomSpotHard = hardSpots.splice(randomIndexHard, 1)[0]
    spotsCopy.splice(spotsCopy.indexOf(randomSpotHard), 1) // Remove from original spots array
    row.push(randomSpotHard)
    // Remove all spots with the same category
    if (randomSpotHard.category) {
      spotsCopy = spotsCopy.filter((spot) => spot.category !== randomSpotHard.category)
    }

    // Shuffle the row
    for (let i = row.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[row[i], row[j]] = [row[j], row[i]]
    }

    // Add one "free" spot to the row
    const freeSpots = spots.filter((spot) => spot.difficulty === 'free')
    const randomIndexFree = Math.floor(Math.random() * freeSpots.length)
    const randomSpotFree = freeSpots.splice(randomIndexFree, 1)[0]
    spotsCopy.splice(spots.indexOf(randomSpotFree), 1) // Remove from original spots array
    row.splice(index, 0, randomSpotFree)

    return row
  }

  let impossible = -1
  if (Math.random() < 0.333) {
    impossible = Math.floor(Math.random() * 6)
  }

  let rows = [
    generateRow(0, impossible),
    generateRow(1, impossible),
    generateRow(2, impossible),
    generateRow(3, impossible),
    generateRow(4, impossible),
    generateRow(5, impossible),
  ]
  // Shuffle the rows
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[rows[i], rows[j]] = [rows[j], rows[i]]
  }
  const flattenedRows = rows.flat()

  let args = []
  args.push(...['montage'])
  args.push(...flattenedRows.map((spot) => `./squares/${spot.id}.png`))
  args.push(...['-tile', '6x6'])
  args.push(...['-geometry', `${squareSize}x${squareSize}+0+0`])
  args.push(...[`./cards/card${index.toString().padStart(4, '0')}.png`])
  spawn.sync('magick', args, io)

  // args = []
  // args.push(...[`./cards/card${index.toString().padStart(4, '0')}.png`])
  // args.push(...['-bordercolor', 'gold1', '-border', border])
  // args.push(...[`./cards/card${index.toString().padStart(4, '0')}.png`])
  // spawn.sync('magick', args, io)
}

if (gen) {
  for (let i = 0; i < boardCount; i++) {
    generateBoard(i)
  }
}

// resize logo and make canvas
let args = []
args.push(...['./assets/kf-logo-flat.png'])
args.push(...['-resize', `x${backgroundSize}`])
args.push(...[`./assets-resized/kf-logo-flat.png`])
spawn.sync('magick', args, io)

args = []
args.push(...['./assets/kf-logo.png'])
args.push(...['-resize', `x${backgroundSize}`])
args.push(...[`./assets-resized/kf-logo.png`])
spawn.sync('magick', args, io)

args = []
args.push(...['-size', `${cardSize - border * 2}x${squareSize - border * 2}`])
args.push(...['canvas:transparent'])
args.push(...[`PNG32:./assets-resized/canvas-title.png`])
spawn.sync('magick', args, io)

function generateTitle(index: number) {
  // prefix
  const prefixes = data.title.prefixes
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]

  const xFactor = 3
  const yFactor = 3

  let args = []
  args.push(...['-background', 'none'])
  args.push(...['-gravity', 'center'])
  args.push(...['-font', 'TeutonFett'])
  args.push(...['-size', `${cardSize / xFactor}x${squareSize / yFactor}`])
  args.push(...[`caption:The ${prefix}`])
  args.push(...[`./cards/prefix${index.toString().padStart(4, '0')}.png`])

  spawn.sync('magick', args, io)

  // suffix
  const suffixes = data.title.suffixes
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]

  args = []
  args.push(...['-background', 'none'])
  args.push(...['-gravity', 'center'])
  args.push(...['-font', 'TeutonFett'])
  args.push(...['-size', `${cardSize / xFactor}x${squareSize / yFactor}`])
  args.push(...[`label:${suffix}`])
  args.push(...[`./cards/suffix${index.toString().padStart(4, '0')}.png`])
  spawn.sync('magick', args, io)

  // Randomly pick from an array of 2 items
  const logos = [`./assets-resized/kf-logo.png`, `./assets-resized/kf-logo-flat.png`]
  const randomLogo = logos[Math.floor(Math.random() * logos.length)]

  args = []
  args.push(...['-gravity', 'center'])
  args.push(...['-colorspace', 'sRGB'])
  args.push(...[`./assets-resized/canvas-title.png`])
  args.push(...[randomLogo, `-geometry`, `+0+0`, `-composite`])
  args.push(...[`./cards/prefix${index.toString().padStart(4, '0')}.png`, `-geometry`, `-800-150`, `-composite`])
  args.push(...[`./cards/suffix${index.toString().padStart(4, '0')}.png`, `-geometry`, `+500+150`, `-composite`])
  args.push(...[`./cards/title${index.toString().padStart(4, '0')}.png`])
  spawn.sync('magick', args, io)

  // add border
  args = []
  args.push(...[`./cards/title${index.toString().padStart(4, '0')}.png`])
  args.push(...['-bordercolor', 'white', '-border', 0])
  args.push(...['-bordercolor', 'gold1', '-border', border])
  args.push(...[`./cards/title${index.toString().padStart(4, '0')}.png`])
  spawn.sync('magick', args, io)
}

// if (gen) {
for (let i = 0; i < boardCount; i++) {
  generateTitle(i)
}
// }

// put it all together

function assembleCard(index: number) {
  let args = []
  args.push(...[`./cards/title${index.toString().padStart(4, '0')}.png`])
  args.push(...[`./cards/card${index.toString().padStart(4, '0')}.png`])
  args.push(...['-append'])
  args.push(...[`./cards/board${index.toString().padStart(4, '0')}.png`])
  spawn.sync('magick', args, io)

  // add border
  args = []
  args.push(...[`./cards/board${index.toString().padStart(4, '0')}.png`])
  args.push(...['-bordercolor', 'white', '-border', 0])
  args.push(...['-bordercolor', 'gold1', '-border', border])
  args.push(...[`./cards/board${index.toString().padStart(4, '0')}.png`])
  spawn.sync('magick', args, io)
}

// if (gen) {
for (let i = 0; i < boardCount; i++) {
  assembleCard(i)
}
// }
