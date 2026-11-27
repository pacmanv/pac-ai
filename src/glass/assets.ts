export const SHARP = new URL('../assets/greenhouse.webp', import.meta.url).href
export const FOG = new URL('../assets/greenhouse-fog.webp', import.meta.url).href

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`failed to load ${src}`))
    img.src = src
  })
}

/** Both photographs, plus the serif the fog writing is rasterised in. */
export function loadGlassAssets(): Promise<[HTMLImageElement, HTMLImageElement, unknown]> {
  return Promise.all([
    loadImage(SHARP),
    loadImage(FOG),
    document.fonts?.load('italic 100px "Instrument Serif"').catch(() => null),
  ])
}
