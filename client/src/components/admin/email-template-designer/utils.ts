import { EmailBlock, GlobalStyles, defaultGlobalStyles } from './types';

export function generateId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function renderBlockToHtml(block: EmailBlock, globalStyles: GlobalStyles): string {
  const { type, content, styles } = block;
  
  const getStyle = (key: keyof typeof styles, fallback?: string): string => {
    return styles[key] || fallback || '';
  };

  const bgColor = getStyle('backgroundColor', 'transparent');
  const textColor = getStyle('textColor', globalStyles.textColor);
  const padding = getStyle('padding', '16px');
  const textAlign = getStyle('textAlign', 'left');
  const fontSize = getStyle('fontSize', '16px');
  const borderRadius = getStyle('borderRadius', '0');

  switch (type) {
    case 'header':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${bgColor};">
          <tr>
            <td style="padding: ${padding}; text-align: ${textAlign};">
              ${content.showLogo ? `<div style="display: inline-block;">${content.logo || '{{company_name}}'}</div>` : ''}
              ${content.tagline ? `<p style="color: ${textColor}; margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">${content.tagline}</p>` : ''}
            </td>
          </tr>
        </table>
      `;

    case 'hero':
      const heroStyle = content.backgroundImage 
        ? `background-image: url(${content.backgroundImage}); background-size: cover; background-position: center;`
        : `background-color: ${bgColor};`;
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${heroStyle}">
          <tr>
            <td style="padding: ${padding}; text-align: ${textAlign};">
              <h1 style="color: ${textColor}; margin: 0 0 16px 0; font-size: 32px; font-weight: 700;">${content.title || ''}</h1>
              ${content.subtitle ? `<p style="color: ${textColor}; margin: 0; font-size: 18px; opacity: 0.9;">${content.subtitle}</p>` : ''}
            </td>
          </tr>
        </table>
      `;

    case 'text':
      const paragraphs = (content.text || '').split('\n\n').map((p: string) => 
        `<p style="color: ${textColor}; margin: 0 0 16px 0; font-size: ${fontSize}; line-height: 1.6;">${p.replace(/\n/g, '<br>')}</p>`
      ).join('');
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: ${padding}; text-align: ${textAlign};">
              ${paragraphs}
            </td>
          </tr>
        </table>
      `;

    case 'image':
      const imgContent = content.src 
        ? `<img src="${content.src}" alt="${content.alt || ''}" style="max-width: 100%; width: ${content.width || '100%'}; height: auto; display: block; margin: 0 auto; border-radius: ${borderRadius};" />`
        : `<div style="background: #e4e4e7; width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; color: #71717a; border-radius: ${borderRadius};">Image Placeholder</div>`;
      const wrappedImg = content.link ? `<a href="${content.link}" target="_blank">${imgContent}</a>` : imgContent;
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: ${padding}; text-align: ${textAlign};">
              ${wrappedImg}
            </td>
          </tr>
        </table>
      `;

    case 'button':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: ${padding}; text-align: ${textAlign};">
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: ${bgColor}; border-radius: ${borderRadius}; padding: 14px 32px;">
                    <a href="${content.link || '#'}" style="color: ${textColor}; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">${content.text || 'Click Here'}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;

    case 'columns':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: ${padding};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="48%" valign="top" style="padding-right: 16px;">
                    <p style="color: ${textColor}; margin: 0; font-size: ${fontSize}; line-height: 1.6;">${content.leftContent || ''}</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" valign="top" style="padding-left: 16px;">
                    <p style="color: ${textColor}; margin: 0; font-size: ${fontSize}; line-height: 1.6;">${content.rightContent || ''}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;

    case 'divider':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: ${padding};">
              <hr style="border: none; border-top: ${content.thickness || '1px'} ${content.style || 'solid'} ${content.color || '#e4e4e7'}; margin: 0;" />
            </td>
          </tr>
        </table>
      `;

    case 'spacer':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="height: ${content.height || '32px'}; line-height: ${content.height || '32px'};">&nbsp;</td>
          </tr>
        </table>
      `;

    case 'callout':
      const calloutIcons: Record<string, string> = {
        info: 'ℹ️',
        warning: '⚠️',
        success: '✅',
        error: '❌',
        tip: '💡',
      };
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: ${padding};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${bgColor}; border-radius: ${borderRadius};">
                <tr>
                  <td style="padding: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="padding-right: 12px; font-size: 20px;">
                          ${calloutIcons[content.icon] || calloutIcons.info}
                        </td>
                        <td>
                          ${content.title ? `<p style="color: ${textColor}; margin: 0 0 4px 0; font-weight: 600; font-size: 14px;">${content.title}</p>` : ''}
                          <p style="color: ${textColor}; margin: 0; font-size: 14px; line-height: 1.5;">${content.message || ''}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;

    case 'list':
      const listItems = (content.items || []).map((item: string) => {
        const bullet = content.listStyle === 'number' ? '' : '•';
        return `<li style="color: ${textColor}; margin: 0 0 8px 0; font-size: ${fontSize}; line-height: 1.5;">${item}</li>`;
      }).join('');
      const listType = content.listStyle === 'number' ? 'ol' : 'ul';
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: ${padding}; text-align: ${textAlign};">
              <${listType} style="margin: 0; padding-left: 24px;">
                ${listItems}
              </${listType}>
            </td>
          </tr>
        </table>
      `;

    case 'cta-banner':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${bgColor};">
          <tr>
            <td style="padding: ${padding}; text-align: ${textAlign};">
              <h2 style="color: ${textColor}; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">${content.title || ''}</h2>
              ${content.subtitle ? `<p style="color: ${textColor}; margin: 0 0 24px 0; font-size: 16px; opacity: 0.9;">${content.subtitle}</p>` : ''}
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ffffff; border-radius: 8px; padding: 14px 32px;">
                    <a href="${content.buttonLink || '#'}" style="color: ${bgColor}; text-decoration: none; font-weight: 600; font-size: 16px;">${content.buttonText || 'Get Started'}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;

    case 'social':
      const socialLinks = [];
      if (content.facebook) socialLinks.push(`<a href="${content.facebook}" style="text-decoration: none; margin: 0 8px;">📘</a>`);
      if (content.twitter) socialLinks.push(`<a href="${content.twitter}" style="text-decoration: none; margin: 0 8px;">🐦</a>`);
      if (content.instagram) socialLinks.push(`<a href="${content.instagram}" style="text-decoration: none; margin: 0 8px;">📷</a>`);
      if (content.linkedin) socialLinks.push(`<a href="${content.linkedin}" style="text-decoration: none; margin: 0 8px;">💼</a>`);
      if (content.youtube) socialLinks.push(`<a href="${content.youtube}" style="text-decoration: none; margin: 0 8px;">▶️</a>`);
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: ${padding}; text-align: ${textAlign}; font-size: 24px;">
              ${socialLinks.length > 0 ? socialLinks.join('') : '<span style="color: #71717a; font-size: 14px;">Add social links</span>'}
            </td>
          </tr>
        </table>
      `;

    case 'footer':
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${bgColor};">
          <tr>
            <td style="padding: ${padding}; text-align: ${textAlign};">
              <p style="color: ${textColor}; margin: 0 0 8px 0; font-size: ${fontSize}; font-weight: 600;">${content.companyName || ''}</p>
              ${content.address ? `<p style="color: ${textColor}; margin: 0 0 4px 0; font-size: ${fontSize};">${content.address}</p>` : ''}
              ${content.email || content.phone ? `<p style="color: ${textColor}; margin: 0 0 16px 0; font-size: ${fontSize};">${[content.email, content.phone].filter(Boolean).join(' | ')}</p>` : ''}
              ${content.unsubscribeLink ? `<p style="margin: 0 0 8px 0;"><a href="${content.unsubscribeLink}" style="color: ${textColor}; font-size: ${fontSize};">Unsubscribe</a></p>` : ''}
              ${content.copyright ? `<p style="color: ${textColor}; margin: 0; font-size: ${fontSize}; opacity: 0.7;">${content.copyright}</p>` : ''}
            </td>
          </tr>
        </table>
      `;

    default:
      return '';
  }
}

export function renderTemplateToHtml(blocks: EmailBlock[], globalStyles: GlobalStyles): string {
  const blocksHtml = blocks.map(block => renderBlockToHtml(block, globalStyles)).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${globalStyles.backgroundColor}; font-family: ${globalStyles.fontFamily};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${globalStyles.backgroundColor};">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="max-width: ${globalStyles.contentWidth}; width: 100%; background-color: ${globalStyles.contentBackgroundColor}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          ${blocksHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function parseHtmlToBlocks(html: string): { blocks: EmailBlock[]; globalStyles: GlobalStyles } {
  return {
    blocks: [],
    globalStyles: defaultGlobalStyles,
  };
}
