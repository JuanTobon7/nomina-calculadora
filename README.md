# nomina-calculadora

Calculadora didáctica de nómina para **Colombia 2026**, hecha en HTML y JavaScript puro (sin dependencias ni servidor).

## Cómo usarla

Abre `index.html` en el navegador. Eso es todo.

## Qué incluye

- **★ Sandbox paso a paso**: un recorrido guiado de 17 pasos que construye un desprendible de nómina línea por línea. Cada paso tiene controles para experimentar, la fórmula con tus números, un "¿Y si…?", una pregunta para practicar y la **referencia oficial** (norma, artículo y enlace al texto).
- **Nómina mensual**: salario, auxilio de transporte, horas extras, recargos nocturnos/dominicales, vacaciones, incapacidades, IBC, salud, pensión, Fondo de Solidaridad, retención en la fuente y costo total para el empleador.
- **Prestaciones y liquidación**: cesantías, intereses, prima, vacaciones pendientes e indemnización por despido sin justa causa.
- **Vacaciones**: convierte días hábiles en calendario con los festivos de 2026 y calcula la fecha de regreso.
- **Aprende y practica**: tablas de referencia, glosario, quiz y todas las fuentes.

Funciona en tiempo completo, medio tiempo, jornada por horas y salario integral.

## Valores 2026

| Concepto | Valor | Norma |
|---|---|---|
| Salario mínimo | $1.750.905 | Decreto 1469 de 2025 / Decreto 0159 de 2026 |
| Auxilio de transporte | $249.095 | Decreto 1470 de 2025 |
| UVT | $52.374 | Resolución DIAN 000238 de 2025 |
| Jornada máxima | 44 h → 42 h desde el 15-jul-2026 | Ley 2101 de 2021 |
| Recargo dominical/festivo | 80 % → 90 % desde el 1-jul-2026 | Ley 2466 de 2025, art. 14 |
| Trabajo nocturno | 7:00 p. m. a 6:00 a. m. | Ley 2466 de 2025, art. 10 |

## Archivos

- `index.html` — interfaz y estilos.
- `nomina.js` — motor de cálculo (nómina, prestaciones, vacaciones) y pestañas.
- `sandbox.js` — modo sandbox y catálogo de referencias oficiales.

## Aviso

Herramienta educativa. No modela casos especiales (pensionados, aprendices SENA, cotización por semanas, reforma pensional). Antes de pagar una nómina real, valida con un contador o con tu software de nómina.
