import { mfers } from "mfers";
import fs from 'fs-extra'
import NodeCanvas from 'canvas'
import sharp from 'sharp'
const { createCanvas, loadImage } = NodeCanvas

let locations = JSON.parse(fs.readFileSync('./trimmed/optimized-layers-traits.json'))


async function draw(i = 3664){

  let spritesheet = await loadImage('./trimmed/optimized-layers-smolsheet.png')


  const canvas = createCanvas(1000, 1000)
  const ctx = canvas.getContext('2d')

  let mfer = mfers[i]

  function insertLayer(category="",variant=""){
    let { og_x,og_y,x,y,w,h } = locations[category][variant]
    ctx.drawImage(spritesheet,x,y,w,h,og_x,og_y,w,h)
  }

  Object.keys(mfer.traits).forEach(trait_type => {
    let variant = mfer.traits[trait_type]
    if(trait_type == 'background'){
      let bg_colors = {
        red: '#ff7c7c',
        orange: '#ffba7a',
        yellow: '#ffe375',
        green: '#c7ff81',
        blue: '#7dd0ff',
      }
      if(variant == 'graveyard' || variant == 'tree' || variant == 'space'){
        insertLayer(trait_type,variant)
      } else {
        ctx.fillStyle = bg_colors[variant]
        ctx.fillRect(0,0,1000,1000)
      }
    } else if(trait_type == 'type') {
      insertLayer('setting','chair')
      insertLayer('setting','body')
      insertLayer('setting','sartoshi')
      insertLayer('heads',variant)
    } else {
      insertLayer(trait_type,variant)
    }
  })

  sharp(canvas.toBuffer('image/png'))
    .pipelineColorspace('rgb16')
    .withMetadata({ icc: 'p3'})
    .toFile(`./generated-mfer-${i}.png`)

}

draw(3664)
draw(4174)
draw(9617)