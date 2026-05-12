import sharp from "sharp"
import { readdirSync, copyFileSync } from "fs"
import { join, extname } from "path"

const srcDir = join(import.meta.dirname, "../backgrounds-raw")
const outDir = join(import.meta.dirname, "../public/backgrounds")
const files = readdirSync(srcDir)

for (const file of files) {
	const input = join(srcDir, file)
	const output = join(outDir, file)

	if (file === "peaks.png") {
		copyFileSync(input, output)
		console.log(`  copied: ${file}`)
		continue
	}
	const ext = extname(file).toLowerCase()
	if (![".png", ".jpg", ".jpeg"].includes(ext)) continue

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
