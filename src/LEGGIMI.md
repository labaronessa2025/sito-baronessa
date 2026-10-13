# Scena 3D dell'apertura

`src/scena.js` è il sorgente; il sito usa `js/scena.js`, che contiene anche three.js (0.170.0), impacchettato e minificato.

Per rigenerarlo dopo una modifica:

```
npm i three@0.170.0 esbuild@0.24.0
npx esbuild src/scena.js --bundle --format=esm --minify --target=es2019 --legal-comments=none --outfile=js/scena.js
```

Le immagini `img/scena.webp` (computer) e `img/scena-m.webp` (telefono) sono la frutta ferma: si vedono mentre la scena carica e sui telefoni che non supportano il 3D. Se cambi la disposizione dei frutti, rigenerale con uno screenshot trasparente della scena.

three.js è distribuito con licenza MIT (© 2010-2024 three.js authors).
