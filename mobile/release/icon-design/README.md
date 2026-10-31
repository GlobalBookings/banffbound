# BanffBound icon artwork

The selected icon uses snow-white alpine peaks, glacial turquoise water and a warm gold sun against the existing forest-green palette. The 60 px preview preserves the mountain, lake and sun as distinct shapes. The square artwork has no text, frame or baked-in corner mask.

`../../assets/brand/icon-master.png` is the original generated opaque artwork. `../../assets/brand/icon-foreground.png` is a second built-in image generation edit that removed its background for Android and splash exports. The exact prompts are saved beside this file. These masters are stored in the project so icon exports are reproducible without calling an image service.

Run `python3 mobile/scripts/create-assets.py` from the repository root to export the 1024 px RGB iOS icon, 1024 px transparent adaptive foreground, 256 px RGB favicon and 512 px transparent splash foreground. This performs only Lanczos resizing and transparent canvas compositing. The Android foreground uses 64% of the canvas for system masking; the existing app configuration supplies its forest-green background. Editorial photos are preserved unless `--refresh-editorial` is explicitly requested.

The built-in image generation tool created the artwork. No third-party logo, stock photo, remote image API or local image model was used. `provenance.json` records both original generated-file hashes and exported hashes. The original generated files remain in Codex's generated-images directory, and both chosen masters are copied into this project.

`preview-60.png`, `preview-120.png` and `preview-256.png` are technical size previews. `adaptive-icon-on-green.png` and `splash-on-green.png` show the transparent exports on the existing background. These are artwork previews, not simulator or physical-device screenshots. A fresh native build is needed to see the new icon installed on a device; this icon-only task did not build, upload or replace the submitted app.
