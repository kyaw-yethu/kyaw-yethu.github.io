export function renderInline(md: string): string {
  let s = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Extract links into placeholder tokens BEFORE running emphasis passes,
  // so link URLs (and text) are never scanned/mutated by the bold/italic
  // regexes below. Without this, a URL containing `*` (e.g. `*a*`) would
  // get corrupted into `<em>a</em>` inside the href. The token is wrapped
  // in NUL bytes (\x00), which can never occur in normal markdown input,
  // so it can't collide with real content and doesn't add stray whitespace.
  const links: string[] = [];
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text: string, url: string) => {
    const token = `\x00${links.length}\x00`;
    links.push(`<a href="${url}">${text}</a>`);
    return token;
  });

  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  s = s.replace(/\x00(\d+)\x00/g, (_match, idx: string) => links[Number(idx)]);

  return s;
}
