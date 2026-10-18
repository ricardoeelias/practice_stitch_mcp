# practice_stitch_mcp · De Google Stitch a código con OpenCode

## Integrantes

1. Ricardo José Barraza Méndez
2. Victor Rafael Arévalo Sierra
3. Ricardo Ernesto Elías Guandique
4. Michelle Genevieve Gutiérrez Espinoza

Plantilla para la actividad en equipo (1 hora). El plan:
1. **Diseñen 3 o más vistas** con una temática divertida en [Google Stitch](https://stitch.withgoogle.com).
2. **Conecten OpenCode con el servidor MCP de Stitch.** Ya viene configurado en [`opencode.json`](opencode.json): **solo falta su clave**.
3. **Pidan al agente** que extraiga los diseños y los convierta en páginas HTML en `views/`.
4. **Suban los cambios** con *Conventional Commits*.

El repo **empieza casi vacío a propósito**. `index.html`, las vistas y `docs/DESIGN.md` los crea el agente siguiendo las reglas de [`AGENTS.md`](AGENTS.md).

```
.
├── opencode.json            ← servidor MCP "stitch" preconfigurado (lee la clave de la variable de entorno)
├── AGENTS.md                ← instrucciones y convenciones para el agente
├── .opencode/commands/      ← comando /importar-vista
├── views/                   ← aquí aparecerán las vistas (*.html)
├── docs/                    ← aquí puede ir DESIGN.md (paleta, tipografía)
├── .githooks/commit-msg     ← (opcional) valida Conventional Commits
├── .env.example             ← solo referencia del nombre de la variable
├── CONTRIBUTING.md          ← roles y flujo del equipo
└── README.md, LICENSE, .gitignore
```

## Requisitos

- Cuenta de Google con acceso a **Stitch** y una **API key de Stitch**.
- **OpenCode** instalado ([opencode.ai](https://opencode.ai)), con un modelo o proveedor configurado.
- **Git** y una cuenta de **GitHub**.
- Para la vista previa: un navegador. Opcionalmente, Node.js para `npx serve .`. **No hay dependencias de npm.**

## Inicio rápido

### 1. Crear el repo del equipo (solo la persona líder)
1. En GitHub, abre este repositorio y pulsa **Use this template → Create a new repository**.
2. Ponle un nombre al repo, por ejemplo `equipo-gatos-astronautas`, márcalo como **Public** o **Private** y crea la rama `main`.
3. Ve a **Settings → Collaborators → Add people** e invita a tus compañeros.

### 2. Clonar (todo el equipo)
```bash
git clone https://github.com/<usuario>/<repo-del-equipo>.git
cd <repo-del-equipo>
git config core.hooksPath .githooks     # opcional: valida tus mensajes de commit
```

### 3. Obtener la API key de Stitch
En [stitch.withgoogle.com](https://stitch.withgoogle.com), ve a **Settings → API Keys → Create API Key** y copia la clave.

> 🔒 **La clave es personal y secreta.** No la pegues en el chat del agente, en el código ni en ningún archivo del repo.

### 4. Definir `STITCH_API_KEY` como variable de entorno del sistema

`opencode.json` contiene `"X-Goog-Api-Key": "{env:STITCH_API_KEY}"`. OpenCode sustituye ese valor al arrancar, **tomándolo de las variables de entorno del sistema** (de la terminal desde la que lo abres).

> ⚠ **OpenCode NO lee archivos `.env`.** Lo comprobamos: con un `.env` en el proyecto y sin la variable de sistema, el encabezado se envía **vacío**. `.env.example` está solo como referencia del nombre de la variable. Si la variable no existe, OpenCode la reemplaza por una cadena vacía y Stitch responde con un error de autenticación.

**Windows: PowerShell**
```powershell
# Solo para esta ventana de terminal:
$env:STITCH_API_KEY = "pega-tu-clave"
opencode

# Permanente para tu usuario. Luego CIERRA y vuelve a abrir la terminal (y VS Code, si lo usas):
setx STITCH_API_KEY "pega-tu-clave"
```
`setx` no afecta a la ventana actual, solo a las que abras después. Para comprobar la variable: `echo $env:STITCH_API_KEY`.

**Windows: CMD:** `set STITCH_API_KEY=pega-tu-clave` (sesión) o `setx STITCH_API_KEY "pega-tu-clave"` (permanente).

**macOS / Linux**
```bash
# Solo para esta terminal:
export STITCH_API_KEY="pega-tu-clave"

# Permanente (zsh, el predeterminado en macOS; en bash usa ~/.bashrc):
echo 'export STITCH_API_KEY="pega-tu-clave"' >> ~/.zshrc && source ~/.zshrc
```
Para comprobarla: `echo $STITCH_API_KEY`.

### 5. Abrir OpenCode y verificar el MCP
```bash
opencode mcp list      # debe mostrar: ✓ stitch connected
opencode               # abre el agente en la carpeta del repo
```
> ℹ "connected" solo confirma que el servidor responde: la lista de herramientas de Stitch es pública. **La prueba real de la clave** es pedirle al agente: **"lista mis proyectos de Stitch"**. Si devuelve tus proyectos (o una lista vacía, sin error), todo está bien.
>
> Si tu versión de OpenCode no tiene `opencode mcp list`, sáltate ese paso y usa directamente la prueba con el agente.

### 6. Diseñar en Stitch
Creen **al menos 3 pantallas** de la misma temática en un proyecto de Stitch. Ideas: *cafetería para gatos astronautas*, *agencia de viajes en el tiempo*, *tienda de pociones*, *liga de fútbol de dinosaurios*. Por ejemplo: inicio, catálogo o menú, detalle y contacto o reservas.

### 7. Generar las vistas con el agente
Prompts de ejemplo:

| Objetivo | Prompt |
|---|---|
| Probar la conexión | `lista mis proyectos de Stitch` |
| Ver pantallas | `muéstrame las pantallas del proyecto "Gatos Astronautas"` |
| Importar una vista | `/importar-vista pantalla de inicio de Gatos Astronautas` |
| Igual, sin comando | `usa el MCP de stitch para traer la pantalla "Menú" y conviértela en views/menu.html siguiendo AGENTS.md` |
| Portada | `crea index.html en la raíz con el nombre del equipo, la temática y enlaces a todas las vistas` |
| Sistema de diseño | `extrae la paleta de colores y la tipografía del proyecto y escríbelas en docs/DESIGN.md` |
| Revisión | `revisa que todas las vistas enlacen a ../index.html y entre sí, y que funcionen con doble clic` |

### 8. Vista previa
- **Doble clic** en `index.html`. Las vistas usan rutas relativas y scripts clásicos, así que funcionan con `file://`.
- O con un servidor local: `npx serve .` y abre la URL que muestra (normalmente http://localhost:3000).

### 9. Commit y push
```bash
git add views/menu.html index.html
git commit -m "feat(views): agrega vista menu desde Stitch"
git pull --rebase && git push
```

## Conventional Commits

Formato: `tipo(alcance): descripción` (5 a 72 caracteres, en imperativo).

| Tipo | Cuándo | Ejemplo |
|---|---|---|
| `feat` | Nueva funcionalidad o vista | `feat(views): agrega vista reservas` |
| `fix` | Corrección de un error | `fix(index): corrige enlace roto a menu` |
| `style` | Cambios visuales o de formato, sin lógica | `style(views): ajusta colores del encabezado` |
| `refactor` | Reorganizar sin cambiar el resultado | `refactor(views): extrae estilos comunes a css/comun.css` |
| `docs` | Documentación | `docs(design): documenta paleta y tipografía` |
| `chore` | Tareas varias, configuración | `chore: actualiza .gitignore` |
| `perf` · `test` · `build` · `ci` · `revert` | Rendimiento, pruebas, build, CI, revertir | `revert: revierte vista contacto` |

**Hook opcional:** con `git config core.hooksPath .githooks`, Git rechaza los mensajes que no sigan el formato (requiere Node.js). Para desactivarlo: `git config --unset core.hooksPath`. Las excepciones automáticas son `Merge…`, `Revert…`, `fixup!` y `squash!`.

## Solución de problemas

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| El agente dice *"Request is missing required authentication credential"* | `STITCH_API_KEY` no está definida en la terminal donde abriste OpenCode (o pusiste la clave en un `.env`, que OpenCode no lee) | Define la variable (paso 4). Si usaste `setx`, **abre una terminal nueva** y vuelve a lanzar `opencode` |
| *"API keys are not supported by this API"* o *"API key not valid"* | Clave mal copiada, con espacios o comillas de más, revocada, o una clave de Google Cloud en lugar de una de Stitch | Crea una clave nueva en Stitch → Settings → API Keys. Revisa con `echo` que no tenga espacios |
| No puedo crear una API key en Stitch | Restricción de la cuenta (por ejemplo, cuentas de organización o de menores) | Prueba con otra cuenta personal de Google, o trabaja con la cuenta de un compañero |
| `opencode mcp list` no muestra `stitch` | No estás en la carpeta del repo, o `opencode.json` tiene un error | Haz `cd` a la raíz del repo. Para validar el JSON: `node -e "JSON.parse(require('fs').readFileSync('opencode.json','utf8'))"` |
| `stitch` aparece como *failed* o con *timeout* | Red, proxy o firewall | Revisa tu conexión. En redes corporativas o escolares, prueba otra red |
| El agente no usa Stitch | No sabe que debe usarlo | Menciónalo en el prompt: *"usa el MCP de stitch…"*, o usa `/importar-vista` |
| La vista se ve sin estilos con doble clic | El agente usó `type="module"`, `fetch()` o rutas absolutas | Pídele: *"corrige la vista para que funcione con file:// según AGENTS.md"*, o usa `npx serve .` |
| Las imágenes no cargan | URLs temporales de Stitch | Pídele que descargue las imágenes a `views/img/` y las enlace en relativo |
| Git rechaza mi commit | El hook `commit-msg` está activo y el mensaje no cumple el formato | Usa `tipo(alcance): descripción`; ver la tabla de arriba |
| Subí mi clave por error | — | **Bórrala en Stitch y crea otra de inmediato.** Quitarla del repo no basta: queda en el historial |

## Equipo y roles
Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Nuestro proyecto
> *(El equipo completa esta sección: nombre del equipo, temática, integrantes, enlace al proyecto de Stitch y capturas.)*

## Licencia
[MIT](LICENSE) © 2026 Ronald Mejia
