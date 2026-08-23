# Spec: salud del servicio

**Estado:** comportamiento actual documentado.

## Objetivo

Exponer una comprobación sencilla del estado del servicio en `GET /loyalty/health`.

## Decisión pendiente

La ruta no ejecuta middleware JWT, aunque el registro OpenAPI la marca protegida. Antes de modificar esta capacidad, elegir una de estas opciones y alinear implementación, Swagger y pruebas: health pública (recomendada para liveness) o health protegida para diagnóstico interno.
