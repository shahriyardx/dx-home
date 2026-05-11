import sharp from "sharp"
import { readdirSync, renameSync } from "fs"
import { join, extname } from "path"

const srcDir = join(import.meta.dirname, "../backgrounds-raw")
const outDir = join(import.meta.dirname, "../public/backgrounds")
const files = readdirSync(srcDir)

for (const file of files) {
	const ext = extname(file).toLowerCase()
	if (![".png", ".jpg", ".jpeg"].includes(ext)) continue

	const input = join(srcDir, file)
	const output = join(outDir, file)

	let img = sharp(input)

	if (ext === ".png") {
		img = img.png({ compressionLevel: 9, quality: 85 })
	} else {
		img = img.jpeg({ quality: 80, mozjpeg: true })
	}

	await img.toFile(output)
	console.log(`  compressed: ${file}`)
}

console.log("done")
