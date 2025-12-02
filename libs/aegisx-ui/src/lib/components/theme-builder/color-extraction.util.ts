/**
 * Color Extraction Utility
 * Extracts dominant colors from images using Canvas API
 */

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface ExtractedPalette {
  dominant: string; // Hex color
  colors: string[]; // Top 5 colors in hex
  rgbColors: RGBColor[]; // RGB values
}

/**
 * Extract image data from File or URL
 */
export async function extractImageData(
  source: File | string,
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDimension = 100; // Smaller size for faster processing
      const scale = Math.min(
        maxDimension / img.width,
        maxDimension / img.height,
      );

      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      img.src = URL.createObjectURL(source);
    }
  });
}

/**
 * Extract dominant colors from image
 */
export async function extractDominantColors(
  source: File | string,
  colorCount: number = 5,
): Promise<ExtractedPalette> {
  const imageData = await extractImageData(source);
  const data = imageData.data;
  const colors: RGBColor[] = [];

  // Sample pixels from the image (skip some for performance)
  const sampleRate = 4; // Sample every 4th pixel
  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    colors.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
    });
  }

  // Cluster colors using simple k-means
  const dominantColors = kmeans(colors, Math.min(colorCount, 10));

  // Convert to hex and sort by frequency
  const hexColors = dominantColors
    .map((c) => colorToHex(c))
    .filter((hex) => hex.length === 7); // Valid hex colors

  // Remove near-duplicates (similar colors)
  const uniqueColors = removeSimilarColors(hexColors, 20);

  return {
    dominant: uniqueColors[0] || '#6366f1',
    colors: uniqueColors.slice(0, colorCount),
    rgbColors: dominantColors,
  };
}

/**
 * Simple k-means clustering for color grouping
 */
function kmeans(
  colors: RGBColor[],
  k: number,
  iterations: number = 3,
): RGBColor[] {
  if (colors.length === 0) return [];
  if (colors.length <= k) return colors;

  // Initialize centroids with random colors
  let centroids = getRandomSample(colors, k);

  for (let iter = 0; iter < iterations; iter++) {
    // Assign colors to nearest centroid
    const clusters: RGBColor[][] = Array(k)
      .fill(null)
      .map(() => []);

    for (const color of colors) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      for (let i = 0; i < centroids.length; i++) {
        const distance = colorDistance(color, centroids[i]);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      clusters[nearestIndex].push(color);
    }

    // Update centroids
    centroids = clusters.map((cluster) => {
      if (cluster.length === 0) return centroids[0];
      return {
        r: Math.round(
          cluster.reduce((sum, c) => sum + c.r, 0) / cluster.length,
        ),
        g: Math.round(
          cluster.reduce((sum, c) => sum + c.g, 0) / cluster.length,
        ),
        b: Math.round(
          cluster.reduce((sum, c) => sum + c.b, 0) / cluster.length,
        ),
      };
    });
  }

  return centroids;
}

/**
 * Calculate Euclidean distance between two RGB colors
 */
function colorDistance(c1: RGBColor, c2: RGBColor): number {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Get random sample from array
 */
function getRandomSample<T>(arr: T[], k: number): T[] {
  const sample = [...arr].sort(() => Math.random() - 0.5);
  return sample.slice(0, k);
}

/**
 * Convert RGB to Hex
 */
export function colorToHex(color: RGBColor | [number, number, number]): string {
  const r = Array.isArray(color) ? color[0] : color.r;
  const g = Array.isArray(color) ? color[1] : color.g;
  const b = Array.isArray(color) ? color[2] : color.b;

  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
      .toUpperCase()
  );
}

/**
 * Convert Hex to RGB
 */
export function hexToColor(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(color: RGBColor): HSLColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(color: HSLColor): RGBColor {
  const h = color.h / 360;
  const s = color.s / 100;
  const l = color.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Generate color palette from base color (different shades)
 */
export function generateColorShades(
  baseHex: string,
  shadeCount: number = 10,
): string[] {
  const rgb = hexToColor(baseHex);
  const hsl = rgbToHsl(rgb);
  const shades: string[] = [];

  // Generate shades from light (90%) to dark (10%)
  for (let i = 0; i < shadeCount; i++) {
    const lightness = 90 - (i / (shadeCount - 1)) * 80; // 90 to 10
    const shade = hslToRgb({
      h: hsl.h,
      s: hsl.s,
      l: lightness,
    });
    shades.push(colorToHex(shade));
  }

  return shades;
}

/**
 * Remove similar colors (within threshold distance)
 */
function removeSimilarColors(
  hexColors: string[],
  threshold: number = 30,
): string[] {
  const unique: string[] = [];
  const rgbColors = hexColors.map(hexToColor);

  for (const color of rgbColors) {
    let isSimilar = false;

    for (const uniqueColor of unique.map(hexToColor)) {
      if (colorDistance(color, uniqueColor) < threshold) {
        isSimilar = true;
        break;
      }
    }

    if (!isSimilar) {
      unique.push(colorToHex(color));
    }
  }

  return unique;
}

/**
 * Get file as data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
