# mfer-layers

## install dependencies

```bash
npm install
```

## scripts

### Download layers

Run `node download-layers`.

Layers will be downloaded from IPFS and into a `original-layers` directory

### Trim layers

Run `node trim-layers`.

Layers will be trimmed to remove transparent edges

### Draw spritesheet

Run `node draw-spritesheet`.

Use the trimmed layers to generate a tightly packed spritesheet

### Compress spritesheet

Run `node compress-sprites`.

Compresses the spritesheet to use a palette of 256 colors

## Notes

optimized-layers optimizations:
- trimmed random specks on edges of certain layers (pilot hat, shirts, hoodies)
- filled in semi-transparent section on long hair black 