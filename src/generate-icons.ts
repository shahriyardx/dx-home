import sharp from "sharp"

const input = "./public/icon.png"
const outputDir = "./public/icon"
const sizes = [16, 32, 48, 96, 128]

for (const size of sizes) {
	const out = `${outputDir}/${size}.png`
	await sharp(input).resize(size, size).toFile(out)
	console.log(`✅ Generated ${out}`)
}