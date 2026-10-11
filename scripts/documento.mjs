import fs from 'fs';
import { marked } from 'marked';
let md = fs.readFileSync('docs/diseno-juego.md', 'utf8');
let cuerpo = marked.parse(md);
cuerpo = cuerpo.replace(/\[nuevo\]/g, '<span class="marca nuevo">nuevo</span>').replace(/\[cambiado\]/g, '<span class="marca cambiado">cambiado</span>');
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Órdago — Documento de diseño</title>
<style>
@page { size: A4; margin: 18mm 18mm 18mm 18mm; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.45; color: #231915; }
h1 { font-size: 24pt; margin: 0 0 4px; color: #8C3A22; }
h1 + p { color: #6b5a50; margin-top: 0; }
h2 { font-size: 16pt; color: #8C3A22; border-bottom: 2px solid #231915; padding-bottom: 3px; margin-top: 26px; page-break-after: avoid; }
h3 { font-size: 12.5pt; margin-top: 18px; page-break-after: avoid; }
table { border-collapse: collapse; width: 100%; margin: 8px 0 12px; font-size: 9.5pt; page-break-inside: avoid; }
th, td { border: 1px solid #8a7a70; padding: 4px 6px; text-align: left; vertical-align: top; }
th { background: #F1E6CF; }
blockquote { margin: 10px 0; padding: 8px 12px; background: #F6EEDC; border-left: 4px solid #C9962B; }
pre { background: #f4f0ea; padding: 8px 10px; font-size: 8.5pt; white-space: pre-wrap; page-break-inside: avoid; }
code { font-family: Consolas, monospace; font-size: 9pt; }
.formula { text-align: center; font-style: italic; font-size: 11.5pt; margin: 8px 0; }
.marca { font-family: Arial, sans-serif; font-size: 7.5pt; font-weight: bold; text-transform: uppercase; padding: 1px 5px; border-radius: 3px; color: #fff; vertical-align: 1px; }
.nuevo { background: #3E6B3A; } .cambiado { background: #2F4D7A; }
li { margin: 2px 0; }
</style></head><body>${cuerpo}</body></html>`;
fs.writeFileSync('docs/diseno-juego.html', html);
console.log('html ok');

// Genera el PDF con Edge sin interfaz.
import { execFileSync } from 'child_process';
import path from 'path';
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const pdf = path.resolve('docs/Órdago — Documento de diseño.pdf');
execFileSync(edge, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, 'file:///' + path.resolve('docs/diseno-juego.html').split(path.sep).join('/')], { stdio: 'ignore' });
fs.unlinkSync('docs/diseno-juego.html');
console.log('PDF:', pdf);
