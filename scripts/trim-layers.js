import fs from 'fs-extra'
import path from 'path'
import { traits } from 'mfers'
import sharp from 'sharp'
import potpack from 'potpack';

trimLayers('optimized-layers')

async function trimLayers(type){
  let promises = []
  let boxes = []
  let files = await getFiles(type)
  files = files.filter(p => {
    if(p.includes('space') || p.includes('tree') || p.includes('graveyard')){ return true }
    return p.endsWith('.png') && !p.includes('background') && !p.includes('type')
  })
  files.forEach(p => {
    let output_p = `./trimmed/${p.replace('./','')}`
    fs.ensureFileSync(output_p)
    promises.push(
      sharp(p)
        .toBuffer()
        .then(buffer => {
          return getTrimmedInfo(buffer,output_p,boxes)
        })
    )
  })
  await Promise.all(promises)

  const {w, h, fill} = potpack(boxes);
  fs.writeFileSync(`./trimmed/${type}.json`,JSON.stringify({boxes,w,h,fill}))
  fs.writeFileSync(`./trimmed/${type}-traits.json`,JSON.stringify(clean_up_boxes_json(boxes,type),null,2))
}

function clean_up_boxes_json(boxes,type){
  let traits = {}
  boxes.forEach(({ p, og_x, og_y, x, y, w, h }) => {
    p = p.replace(`./trimmed/${type}/`,'').replace('.png','')
    let [category, variant] = p.split('/')
    category = category.replace('_',':')
    variant = variant.replace('--','/')
    if(!traits[category]){
      traits[category] = {}
    }
    traits[category][variant] = {og_x,og_y,x,y,w,h}
  })
  return traits
}


async function getFiles(dir) {
  const subdirs = await fs.readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await fs.stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []).map(s => s.replace(process.cwd(),'.'));
}

/**
 * Return bounding box information without outer transparent pixel
 * Until sharp implement an equivalent trimTransparent() effect.
 * @see https://github.com/lovell/sharp/issues/2166
 *
 * @param {import('sharp').Sharp} pipeline
 * @param {number} width
 * @param {number} height
 */

async function getTrimAlphaInfo(pipeline, width, height){
  return pipeline
   .ensureAlpha()
   .extractChannel(3)
   .toColourspace('b-w')
   .raw()
   .toBuffer()
   .then((data) => {
     let topTrim = 0;
     let bottomTrim = 0;
     let leftTrim = 0;
     let rightTrim = 0;
     let topStatus = true;
     let bottomStatus = true;
     let leftStatus = true;
     let rightStatus = true;

     let h = Math.ceil(height);
     const w = Math.ceil(width);

     for (let i = 0; i < h; i++) {
       for (let j = 0; j < width; j++) {
         if (topStatus && data[i * width + j] > 0) {
           topStatus = false;
         }
         if (bottomStatus && data[(height - i - 1) * width + j] > 0) {
           bottomStatus = false;
         }
         if (!topStatus && !bottomStatus) {
           break;
         }
       }
       if (!topStatus && !bottomStatus) {
         break;
       }
       if (topStatus) {
         topTrim += 1;
       }
       if (bottomStatus) {
         bottomTrim += 1;
       }
     }

     if (topTrim + bottomTrim >= height) {
       // console.log("Is empty image.");
       return {
         trimOffsetLeft: width * -1,
         trimOffsetTop: height * -1,
         width: 0,
         height: 0,
       };
     }

     h = height - bottomTrim;

     for (let i = 0; i < w; i++) {
       for (let j = topTrim; j < h; j++) {
         if (leftStatus && data[width * j + i] > 0) {
           leftStatus = false;
         }
         if (rightStatus && data[width * j + width - i - 1] > 0) {
           rightStatus = false;
         }
         if (!leftStatus && !rightStatus) {
           break;
         }
       }
       if (!leftStatus && !rightStatus) {
         break;
       }
       if (leftStatus) {
         leftTrim += 1;
       }
       if (rightStatus) {
         rightTrim += 1;
       }
     }

     return {
       trimOffsetLeft: leftTrim * -1,
       trimOffsetTop: topTrim * -1,
       width: width - leftTrim - rightTrim,
       height: height - topTrim - bottomTrim,
     };
   });
}
 

async function getTrimmedInfo(src,p,boxes){
  const image = sharp(src, {
    limitInputPixels: 500000000,
    failOnError: false,
  });
  const { width, height, hasAlpha } = await image.metadata();
  if (!hasAlpha) {
    return { width, height };
  }
  // If the image doesn't have an alpha layer this will fail.
  const info = await getTrimAlphaInfo(image, width, height);

  boxes.push({
    w: info.width,
    h: info.height,
    og_x: info.trimOffsetLeft * -1,
    og_y: info.trimOffsetTop * -1,
    p,
  })

  return await sharp(src, { })
    .pipelineColourspace('rgb16')
    .extract({
      left: info.trimOffsetLeft * -1,
      top: info.trimOffsetTop * -1,
      width: info.width,
      height: info.height,
    })
    .toFile(p)

};