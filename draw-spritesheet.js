import fs from 'fs-extra'
import NodeCanvas from 'canvas'
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
      fs.writeFileSync(`./trimmed/${type}-spritesheet.png`, canvas.toBuffer('image/png'))
    })
  })

}

draw()