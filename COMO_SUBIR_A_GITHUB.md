# Subir Ronda a GitHub (VS Code)

1. En github.com → **New repository**
2. Nombre: `ronda` (vacío, sin README)
3. En la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Initial commit: Ronda MVP"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ronda.git
git push -u origin main
```

Sustituye `TU_USUARIO` por tu usuario de GitHub.

Luego:

```bash
npm install
npm run dev
```
