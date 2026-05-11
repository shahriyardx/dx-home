import sharp from "sharp"
import { readdirSync, renameSync } from "fs"
import { join, extname } from "path"

const bgDir = join(import.meta.dirname, "../public/backgrounds")
const files = readdirSync(bgDir)

for (const file of files) {
	const ext = extname(file).toLowerCase()
	if (![".png", ".jpg", ".jpeg"].includes(ext)) continue

	const input = join(bgDir, file)
	const tmp = join(bgDir, `_tmp_${file}`)

	let img = sharp(input)

	if (ext === ".png") {
		img = img.png({ compressionLevel: 9, quality: 85 })
	} else {
		img = img.jpeg({ quality: 80, mozjpeg: true })
	}

	await img.toFile(tmp)
	renameSync(tmp, input)
	console.log(`  compressed: ${file}`)
}

console.log("done")
