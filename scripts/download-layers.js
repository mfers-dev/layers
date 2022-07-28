import fs from 'fs-extra'
import https from 'https'
import { create } from 'ipfs-http-client';
import { traits } from 'mfers'

const root_hash = 'QmPe4dQyZfuyQuxYnoYxo3QSFnQzegHDVAohMxqvNvR3GF'
const ipfs_host = `https://ipfs.io/ipfs/`

download_layers_from_ipfs()

async function download_layers_from_ipfs() {
  let links = []
  let errors = []
  Object.keys(traits).forEach(trait_type => {
    if(trait_type != '1/1'){
      let variants = traits[trait_type]
      let paths = variants.map(v => `${root_hash}/${trait_type.replace(':','_')}/${v.replace('/','--')}.png`)
      links.push(...paths)
    }
  })
  await Promise.all(links.map(p => 
    https.get(`${ipfs_host}${p.replace('--','/')}`, (res) => {
      // rename ipfs hash to 'layers'
      if(res.statusCode != 200){
        errors.push(p)
      }
      p = p.replace(root_hash,'original-layers')
      fs.ensureFileSync(p)
      const writeStream = fs.createWriteStream(p);
      res.pipe(writeStream);
      return new Promise(cb => {
        writeStream.on("finish", () => {
          writeStream.close();
          console.log("Downloaded: " + p);
          cb()
        });
      })
    })
  ));
  if(errors.length > 0){
    console.log('failed downloads:')
    console.log(errors)
  }
}
