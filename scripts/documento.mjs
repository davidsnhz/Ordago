// Genera los PDF de los documentos: el de diseño y el de la gira (npm run documento).
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { marked } from 'marked';

const DOCUMENTOS = [
  { md: 'docs/diseno-juego.md', pdf: 'docs/Órdago — Documento de diseño.pdf', titulo: 'Órdago — Documento de diseño' },
  { md: 'docs/gira.md', pdf: 'docs/Órdago — La gira.pdf', titulo: 'Órdago — La gira' },
];

// En el PDF, los enlaces entre documentos apuntan al otro PDF.
const ENLACES = Object.fromEntries(DOCUMENTOS.map((d) => [path.basename(d.md), encodeURI(path.basename(d.pdf))]));

const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

for (const doc of DOCUMENTOS) {
  let cuerpo = marked.parse(fs.readFileSync(doc.md, 'utf8'));
  cuerpo = cuerpo.replace(/\[nuevo\]/g, '<span class="marca nuevo">nuevo</span>').replace(/\[cambiado\]/g, '<span class="marca cambiado">cambiado</span>');
  cuerpo = cuerpo.replace(/href="([^"#]+\.md)"/g, (todo, destino) => (ENLACES[destino] ? `href="${ENLACES[destino]}"` : todo));
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${doc.titulo}</title>
<style>
@page { size: A4; margin: 18mm 18mm 18mm 18mm; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.45; color: #231915; }
h1 { font-size: 24pt; margin: 0 0 4px; color: #8C3A22; }
h1 + p { color: #6b5a50; margin-top: 0; }
h2 { font-size: 16pt; color: #8C3A22; border-bottom: 2px solid #231915; padding-bottom: 3px; margin-top: 26px; page-break-after: avoid; }
h3 { font-size: 12.5pt; margin-top: 18px; page-break-after: avoid; }
h4 { font-size: 11pt; margin: 14px 0 4px; color: #2F4D7A; page-break-after: avoid; }
hr { border: 0; border-top: 1px dashed #8a7a70; margin: 18px 0; }
table { border-collapse: collapse; width: 100%; margin: 8px 0 12px; font-size: 9.5pt; page-break-inside: avoid; }
th, td { border: 1px solid #8a7a70; padding: 4px 6px; text-align: left; vertical-align: top; }
th { background: #F1E6CF; }
blockquote { margin: 10px 0; padding: 8px 12px; background: #F6EEDC; border-left: 4px solid #C9962B; }
pre { background: #f4f0ea; padding: 8px 10px; font-size: 8.5pt; white-space: pre-wrap; page-break-inside: avoid; }
code { font-family: Consolas, monospace; font-size: 9pt; }
a { color: #8C3A22; }
.formula { text-align: center; font-style: italic; font-size: 11.5pt; margin: 8px 0; }
.marca { font-family: Arial, sans-serif; font-size: 7.5pt; font-weight: bold; text-transform: uppercase; padding: 1px 5px; border-radius: 3px; color: #fff; vertical-align: 1px; }
.nuevo { background: #3E6B3A; } .cambiado { background: #2F4D7A; }
li { margin: 2px 0; }
</style></head><body>${cuerpo}</body></html>`;

  // Edge sin interfaz imprime el HTML a PDF.
  const temporal = doc.md.replace(/\.md$/, '.html');
  fs.writeFileSync(temporal, html);
  const pdf = path.resolve(doc.pdf);
  const antes = fs.existsSync(pdf) ? fs.statSync(pdf).mtimeMs : 0;
  execFileSync(edge, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, 'file:///' + path.resolve(temporal).split(path.sep).join('/')], { stdio: 'ignore' });
  fs.unlinkSync(temporal);
  // Edge no dice nada si no puede escribir (por ejemplo, si el PDF está abierto en otro programa).
  if (!fs.existsSync(pdf) || fs.statSync(pdf).mtimeMs === antes) {
    console.warn(`OJO: no se ha podido escribir ${path.basename(pdf)}. ¿Está abierto en otro programa? Ciérralo y vuelve a lanzar npm run documento.`);
    process.exitCode = 1;
    continue;
  }
  console.log('PDF:', pdf);
}
