import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

/**
 * Vite plugin that updates og:image and twitter:image meta tags
 * to point to the app's opengraph image with the correct Replit domain.
 */
export function metaImagesPlugin(): Plugin {
  return {
    name: 'vite-plugin-meta-images',
    transformIndexHtml(html) {
      const baseUrl = getDeploymentUrl();
      if (!baseUrl) {
        log('[meta-images] no Replit deployment domain found, skipping meta tag updates');
        return html;
      }

      // Check if opengraph image exists in public directory
      const publicDir = path.resolve(process.cwd(), 'client', 'public');
      const ogImagePath = path.join(publicDir, 'og-image.png');
      const opengraphPngPath = path.join(publicDir, 'opengraph.png');
      const opengraphJpgPath = path.join(publicDir, 'opengraph.jpg');
      const opengraphJpegPath = path.join(publicDir, 'opengraph.jpeg');

      let imageName: string | null = null;
      if (fs.existsSync(ogImagePath)) {
        imageName = 'og-image.png';
      } else if (fs.existsSync(opengraphPngPath)) {
        imageName = 'opengraph.png';
      } else if (fs.existsSync(opengraphJpgPath)) {
        imageName = 'opengraph.jpg';
      } else if (fs.existsSync(opengraphJpegPath)) {
        imageName = 'opengraph.jpeg';
      }

      if (!imageName) {
        log('[meta-images] OpenGraph image not found, skipping meta tag updates');
        return html;
      }

      const imageUrl = `${baseUrl}/${imageName}`;

      log('[meta-images] updating meta image tags to:', imageUrl);

      html = html.replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/g,
        `<meta property="og:image" content="${imageUrl}" />`
      );

      html = html.replace(
        /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/g,
        `<meta name="twitter:image" content="${imageUrl}" />`
      );

      return html;
    },
  };
}

function getDeploymentUrl(): string | null {
  // For production deployment, use the custom domain
  if (process.env.PRODUCTION_DOMAIN) {
    const url = process.env.PRODUCTION_DOMAIN.startsWith('http') 
      ? process.env.PRODUCTION_DOMAIN 
      : `https://${process.env.PRODUCTION_DOMAIN}`;
    log('[meta-images] using production domain:', url);
    return url;
  }

  // For Replit deployment (publishing via Replit)
  if (process.env.REPLIT_INTERNAL_APP_DOMAIN) {
    const url = `https://${process.env.REPLIT_INTERNAL_APP_DOMAIN}`;
    log('[meta-images] using internal app domain:', url);
    return url;
  }

  // Skip updating for development to preserve hardcoded production URLs
  if (process.env.REPLIT_DEV_DOMAIN) {
    log('[meta-images] dev environment - not modifying URLs to preserve production settings');
    return null;
  }

  return null;
}

function log(...args: any[]): void {
  if (process.env.NODE_ENV === 'production') {
    console.log(...args);
  }
}
