import sharp from 'sharp'

let types = ['optimized-layers']
types.forEach(type => {
  sharp(`./trimmed/${type}-spritesheet.png`)
    .withMetadata({ icc: 'p3'})
    .png({
      compressionLevel: 9,
  
      colors: 256,
      effort: 10,
      dither: 0
    })
    .toFile(`./trimmed/${type}-smolsheet.png`)
})