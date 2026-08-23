# Plantilla de solicitud SDD

Usar esta estructura al pedir una capacidad nueva:

```md
Capacidad: <nombre>
Problema y valor: <qué resuelve y para quién>
Actores/autorización: <token, scopes, restricciones de identidad>
Reglas de negocio: <reglas numeradas>
Contrato HTTP: <método, ruta, input, output, errores>
Persistencia e integraciones: <tablas, eventos, APIs>
Criterios de aceptación: <escenarios Given/When/Then>
No objetivos y compatibilidad: <límites y migraciones>
```

Si falta información crítica, declarar la suposición en la spec con estado `Pendiente de validación`; no inventar reglas financieras, permisos ni cambios destructivos.
