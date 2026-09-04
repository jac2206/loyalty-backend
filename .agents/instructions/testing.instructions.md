# Instrucciones de testing

- La prueba acompaña a la spec: cada criterio de aceptación debe ser verificable por al menos una prueba.
- Unitarias: casos de uso con mocks de interfaces de dominio; probar camino feliz, cada error de negocio y llamadas a puertos.
- Controladores/middleware: dobles de request/response y casos de HTTP relevantes.
- Infraestructura: mockear `pool`, Axios o servicios externos; no requerir PostgreSQL ni red para unit tests.
- Nombrar como `test/<capa>/<módulo>/<archivo>.spec.ts` y usar AAA.
- Verificar resultados observables y contratos de colaboración, no detalles privados de implementación.
- Al corregir un defecto, añadir primero una prueba que lo reproduzca.
