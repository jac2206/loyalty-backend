# Skill: contrato Zod + OpenAPI

1. A partir de la spec, definir request, params, query y response en `src/infraestructure/schemas/<módulo>.schema.ts`.
2. Preferir `z.enum` para conjuntos cerrados y restricciones explícitas (`min`, `positive`, `email`).
3. Aplicar `validate` a cada input recibido.
4. Registrar la ruta con `registerRoute` y schemas idénticos.
5. Añadir respuestas personalizadas para errores específicos y confirmar que el éxito documentado usa el status real.
6. Comprobar visualmente `/docs` al levantar el servidor cuando sea posible.

No duplicar tipos manualmente entre Zod y Swagger ni documentar un endpoint sin validarlo.
