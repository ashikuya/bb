/**
 * Rendert Forum-Post-Content mit Auto-Embed von Bildern/GIFs.
 *
 * Unterstützt:
 *   • Direkter Bild-Link (https://...png/jpg/gif/webp) → inline <img>
 *   • Markdown ![alt](url) → inline <img>
 *   • BBCode [img]url[/img] → inline <img>
 *   • Tenor/Giphy-Links → inline GIF
 *   • Reine URLs → Hyperlink
 *   • Zeilenumbrüche werden erhalten
 */
import React from 'react';

const IMG_EXT_RE = /\.(jpe?g|png|gif|webp|bmp|svg)(\?[^\s]*)?$/i;
const TENOR_RE   = /^https?:\/\/(media\.)?tenor\.com\/.+/i;
const GIPHY_RE   = /^https?:\/\/(media\.)?giphy\.com\/.+/i;
const URL_RE     = /https?:\/\/[^\s<>"]+/g;

function isImageUrl(url) {
  return IMG_EXT_RE.test(url) || TENOR_RE.test(url) || GIPHY_RE.test(url);
}

function renderToken(token, key) {
  if (typeof token === 'string') return token;
  if (token.type === 'img') {
    return (
      <img
        key={key}
        src={token.url}
        alt={token.alt || 'eingebettetes Bild'}
        loading="lazy"
        style={{
          maxWidth: '100%',
          maxHeight: 420,
          borderRadius: 8,
          margin: '8px 0',
          display: 'block',
          border: '1px solid rgba(78,165,211,0.25)',
        }}
      />
    );
  }
  if (token.type === 'link') {
    return (
      <a key={key} href={token.url} target="_blank" rel="noreferrer"
        style={{ color: 'var(--kael-frost)', textDecoration: 'underline' }}>
        {token.url}
      </a>
    );
  }
  return null;
}

export function renderPostContent(content) {
  if (!content) return null;

  // 1) BBCode [img]url[/img] → markdown ![](url)
  let text = content.replace(/\[img\](https?:\/\/[^\s\[]+)\[\/img\]/gi, '![]($1)');

  // 2) Tokenize mixing markdown image syntax and urls
  const out = [];
  let lastIndex = 0;
  const mdRe = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
  let m;
  while ((m = mdRe.exec(text)) !== null) {
    if (m.index > lastIndex) out.push(text.slice(lastIndex, m.index));
    out.push({ type: 'img', url: m[2], alt: m[1] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex));

  // 3) In den verbleibenden Text-Tokens URLs zu Bildern/Links machen
  const flat = [];
  out.forEach((tok) => {
    if (typeof tok !== 'string') { flat.push(tok); return; }
    let pos = 0;
    tok.replace(URL_RE, (match, idx) => {
      if (idx > pos) flat.push(tok.slice(pos, idx));
      if (isImageUrl(match)) flat.push({ type: 'img', url: match });
      else flat.push({ type: 'link', url: match });
      pos = idx + match.length;
      return match;
    });
    if (pos < tok.length) flat.push(tok.slice(pos));
  });

  // 4) Newlines in <br/> umwandeln in den Text-Tokens
  return flat.flatMap((tok, i) => {
    if (typeof tok !== 'string') return [renderToken(tok, `t-${i}`)];
    const parts = tok.split('\n');
    return parts.flatMap((p, j) => j > 0 ? [<br key={`br-${i}-${j}`} />, p] : [p]);
  });
}
