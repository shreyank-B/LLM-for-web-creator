const fs = require('fs');
let text = fs.readFileSync('index.html', 'utf8');
text = text.replace(/<title>.*<\/title>/, '<title>ARCA — Built for growth, not for the hassle</title>');
text = text.replace(/<div class="logo-text">Web<span>Craft<\/span> AI<\/div>/, '<div class="logo-text" style="font-weight: 800; letter-spacing: 2px;">ARCA</div>');
text = text.replace(/<span>WebCraft AI<\/span> — ARCA Powered Web Generation/, '<span>ARCA</span> — Built for growth, not for the hassle');
text = text.replace(/<span>WebCraft AI<\/span> — Describe any website, build it instantly/g, '<span>ARCA</span> — Built for growth, not for the hassle');
text = text.replace(/WebCraft AI/g, 'ARCA');
fs.writeFileSync('index.html', text);
