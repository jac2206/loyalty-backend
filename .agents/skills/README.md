# Skills del proyecto

Codex descubre las skills del repositorio en `.agents/skills/<nombre>/SKILL.md`. Inicia una sesión nueva después de agregarlas o modificarlas. Puedes invocarlas por nombre con `$` o describir la tarea para que el agente seleccione la pertinente.

| Skill | Cuándo usarla |
| --- | --- |
| [loyalty-express-ts](loyalty-express-ts/SKILL.md) | Implementar capacidades del backend. |
| [loyalty-openapi-zod](loyalty-openapi-zod/SKILL.md) | Cambiar rutas, validación y contratos OpenAPI. |
| [loyalty-vitest](loyalty-vitest/SKILL.md) | Agregar o actualizar pruebas de comportamiento. |

Cada paquete contiene sus instrucciones en `SKILL.md` y una guía bilingüe:

- [Uso de loyalty-express-ts](loyalty-express-ts/examples/usage.md).
- [Uso de loyalty-openapi-zod](loyalty-openapi-zod/examples/usage.md).
- [Uso de loyalty-vitest](loyalty-vitest/examples/usage.md).

Para documentar el backend a partir del código, usa la skill global `backend-documentation` cuando esté disponible, junto con las instrucciones y documentación de este proyecto. En otro entorno, esa skill debe estar instalada para poder invocarla.

## Skills externas

Las skills globales y de plugins disponibles en la sesión pueden usarse junto con las locales. Para incorporar una skill desde un repositorio remoto, identifica una fuente y versión confiables, revisa sus instrucciones y recursos, e instálala con el mecanismo disponible en tu entorno en `.agents/skills/` para compartirla con el proyecto o en el directorio de usuario para uso personal. Comprueba dependencias y permisos antes de ejecutarla; no guardes credenciales en el repositorio. La disponibilidad depende de la red, los permisos y las herramientas del entorno; una URL por sí sola no instala ni activa una skill.

Consulta la [documentación oficial de instalación](https://developers.openai.com/api/reference/cli) para un ejemplo de instalación por proyecto y de usuario, y [skills de Codex](https://developers.openai.com/codex/skills). Para instalar una skill concreta, proporciona su repositorio y ruta o pide a `skill-installer` que busque una opción disponible.
