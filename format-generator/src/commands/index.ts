import select from '@inquirer/select'
import { Command, ux } from '@oclif/core'

import formats from '../kf/formats.js'

export class MyCommand extends Command {
  async run() {
    console.log(formats)
    // just prompt for input
    // const answer = await input({message: 'Enter your name'})
    const answer = await select({
      choices: formats.map((format) => {
        description: `The format ${format}`,
        name: format,
        value: format,
      }
      //  [
      //   {
      //     description: 'npm is the most popular package manager',
      //     name: 'npm',
      //     value: 'npm',
      //   },
      //   {
      //     description: 'yarn is an awesome package manager',
      //     name: 'yarn',
      //     value: 'yarn',
      //   },
      //   new Separator(),
      //   {
      //     disabled: true,
      //     name: 'jspm',
      //     value: 'jspm',
      //   },
      //   {
      //     disabled: '(pnpm is not available)',
      //     name: 'pnpm',
      //     value: 'pnpm',
      //   },
      // ],
      message: 'Select a package manager',
    })

    const name = await ux.prompt('What is your name?')

    // mask input after enter is pressed
    const secondFactor = await ux.prompt('What is your two-factor token?', {type: 'mask'})

    // hide input while typing
    const password = await ux.prompt('What is your password?', {type: 'hide'})

    this.log(`You entered: ${name}, ${secondFactor}, ${password}, ${answer}`)
  }
}
