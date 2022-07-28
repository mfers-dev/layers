# mfer-layers

## install dependencies

```bash
npm install
```

## scripts

### Download layers

Run `node scripts/download-layers`.

Layers will be downloaded from IPFS and into a `original-layers` directory

### Trim layers

Run `node scripts/trim-layers`.

Layers will be trimmed to remove transparent edges

### Draw spritesheet

Run `node scripts/draw-spritesheet`.

Use the trimmed layers to generate a tightly packed spritesheet

### Compress spritesheet

Run `node scripts/compress-sprites`.

Compresses the spritesheet to use a palette of 256 colors

### Generate mfer from spritesheet

Run `node examples/draw-mfer`.

Uses the spritesheet to draw some mfers

## Notes

optimized-layers optimizations:
- trimmed random specks on edges of certain layers (pilot hat, shirts, hoodies)
- filled in semi-transparent section on long hair black 

colors are slightly inaccurate:
- original layers & mfers images are using display-p3 color space (wider gamut than srgb)
- performing image operations (with sharp & node-canvas) implicitly convert to srgb, so some rounding errors occur
- hopefully there is a fix for this eventually


[ipfs gateway](https://ipfs.io/ipfs/QmPe4dQyZfuyQuxYnoYxo3QSFnQzegHDVAohMxqvNvR3GF)

[announcement tweet](https://twitter.com/zhoug0x/status/1533650978435747840)