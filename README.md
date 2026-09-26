# Ronda

Reto diario de minijuegos para grupos de amigos. Inspirado en el loop de apps tipo *daily group challenge*: un juego nuevo cada día, intentos limitados, ranking de temporada.

## Stack

- **Next.js 16** + TypeScript + Tailwind + shadcn/ui
- Persistencia **local** (localStorage) en esta primera slice — listo para migrar a Supabase
- Minijuegos estáticos en `/public/games` con bridge `postMessage` (`ready` → `started` → `score` → `finished`)

## Cómo arrancar

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:43127](http://127.0.0.1:43127) (o la URL del puerto en Cursor).

### Estilos visuales

Tres temas inspirados en PlayUs — cambia en [/estilos](http://127.0.0.1:43127/estilos) o con el chip **Estilos** arriba a la derecha:

1. **Arena Soft** — crema, morado, amarillo bubble (el más fiel)
2. **Candy Court** — coral + menta, misma anatomía juguetona
3. **Club Night** — morado saturado + cards blancas (marketing night)

## Qué incluye el MVP

1. Perfil local (apodo)
2. Crear / unir grupo (código)
3. Temporada de 21 días + rotación de 3 minijuegos
4. 1 práctica + 2 intentos oficiales por día
5. Ranking diario y de temporada
6. Crew demo (`RONDA1`) con rivales ficticios

### Minijuegos

| Id | Mecánica | Score |
|---|---|---|
| `tap-rush` | Toca 12 objetivos | Tiempo (menor mejor) |
| `memory-flash` | Secuencia de memoria | Nivel |
| `quick-sum` | Sumas en 30s | Puntos |

## Flujo rápido

1. Empezar → elige nombre  
2. **Probar con crew demo** (o crea tu grupo)  
3. Jugar → práctica u oficial  
4. Mira el ranking  

## Próximos pasos (roadmap)

- Auth + sync real (Supabase)
- Chat de grupo
- Más juegos (Phaser)
- Tips/stats, PWA, cosmética

## Nota

Esta demo guarda datos en el navegador. Unirse por código solo funciona si el grupo existe en el mismo dispositivo hasta que conectemos backend.
