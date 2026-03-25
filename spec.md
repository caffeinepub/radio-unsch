# Radio UNSCH — Nuevos Diseños Totalmente Diferentes

## Current State
La app tiene 3 diseños (Aurora/teal, Ember/amber, Nebulosa/violet) todos con el mismo layout: card centrada vertical, vinilo arriba, EQ, panel metadata, volumen, botón play. Todos son glassmorphism oscuro con fondo negro.

## Requested Changes (Diff)

### Add
- RadioDesign1 nuevo: **Rojo Carmesí** — fondo #0a0000, acentos rojo profundo (#8b0000 → #cc2200), layout con album art grande (200px) como pieza principal, EQ en rojos/naranjas, botón play prominente rojo
- RadioDesign2 nuevo: **Azul Oceánico** — fondo #000814, acentos azul eléctrico (#0047ab → #00b4d8), layout con album art cuadrado (no circular), borde brillante azul, EQ en azules/cian
- RadioDesign3 nuevo: **Verde Esmeralda** — fondo #000a00, acentos verde esmeralda (#006400 → #00c853), layout minimalista con album art hexagonal (border-radius alto), EQ en verdes

### Modify
- App.tsx: cambiar nombres de botones a "Carmesí", "Oceánico", "Esmeralda" con los colores correspondientes
- Los 3 diseños deben mantener toda la funcionalidad (streaming, metadata, background playback, EN VIVO badge, volumen)

### Remove
- Nada de la funcionalidad

## Implementation Plan
1. Reemplazar RadioDesign1.tsx con diseño Rojo Carmesí (fondo oscuro rojo, card con borde rojo suave, album art grande circular, EQ rojo-naranja)
2. Reemplazar RadioDesign2.tsx con diseño Azul Oceánico (fondo azul oscuro profundo, card con glassmorphism azul, album art cuadrado redondeado, EQ azul-cian)
3. Reemplazar RadioDesign3.tsx con diseño Verde Esmeralda (fondo verde muy oscuro, card minimalista, album art circular con borde verde brillante, EQ verdes)
4. Actualizar App.tsx con nuevos labels y colores
