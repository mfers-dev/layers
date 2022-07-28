import fs from 'fs-extra'
import NodeCanvas from 'canvas'
import sharp from 'sharp'
const { createCanvas, loadImage } = NodeCanvas


function draw(){

  let types = ['optimized-layers']

  types.forEach(type => {
    const {boxes,w,h} = JSON.parse(fs.readFileSync(`./trimmed/${type}.json`))
    const canvas = createCanvas(w, h)
    const ctx = canvas.getContext('2d')
    Promise.all(boxes.map(async ({ p, w, h, x, y }) => {
      let img = await loadImage(p)
      ctx.drawImage(img,x,y,w,h)
    })).then(() => {
      sharp(canvas.toBuffer('image/png'))
        .withMetadata({ icc: 'p3'})
        .toFile(`./trimmed/${type}-spritesheet.png`)
    })
  })

}
draw()