Drop the app icon here as `icon.ico` (256x256, Windows ICO format).

This file is referenced by package.json -> build.win.icon ("build/icon.ico").
Until you add a real icon, electron-builder uses the default Electron icon.

House style: navy #0c1a2e + orange #ED6A1C. A simple "VV" monogram or the
Van Vliet mark on a navy rounded square works well at 256x256.

Tip: keep a 256x256 PNG named icon.png alongside it too — handy for Linux/macOS
builds and for converting to .ico (e.g. https://icoconvert.com or ImageMagick:
`magick icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`).
