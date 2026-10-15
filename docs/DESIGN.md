# Design System: Excusify Playful Engine

Documentación técnica y reglas visuales extraídas del sistema de diseño en **Google Stitch**.

---

## 1. Identidad y Personalidad de Marca

*Excusify Playful Engine* impulsa una experiencia cómica, irreverente y dinámica para generar pretextos y excusas absurdas de la vida diaria, el trabajo y los estudios.

- **Voz ingeniosa y sin complejos:** Rápida, cómica y ligeramente dramática. La interfaz usa la hipérbole sin sacrificar la usabilidad.
- **Vibrante y juvenil:** Irradia energía creativa mediante puntos focales de alta saturación, espacios en blanco generosos y formas orgánicas muy redondeadas.
- **Táctil y responsivo:** La interacción se siente como una caja de sonidos o un juguete físico: microinteracciones elásticas, botones gruesos y expresivos acentos emoji.
- **Movimiento estilístico (Playful Neo-Modernism):** Fusión de geometría súper redondeada (*squircles* `rounded-2xl`, `rounded-3xl`), controles tipo píldora (`rounded-full`), tipografía expresiva y sombras ambientales en tonos pastel con resplandor violeta suave.

---

## 2. Paleta de Colores

La paleta equilibra la energía eléctrica con superficies pastel relajantes y legibles.

### Colores de Superficie y Fondo
| Token | Hex | Propósito |
|---|---|---|
| `background` / `canvas` | `#F8F7FC` | Fondo general en lila pastel ultrasuave. |
| `surface` / `surface-lowest` | `#FFFFFF` | Superficie pura para tarjetas interactivas y modales. |
| `surface-container-tonal` | `#F0EDFA` | Contenedores insertados, chips secundarios y bloques de cotización. |
| `outline-variant` | `#E4E0F2` | Bordes sutiles delimitadores sin generar cortes duros. |

### Colores de Marca y Acentos
| Token | Hex | Propósito |
|---|---|---|
| `primary` | `#5424CF` | Violeta profundo de lectura y branding. |
| `primary-container` | `#6D45E8` | Violeta eléctrico dominante: botones de acción principal (CTA), indicadores activos. |
| `secondary-container` | `#FFB547` | Amarillo cálido sol: botón de generación aleatoria, badges de racha y advertencias cómicas. |
| `tertiary` / `tertiary-container`| `#FF4B72` | Rosa neón intenso: niveles máximos de absurdo (5/5), modo delirante y acciones picantes. |
| `accent-teal` | `#00D2B4` | Verde azulado menta: indicador de excusa creíble (1/5) y confirmación de copiado exitoso. |
| `accent-amber` | `#FF9F1C` | Ámbar intermedio: nivel de absurdo medio (3/5). |

### Tipografía y Neutros
| Token | Hex | Propósito |
|---|---|---|
| `on-surface` / `text-main` | `#28223D` | Índigo carbón para títulos y textos de alta legibilidad. |
| `on-surface-variant` / `text-muted` | `#645E7A` | Pizarra violeta para metadatos, descripciones secundarias y *placeholders*. |

---

## 3. Tipografía

La tipografía unificada es **Plus Jakarta Sans**, seleccionada por su calidez geométrica, aperturas amplias y excelente legibilidad en dispositivos móviles.

- **Titulares (`headline-xl`, `headline-lg`):** Pesos `700` (Bold) y `800` (Extra Bold), con tracking negativo (`-0.02em`) para un ritmo visual compacto y llamativo.
- **Cuerpo (`body-lg`, `body-md`):** Peso `500` (Medium) en lugar de `400` para garantizar nitidez contra los fondos pastel.
- **Etiquetas y Botones (`label-lg`, `label-md`, `label-sm`):** Pesos `600` y `700`. En chips y badges en mayúsculas se aplica `letter-spacing: +0.04em`.

### Escala tipográfica
- `headline-xl`: 44px / line-height 52px (Mobile: 32px / 40px)
- `headline-lg`: 32px / line-height 40px (Mobile: 26px / 34px)
- `headline-md`: 24px / line-height 32px
- `headline-sm`: 20px / line-height 28px
- `body-lg`: 18px / line-height 28px
- `body-md`: 16px / line-height 24px
- `body-sm`: 14px / line-height 20px
- `label-lg`: 16px / line-height 20px (Semibold/Bold)
- `label-md`: 14px / line-height 18px
- `label-sm`: 12px / line-height 16px

---

## 4. Elevación, Profundidad y Sombras

Se utilizan sombras teñidas con el violeta de marca en lugar de sombras negras genéricas:

- **Nivel 0 (Flat):** Sin sombra, solo fondo `#F0EDFA` con borde de 1px `#E4E0F2`.
- **Nivel 1 (Micro-elevación de tarjetas):**  
  `box-shadow: 0 4px 20px -2px rgba(109, 69, 232, 0.08), 0 2px 6px -1px rgba(40, 34, 61, 0.04);`  
  Borde: 1px sólido `#E4E0F2`.
- **Nivel 2 (Botones flotantes y modales):**  
  `box-shadow: 0 12px 32px -4px rgba(109, 69, 232, 0.18), 0 4px 12px -2px rgba(40, 34, 61, 0.06);`
- **Nivel 3 (Pulsación táctil / Pressed):**  
  Traslación vertical de 2px hacia abajo (`active:translate-y-0.5 active:scale-[0.98]`) colapsando la sombra a Nivel 1.

---

## 5. Componentes Principales

1. **Botón Principal ("¡INVENTA MI EXCUSA!"):**  
   Forma píldora completa (`rounded-full`), altura 56px, degradado violeta a dorado, sombra violeta difusa y feedback táctil.
2. **Chips de Categoría:**  
   Píldoras redondeadas con icono emoji + texto (*Todas*, *Trabajo*, *Estudio*, *Vida cotidiana*). Activo en violeta pleno; inactivo en blanco con borde sutil.
3. **Tarjeta de Excusa Oficial:**  
   Contenedor redondeado (`rounded-3xl`), entrecomillado en bloque lila tonal (`rounded-2xl`) y barra de acciones rápidas (Copiar y Compartir vía WhatsApp).
4. **Termómetro de Absurdidad:**  
   Escala del 1 al 5 dividida en 3 rangos:
   - *Creíble:* `#00D2B4` (1 a 2)
   - *Sospechosa:* `#FF9F1C` (3 a 4)
   - *Delirante:* `#FF4B72` (5/5)
5. **Navegación Inferior (Bottom Bar):**  
   Barra fija flotante con botones redondeados e iconos rellenos para el estado activo.
