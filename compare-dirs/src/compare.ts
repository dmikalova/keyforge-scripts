import * as fs from "fs"
import * as path from "path"

function readFilesRecursively(dir: string) {
  const dirs: string[] = []
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      dirs.push(...readFilesRecursively(fullPath))
    } else if (stat.isFile()) {
      dirs.push(fullPath)
    }
  })
  return dirs
}

function removePrefix(dirs: string[], prefix: string) {
  for (let i = 0; i < dirs.length; i++) {
    dirs[i] = dirs[i].replace(prefix, "")
    dirs[i] = dirs[i].replace(".spec.js", ".js")
  }
  return dirs
}

const implPath = `${process.env.HOME}/Code/github.com/dmikalova/keyteki/server/game/cards/`
const implFiles = removePrefix(readFilesRecursively(implPath), implPath)

const testPath = `${process.env.HOME}/Code/github.com/dmikalova/keyteki/test/server/cards/`
const testFiles = removePrefix(readFilesRecursively(testPath), testPath)

const missingTests = implFiles.filter((f) => !testFiles.includes(f))
console.log(JSON.stringify(missingTests, null, 2))
