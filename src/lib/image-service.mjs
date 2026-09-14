/**
 * Project image service for `astro:assets`.
 *
 * The market page is rendered on demand by the Cloudflare Worker, and a Worker
 * has no native image pipeline. Instead of transforming images at request time,
 * this service resolves every `src`/`srcset` entry to a deterministic static
 * path that `scripts/build-images.mjs` produces ahead of the build:
 *
 *     src/assets/gallery/damnoen-saduak-floating-market-1.jpg
 *       -> /gallery/damnoen-saduak-floating-market-1-480.webp  (480w)
 *       -> /gallery/damnoen-saduak-floating-market-1-960.webp  (960w)
 *       -> /gallery/damnoen-saduak-floating-market-1-1440.webp (1440w)
 *       -> same widths as .jpg, used as the <img> fallback
 *
 * Because the service exposes no `transform()` it is treated as a non-local
 * service, so `getURL()` is used verbatim in dev, in prerendered pages and in
 * the on-demand Worker alike - identical output, zero runtime cost.
 */

const DEFAULT_OUTPUT_FORMAT = 'webp';
const DEFAULT_HASH_PROPS = ['width', 'height', 'format', 'quality'];
const VALID_SUPPORTED_FORMATS = ['avif', 'jpg', 'jpeg', 'png', 'tiff', 'webp', 'gif', 'svg'];
const OUTPUT_EXTENSIONS = { jpeg: 'jpg', jpg: 'jpg', webp: 'webp', avif: 'avif', png: 'png' };

const isESMImportedImage = (src) =>
  typeof src === 'object' && src !== null && 'src' in src && 'width' in src && 'height' in src && 'format' in src;

function getTargetDimensions(options) {
  let targetWidth = options.width;
  let targetHeight = options.height;
  if (isESMImportedImage(options.src)) {
    const aspectRatio = options.src.width / options.src.height;
    if (targetHeight && !targetWidth) {
      targetWidth = Math.round(targetHeight * aspectRatio);
    } else if (targetWidth && !targetHeight) {
      targetHeight = Math.round(targetWidth / aspectRatio);
    } else if (!targetWidth && !targetHeight) {
      targetWidth = options.src.width;
      targetHeight = options.src.height;
    }
  }
  return { targetWidth, targetHeight };
}

/** `damnoen-saduak-floating-market-1` for both dev and hashed build inputs. */
function slugOf(src) {
  const raw = src.fsPath || src.src || '';
  const file = String(raw).split(/[\\/]/).pop() || '';
  return file
    .replace(/\.[^.]+$/, '')
    .replace(/\.[A-Za-z0-9_-]{8}$/, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

const imageService = {
  propertiesToHash: DEFAULT_HASH_PROPS,

  validateOptions(options) {
    if (isESMImportedImage(options.src) && options.src.format === 'svg') {
      options.format = 'svg';
    }
    if (!options.src || (!isESMImportedImage(options.src) && typeof options.src !== 'string')) {
      throw new Error(`[image-service] Unsupported image source: ${JSON.stringify(options.src)}`);
    }
    if (isESMImportedImage(options.src) && !VALID_SUPPORTED_FORMATS.includes(options.src.format)) {
      throw new Error(`[image-service] Unsupported source format "${options.src.format}".`);
    }
    if (!options.format) {
      options.format = DEFAULT_OUTPUT_FORMAT;
    }
    if (options.width) options.width = Math.round(options.width);
    if (options.height) options.height = Math.round(options.height);
    if (options.layout && options.width && options.height) {
      options.fit ??= 'cover';
      delete options.layout;
    }
    if (options.fit === 'none') {
      delete options.fit;
    }
    return options;
  },

  getHTMLAttributes(options) {
    const { targetWidth, targetHeight } = getTargetDimensions(options);
    const {
      src,
      width,
      height,
      format,
      quality,
      densities,
      widths,
      formats,
      layout,
      priority,
      fit,
      position,
      background,
      ...attributes
    } = options;
    return {
      ...attributes,
      width: targetWidth,
      height: targetHeight,
      loading: attributes.loading ?? 'lazy',
      decoding: attributes.decoding ?? 'async',
    };
  },

  getSrcSet(options) {
    const { targetWidth, targetHeight } = getTargetDimensions(options);
    const aspectRatio = targetWidth / targetHeight;
    const targetFormat = options.format ?? DEFAULT_OUTPUT_FORMAT;
    let imageWidth = options.width;
    let maxWidth = Infinity;
    if (isESMImportedImage(options.src)) {
      imageWidth = options.src.width;
      maxWidth = imageWidth;
    }
    let transformedWidths = (options.widths ?? []).slice().sort((a, b) => a - b);
    if (transformedWidths.length > 0 && transformedWidths[transformedWidths.length - 1] > maxWidth) {
      transformedWidths = transformedWidths.filter((width) => width <= maxWidth);
      transformedWidths.push(maxWidth);
    }
    transformedWidths = Array.from(new Set(transformedWidths));

    const { width: _w, height: _h, ...transformWithoutDimensions } = options;

    let allWidths = [];
    if (options.densities) {
      const densityValues = options.densities.map((density) =>
        typeof density === 'number' ? density : parseFloat(density),
      );
      const densityWidths = densityValues
        .slice()
        .sort((a, b) => a - b)
        .map((density) => Math.round(targetWidth * density));
      allWidths = densityWidths.map((width, index) => ({
        width,
        descriptor: `${densityValues[index]}x`,
      }));
    } else if (transformedWidths.length > 0) {
      allWidths = transformedWidths.map((width) => ({ width, descriptor: `${width}w` }));
    }

    return allWidths.map(({ width, descriptor }) => {
      const height = Math.round(width / aspectRatio);
      return {
        transform: { ...transformWithoutDimensions, width, height },
        descriptor,
        attributes: { type: `image/${targetFormat}` },
      };
    });
  },

  getURL(options) {
    // Remote sources are passed through untouched; this project only ships
    // local gallery assets.
    if (!isESMImportedImage(options.src)) {
      return String(options.src);
    }
    const format = options.format ?? DEFAULT_OUTPUT_FORMAT;
    const extension = OUTPUT_EXTENSIONS[format] ?? format;
    const width = options.width ?? options.src.width;
    return `/gallery/${slugOf(options.src)}-${width}.${extension}`;
  },

  parseURL() {
    return undefined;
  },
};

export default imageService;
