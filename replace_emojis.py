import os

replacements = {
  '🌾': '<i class="ph-fill ph-plant"></i>',
  '🌤️': '<i class="ph-fill ph-cloud-sun"></i>',
  '🔔': '<i class="ph-fill ph-bell"></i>',
  '👋': '<i class="ph-fill ph-hand-waving"></i>',
  '📸': '<i class="ph-fill ph-camera"></i>',
  '📷': '<i class="ph-fill ph-camera"></i>',
  '💰': '<i class="ph-fill ph-coins"></i>',
  '⚡': '<i class="ph-fill ph-lightning"></i>',
  '📅': '<i class="ph-fill ph-calendar"></i>',
  '📋': '<i class="ph-fill ph-clipboard-text"></i>',
  '📖': '<i class="ph-fill ph-book-open"></i>',
  '🧠': '<i class="ph-fill ph-brain"></i>',
  '🔄': '<i class="ph-fill ph-arrows-clockwise"></i>',
  '🎯': '<i class="ph-fill ph-target"></i>',
  '📍': '<i class="ph-fill ph-map-pin"></i>',
  '📊': '<i class="ph-fill ph-chart-bar"></i>',
  '📈': '<i class="ph-fill ph-trend-up"></i>',
  '📉': '<i class="ph-fill ph-trend-down"></i>',
  '🚜': '<i class="ph-fill ph-tractor"></i>',
  '🌱': '<i class="ph-fill ph-seedling"></i>',
  '👤': '<i class="ph-fill ph-user"></i>',
  '⚙️': '<i class="ph-fill ph-gear"></i>',
  '🌸': '<i class="ph-fill ph-flower-lotus"></i>',
  '🍚': '<i class="ph-fill ph-bowl-food"></i>',
  '💊': '<i class="ph-fill ph-pill"></i>',
  '✅': '<i class="ph-fill ph-check-circle"></i>',
  '⏳': '<i class="ph-fill ph-hourglass"></i>',
  '⚠️': '<i class="ph-fill ph-warning"></i>',
  '↗️': '<i class="ph-bold ph-arrow-up-right"></i>',
  '↘️': '<i class="ph-bold ph-arrow-down-right"></i>',
  '➖': '<i class="ph-bold ph-minus"></i>',
  '🏠': '<i class="ph-fill ph-house"></i>'
}

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for emoji, icon in replacements.items():
        content = content.replace(emoji, icon)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('app/index.html')
process_file('app/js/app.js')

with open('app/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

if 'unpkg.com/@phosphor-icons/web' not in html:
    html = html.replace('<link rel="stylesheet" href="css/style.css">', '<script src="https://unpkg.com/@phosphor-icons/web"></script>\n    <link rel="stylesheet" href="css/style.css">')
    with open('app/index.html', 'w', encoding='utf-8') as f:
        f.write(html)

print("Done replacing emojis!")
