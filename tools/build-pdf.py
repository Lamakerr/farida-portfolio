"""Собирает portfolio.pdf из pdf.html.

python tools/build-pdf.py <chrome-headless-shell.exe> <временная папка>
Chrome встраивает WebP в PDF без сжатия (файл под 50 МБ), а JPEG — как есть,
поэтому печатаем из временной копии сайта с картинками в JPEG.
"""
import os, re, shutil, subprocess, sys
from PIL import Image

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
chrome, tmp = sys.argv[1], sys.argv[2]

shutil.rmtree(tmp, ignore_errors=True)
for root, _, files in os.walk(os.path.join(SITE, 'images')):
    for f in files:
        if not f.endswith('.webp'):
            continue
        rel = os.path.relpath(os.path.join(root, f), SITE)
        out = os.path.join(tmp, rel[:-5] + '.jpg')
        os.makedirs(os.path.dirname(out), exist_ok=True)
        im = Image.open(os.path.join(root, f)).convert('RGB')
        im.thumbnail((1500, 1500) if im.height < 3 * im.width else (700, 99999))
        im.save(out, 'JPEG', quality=80, optimize=True, progressive=True)

for f in ('pdf.html', 'cases.js'):
    with open(os.path.join(SITE, f), encoding='utf-8-sig') as src:
        text = re.sub(r'\.webp\b', '.jpg', src.read())
    with open(os.path.join(tmp, f), 'w', encoding='utf-8') as dst:
        dst.write(text)

pdf = os.path.join(SITE, 'portfolio.pdf')
subprocess.run([chrome, '--headless', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=10000',
                f'--print-to-pdf={pdf}', 'file:///' + os.path.join(tmp, 'pdf.html').replace('\\', '/')],
               stderr=subprocess.DEVNULL, check=True)
print(pdf, round(os.path.getsize(pdf) / 2**20, 1), 'MB')
