'use strict';
/* =========================================================================
   AYUDA DIDÁCTICA
   1) Un botón "?" junto a cada dato y concepto:
      - pasar el mouse → explicación corta (tooltip)
      - clic → explicación completa en un modal, con ejemplo y referencia oficial
   2) Glosario con buscador.
   3) Tutorial guiado "Enséñame" que recorre cada parte de la pestaña abierta.
   Usa: P, money, n, pctTxt, esc, $ (nomina.js) · REFS, refHTML, STEPS, ir (sandbox.js)
   ========================================================================= */

const M = v => money(v);
const SM = P.SMMLV, AUX = P.AUX, UVT = P.UVT;

// ---------- 1. Contenido: cada concepto y cada campo ----------
// t: título · s: explicación corta (tooltip) · l: párrafos de la explicación completa · ej: ejemplo · refs: ids de REFS · go: paso del sandbox
const HELP = {
  // ===== Conceptos base =====
  smmlv: { t: 'Salario mínimo (SMMLV)', s: `Lo mínimo que se le puede pagar a un trabajador de tiempo completo al mes. En 2026: ${M(SM)}.`,
    l: ['SMMLV significa Salario Mínimo Mensual Legal Vigente. Lo fija el Gobierno cada año por decreto y aplica a todos los trabajadores con contrato laboral.',
      'También sirve como "unidad de medida": muchas reglas dependen de cuántos salarios mínimos gana alguien (auxilio de transporte hasta 2, Fondo de Solidaridad desde 4, exoneración de aportes por debajo de 10, salario integral desde 13).',
      'Si la persona trabaja menos horas que la jornada máxima (medio tiempo), el mínimo se paga en proporción a sus horas.'],
    ej: `Tiempo completo: mínimo ${M(SM)}. Medio tiempo: mínimo ${M(SM / 2)}. Por días: mínimo ${M(SM / 30)} por día.`, refs: ['dec1469', 'dec0159', 'cst145'], go: 'salario' },
  aux: { t: 'Auxilio de transporte', s: `Pago de ${M(AUX)} al mes para quienes ganan hasta 2 SMMLV (${M(2 * SM)}), para ayudarles con el transporte.`,
    l: ['Se paga a quienes ganan hasta dos salarios mínimos y se desplazan a trabajar. Se paga por días trabajados: no se paga en días de vacaciones ni de incapacidad.',
      'No es salario para seguridad social (no entra al IBC) ni para vacaciones, pero SÍ se suma para calcular la prima y las cesantías.',
      'Si la persona trabaja desde la casa, en lugar de auxilio de transporte recibe un auxilio de conectividad digital por el mismo valor.'],
    ej: `Trabajó 30 días: ${M(AUX)}. Trabajó 15 días: ${M(AUX / 2)}. Gana ${M(3800000)}: no recibe auxilio.`, refs: ['dec1470', 'auxPrest', 'auxMedio'], go: 'aux' },
  uvt: { t: 'UVT (Unidad de Valor Tributario)', s: `Unidad que usa la DIAN para expresar valores de impuestos. En 2026, 1 UVT = ${M(UVT)}.`,
    l: ['La DIAN fija cada año el valor de la UVT. Así no tiene que cambiar las leyes cada año: los topes se escriben en UVT y se convierten a pesos con el valor del año.',
      'En nómina se usa sobre todo para la retención en la fuente: hasta 95 UVT de base no hay retención.'],
    ej: `95 UVT = 95 × ${M(UVT)} = ${M(95 * UVT)}.`, refs: ['res238'], go: 'rete' },
  devengado: { t: 'Devengado', s: 'Todo lo que el trabajador gana en el mes, antes de descuentos: salario, horas extra, recargos, auxilio, comisiones, bonificaciones…',
    l: ['El total devengado es la suma de todos los pagos del mes. Es el punto de partida de la nómina.',
      'Hay que separar lo SALARIAL (salario, extras, recargos, comisiones: cuenta para seguridad social y prestaciones) de lo NO SALARIAL (auxilio de transporte, bonificaciones pactadas como no salariales).'],
    ej: `Mínimo + auxilio: ${M(SM)} + ${M(AUX)} = ${M(SM + AUX)} devengado.`, refs: ['cst127', 'cst128'], go: 'devengado' },
  deducciones: { t: 'Deducciones', s: 'Lo que se le descuenta al trabajador: salud 4 %, pensión 4 %, Fondo de Solidaridad, retención en la fuente y otros descuentos autorizados.',
    l: ['Los descuentos de ley son salud (4 %) y pensión (4 %) sobre el IBC. Si gana 4 SMMLV o más, también el Fondo de Solidaridad Pensional; y si su ingreso depurado supera 95 UVT, retención en la fuente.',
      'Cualquier otro descuento (préstamos, libranzas, cuotas) necesita autorización escrita del trabajador o una orden judicial.'],
    ej: `Con el mínimo: 4 % de ${M(SM)} = ${M(Math.ceil(SM * 0.04 / 100) * 100)} de salud y lo mismo de pensión.`, refs: ['ley100_204', 'ley100_20', 'cst149'], go: 'neto' },
  neto: { t: 'Neto a pagar', s: 'Lo que realmente recibe el trabajador: devengado menos deducciones (y menos lo pagado en especie, si hay).',
    l: ['Neto = total devengado − total deducciones. Es lo que llega a la cuenta o se paga en efectivo.',
      'Si parte del salario se paga en especie (vivienda, comida), esa parte ya la recibió, así que se resta del pago en dinero.'],
    ej: `Mínimo: ${M(SM + AUX)} − ${M(140200)} = ${M(SM + AUX - 140200)}.`, refs: ['cst149', 'cst129'], go: 'neto' },
  costo: { t: 'Costo total para el empleador', s: 'Lo que realmente cuesta el trabajador: salario + aportes de seguridad social + parafiscales + prestaciones que se van ahorrando.',
    l: ['Un trabajador cuesta bastante más que su salario. Además de lo que se le paga, el empleador aporta su parte de pensión (12 %), salud (8,5 % si no está exonerado), ARL y Caja (4 %); y cada mes debe reservar prima, cesantías, intereses y vacaciones.',
      'El "factor de costo" dice cuántas veces el salario cuesta realmente. Con el mínimo suele estar entre 1,5 y 1,65.'],
    refs: ['ley100_20', 'ley21_12', 'cst249', 'cst306'], go: 'resumen' },
  ibc: { t: 'IBC · Ingreso Base de Cotización', s: 'La base sobre la que se calculan salud, pensión y ARL. Solo pagos salariales; mínimo 1 SMMLV, máximo 25 SMMLV.',
    l: ['El IBC se arma con los pagos salariales del mes: salario, horas extra, recargos, comisiones, vacaciones e incapacidades. El auxilio de transporte nunca entra.',
      'Tiene un piso de 1 SMMLV (por eso un trabajador de medio tiempo cotiza como si ganara el mínimo completo) y un techo de 25 SMMLV.',
      'Si los pagos no salariales superan el 40 % de todo lo que gana, el exceso se suma al IBC (Ley 1393).',
      'Excepción: quien trabaja por días y gana menos de 1 SMMLV en el mes puede cotizar por semanas (Decreto 2616): ¼ SMMLV por semana.'],
    ej: `Medio tiempo con ${M(SM / 2)}: el IBC sube a ${M(SM)}.`, refs: ['ley100_18', 'ley1393_30', 'dec2616'], go: 'ibc' },
  salud: { t: 'Salud (EPS)', s: 'Aporte del 12,5 % del IBC: el trabajador paga 4 % y el empleador 8,5 % (el empleador puede estar exonerado).',
    l: ['Cubre la atención médica del trabajador y su familia en la EPS. Al trabajador siempre se le descuenta el 4 %.',
      'El empleador paga 8,5 %, pero las empresas (y hogares con 2 o más trabajadores) no lo pagan por quienes ganan menos de 10 SMMLV (art. 114-1 del Estatuto Tributario).',
      'En PILA cada aporte se redondea al múltiplo de $100 hacia arriba.'],
    ej: `IBC ${M(SM)} × 4 % = ${M(SM * 0.04)} → se descuentan ${M(Math.ceil(SM * 0.04 / 100) * 100)}.`, refs: ['ley100_204', 'et1141', 'dec1990'], go: 'salud' },
  pension: { t: 'Pensión', s: 'Aporte del 16 % del IBC para la vejez: el trabajador paga 4 % y el empleador 12 %.',
    l: ['Es el ahorro para la pensión de vejez, invalidez o sobrevivientes. Se cotiza en Colpensiones o en un fondo privado.',
      'El trabajador aporta 4 % (se le descuenta) y el empleador 12 %. No hay exoneración para pensión.'],
    ej: `IBC ${M(SM)}: trabajador ${M(Math.ceil(SM * 0.04 / 100) * 100)}, empleador ${M(Math.ceil(SM * 0.12 / 100) * 100)}.`, refs: ['ley100_20', 'dec1990'], go: 'salud' },
  fsp: { t: 'Fondo de Solidaridad Pensional', s: 'Aporte adicional de 1 % a 2 % que paga quien cotiza sobre 4 SMMLV o más, para subsidiar a quienes no pueden cotizar.',
    l: ['Desde 4 SMMLV de IBC se descuenta 1 % adicional. Entre 16 y 20 SMMLV sube 0,2 % por cada salario mínimo, hasta 2 % por encima de 20 SMMLV.',
      'Lo paga solo el trabajador.'],
    ej: `Desde ${M(4 * SM)} de IBC aplica el 1 %.`, refs: ['ley797_8'], go: 'fsp' },
  retencion: { t: 'Retención en la fuente', s: 'Anticipo del impuesto de renta que el empleador descuenta y paga a la DIAN. Solo aplica si la base depurada supera 95 UVT.',
    l: ['Se calcula con el "procedimiento 1": al ingreso del mes se le restan los aportes obligatorios (salud, pensión, FSP), las deducciones (dependientes, medicina prepagada, intereses de vivienda) y la renta exenta del 25 %.',
      'Deducciones + rentas exentas no pueden superar el 40 % ni 1.340 UVT al año. Lo que queda (base gravable) se pasa a UVT y se busca en la tabla del art. 383.',
      'Con salarios bajos y medios normalmente no hay retención.'],
    ej: `La retención empieza cuando la base depurada pasa de 95 UVT (${M(95 * UVT)}).`, refs: ['et383', 'et206', 'et336', 'et387', 'res238'], go: 'rete' },
  arl: { t: 'ARL (riesgos laborales)', s: 'Seguro contra accidentes y enfermedades del trabajo. Lo paga 100 % el empleador según la clase de riesgo (I a V).',
    l: ['La ARL cubre accidentes de trabajo y enfermedades laborales. La tarifa depende del riesgo de la actividad: clase I (oficina) 0,522 % hasta clase V (alturas, minería) 6,96 %.',
      'Se paga sobre el IBC de los días efectivamente trabajados. Con cotización por semanas (Decreto 2616) se paga siempre sobre 1 SMMLV completo.',
      'La clase de riesgo la asigna la ARL según la actividad: confírmala con tu ARL (por ejemplo, el personal de aseo puede variar según la empresa y las tareas).'],
    ej: `Clase I con IBC ${M(SM)}: ${M(Math.ceil(SM * 0.00522 / 100) * 100)}.`, refs: ['arl', 'dec2616'], go: 'empresa' },
  caja: { t: 'Caja de Compensación Familiar', s: 'Aporte del 4 % que paga el empleador. Da subsidio familiar, recreación, educación y vivienda al trabajador.',
    l: ['Todo empleador, incluidos los hogares que contratan servicio doméstico, debe afiliar al trabajador a una Caja y aportar el 4 % de la nómina salarial.',
      'Las cajas pagan el subsidio familiar (cuota monetaria) y dan acceso a recreación, educación, crédito y subsidio de vivienda.'],
    refs: ['ley21_12', 'dec721'], go: 'empresa' },
  icbf_sena: { t: 'ICBF y SENA', s: 'Aportes parafiscales del 3 % (ICBF) y 2 % (SENA). Exonerados por trabajadores de menos de 10 SMMLV; los hogares no los pagan.',
    l: ['El ICBF (3 %) financia programas de niñez y familia; el SENA (2 %) la formación para el trabajo.',
      'Las empresas no los pagan por los trabajadores que ganan menos de 10 SMMLV (art. 114-1 E.T.). Los hogares que contratan servicio doméstico tampoco: solo aportan a Caja.'],
    refs: ['ley21_12', 'et1141', 'dec721'], go: 'empresa' },
  parafiscales: { t: 'Parafiscales', s: 'Aportes del empleador a Caja de Compensación (4 %), ICBF (3 %) y SENA (2 %), calculados sobre la nómina salarial.',
    l: ['Se llaman parafiscales porque son aportes obligatorios con destino específico. Siempre se paga Caja; ICBF y SENA pueden estar exonerados.'],
    refs: ['ley21_12', 'et1141'], go: 'empresa' },
  cesantias: { t: 'Cesantías', s: 'Un mes de salario por cada año trabajado. Se consignan a un fondo cada año y sirven de ahorro para cuando se queda sin empleo.',
    l: ['Se calculan con el salario + auxilio de transporte + promedio de lo variable (extras, comisiones). Equivalen al 8,33 % de lo devengado cada mes.',
      'El empleador las consigna al fondo de cesantías antes del 14 de febrero del año siguiente. Si termina el contrato, se pagan directamente al trabajador.',
      'El trabajador puede retirarlas para vivienda, educación o al quedar cesante.'],
    ej: `Un año con mínimo + auxilio: ${M(SM + AUX)}.`, refs: ['cst249'], go: 'prest' },
  intereses: { t: 'Intereses sobre cesantías', s: 'El 12 % anual sobre las cesantías. Se pagan directamente al trabajador a más tardar el 31 de enero.',
    l: ['Fórmula: cesantías × días trabajados × 12 % ÷ 360. Si trabajó todo el año, es el 12 % de las cesantías.'],
    ej: `Cesantías de ${M(SM + AUX)} por un año → intereses de ${M((SM + AUX) * 0.12)}.`, refs: ['ley52'], go: 'prest' },
  prima: { t: 'Prima de servicios', s: 'Medio salario por semestre (30 días al año). Se paga la mitad antes del 30 de junio y la otra antes del 20 de diciembre.',
    l: ['Base: salario + auxilio de transporte + promedio variable. Fórmula: base × días trabajados en el semestre ÷ 360.',
      'Desde la Ley 1788 de 2016 también la reciben las trabajadoras y trabajadores del servicio doméstico.'],
    ej: `Semestre completo con mínimo: (${M(SM)} + ${M(AUX)}) × 180 ÷ 360 = ${M((SM + AUX) / 2)}.`, refs: ['cst306', 'ley1788'], go: 'prest' },
  vacaciones: { t: 'Vacaciones', s: '15 días hábiles de descanso pagado por cada año trabajado. Se pagan con el salario ordinario, sin auxilio ni horas extra.',
    l: ['Se ganan 15 días hábiles por año (1,25 días por mes). Los domingos y festivos dentro de las vacaciones no se descuentan, por eso se descansa más días calendario.',
      'Se pagan con el salario ordinario al momento de salir: sin auxilio de transporte, horas extra ni recargos. Si el salario es variable, con el promedio del último año.',
      'Se pueden acumular hasta 2 años. Al terminar el contrato, las pendientes se pagan en dinero.'],
    ej: `Con el mínimo: ${M(SM)} ÷ 30 × 15 = ${M(SM / 2)}.`, refs: ['cst186'], go: 'novedades' },
  incapacidad: { t: 'Incapacidad por enfermedad general', s: 'Días que el trabajador no puede trabajar por enfermedad. Se pagan al 66,67 %, pero nunca menos del mínimo diario.',
    l: ['Los días 1 y 2 los paga el empleador; desde el día 3 la EPS (normalmente la empresa paga y luego le cobra a la EPS).',
      'El valor es dos tercios del salario, sin bajar del salario mínimo diario. En días de incapacidad no se paga auxilio de transporte.'],
    ej: `Con el mínimo, 66,67 % quedaría debajo del mínimo diario, así que se paga ${M(SM / 30)} por día.`, refs: ['cst227', 'dec780', 'incapMin'], go: 'novedades' },
  extras: { t: 'Horas extras', s: 'Horas trabajadas por encima de la jornada. Se paga la hora completa + 25 % (diurna) o + 75 % (nocturna); en domingo se suma el recargo dominical.',
    l: ['Hora extra diurna: ×1,25. Hora extra nocturna: ×1,75. Si además es domingo o festivo, se suma el recargo dominical (80 % o 90 % en 2026).',
      'Máximo 2 horas extra al día y 12 a la semana. Se calculan sobre el valor de la hora ordinaria.'],
    ej: `Con el mínimo y jornada de 42 h: hora ${M(SM / 210)} → extra diurna ${M(SM / 210 * 1.25)}.`, refs: ['cst168', 'ley50_22', 'ley2466_14'], go: 'extras' },
  recargos: { t: 'Recargos (nocturno, dominical y festivo)', s: 'Adicional por trabajar de noche (35 %) o en domingo/festivo (80 % hasta junio, 90 % desde julio de 2026) dentro de la jornada normal.',
    l: ['A diferencia de la hora extra, el recargo se paga por horas que están DENTRO de la jornada. Como esa hora ya está en el salario, solo se paga el porcentaje adicional.',
      'Nocturno: 7:00 p.m. a 6:00 a.m. (35 %). Dominical/festivo: 80 % desde julio 2025, 90 % desde julio 2026 y 100 % desde julio 2027. Nocturno + dominical se suman.'],
    ej: `Hora mínima ${M(SM / 210)} × 90 % = ${M(SM / 210 * 0.9)} de recargo por hora en domingo.`, refs: ['ley2466_14', 'ley2466_10', 'cst168'], go: 'recargos' },
  nocturno: { t: 'Trabajo nocturno', s: 'Desde la reforma laboral, es el que se hace entre las 7:00 p.m. y las 6:00 a.m.',
    l: ['Antes empezaba a las 9:00 p.m. Desde el 25 de diciembre de 2025 empieza a las 7:00 p.m. Cada hora nocturna ordinaria tiene recargo del 35 %.'], refs: ['ley2466_10'], go: 'extras' },
  dominical: { t: 'Descanso dominical proporcional', s: 'Quien trabaja solo algunos días de la semana tiene derecho al domingo pagado en proporción: un día por cada 6 trabajados.',
    l: ['El domingo es día de descanso pagado. Quien trabaja toda la semana lo recibe completo (ya va en el salario mensual).',
      'Quien trabaja por días (por ejemplo, una empleada doméstica que va 2 días por semana) tiene derecho a ese descanso en proporción a lo que trabajó: días trabajados ÷ 6.'],
    ej: `8 días en el mes con jornal de ${M(80000)}: dominical = ${M(80000)} × 8 ÷ 6 = ${M(80000 * 8 / 6)}.`, refs: ['cst173'], go: 'casos' },
  especie: { t: 'Salario en especie', s: 'Parte del salario que se paga con alimentación, vivienda o vestuario. Máximo 30 % si gana el mínimo; 50 % en los demás casos.',
    l: ['Es común en servicio doméstico interno: el hogar da vivienda y comida y, si así se pacta por escrito con un valor, puede contar como parte del salario.',
      'Debe valorarse expresamente en el contrato. Cuenta para seguridad social y prestaciones, pero no se paga en dinero: por eso se resta del pago en efectivo.',
      'Si gana el salario mínimo, la parte en especie no puede pasar del 30 %; en los demás casos, del 50 %.'],
    ej: `Gana el mínimo: máximo ${M(SM * 0.3)} en especie; recibe en dinero al menos ${M(SM * 0.7)} + auxilio.`, refs: ['cst129'], go: 'casos' },
  valordia: { t: 'Valor del día', s: 'Salario mensual ÷ 30. En nómina todos los meses se cuentan de 30 días (mes comercial).',
    l: ['Aunque el mes tenga 28 o 31 días, en nómina se usan 30. Así el salario mensual es igual todos los meses.'], ej: `${M(SM)} ÷ 30 = ${M(SM / 30)}.`, refs: ['mes30'], go: 'dia' },
  valorhora: { t: 'Valor de la hora ordinaria', s: 'Salario ÷ horas del mes. Con 44 h semanales se divide por 220; con 42 h, por 210.',
    l: ['Horas del mes = (horas semanales ÷ 6) × 30. Con la jornada de 42 horas (desde el 15 de julio de 2026) son 210 horas.',
      'La ley no fija un divisor único: algunos usan 42 × 52 ÷ 12 ≈ 182 h. Aquí se usa el método de 30 días, que es el más común.'],
    ej: `${M(SM)} ÷ 210 = ${M(SM / 210)} por hora.`, refs: ['ley2101', 'horasPractica'], go: 'hora' },
  provision: { t: 'Provisión de prestaciones', s: 'Lo que el empleador debe reservar cada mes para pagar después prima, cesantías, intereses y vacaciones.',
    l: ['Las prestaciones se pagan en fechas específicas, pero se causan cada día trabajado. Por eso el empleador "provisiona" cada mes: 8,33 % cesantías, 1 % intereses, 8,33 % prima y 4,17 % vacaciones.'], refs: ['cst249', 'cst306', 'cst186'], go: 'prest' },
  indemnizacion: { t: 'Indemnización por despido sin justa causa', s: 'Pago al trabajador cuando lo despiden sin una razón válida. En contrato indefinido: 30 días el primer año + 20 por cada año adicional (salario < 10 SMMLV).',
    l: ['Aplica cuando el empleador termina el contrato sin justa causa. Si gana menos de 10 SMMLV: 30 días de salario por el primer año y 20 días por cada año adicional (proporcional por fracción). Si gana 10 SMMLV o más: 20 días el primer año y 15 por cada año adicional.',
      'Si renuncia o lo despiden con justa causa, no hay indemnización (pero sí se pagan prestaciones y vacaciones pendientes).'], refs: [] },
  dias360: { t: 'Días trabajados (año de 360)', s: 'En liquidaciones cada mes cuenta como 30 días y el año como 360, aunque el calendario diga otra cosa.',
    l: ['Se cuentan los días entre la fecha inicial y la final, ambas incluidas, con meses de 30 días. Por eso un año completo son 360 días.'], refs: ['mes30'] },
  dotacion: { t: 'Dotación', s: 'Quien gana hasta 2 SMMLV y lleva más de 3 meses recibe gratis un par de zapatos y un vestido de labor cada 4 meses.',
    l: ['Se entrega en especie (no en dinero) tres veces al año. Aplica también al personal de aseo y al servicio doméstico.'], refs: ['cst230'], go: 'casos' },
  integral: { t: 'Salario integral', s: 'Salario de mínimo 13 SMMLV que incluye todas las prestaciones. No tiene prima, cesantías, horas extra ni recargos aparte; cotiza sobre el 70 %.',
    l: [`Se compone de 10 SMMLV de salario + 30 % de factor prestacional: mínimo ${M(13 * SM)} en 2026. Debe pactarse por escrito.`,
      'Sí tiene vacaciones. Para seguridad social y parafiscales solo cuenta el 70 % del salario.'], refs: ['cst132', 'ley789_49'], go: 'salario' },
  mediotiempo: { t: 'Medio tiempo', s: 'Trabajar la mitad de la jornada máxima (21 o 22 h semanales). El salario mínimo es proporcional, pero salud y pensión se cotizan sobre al menos 1 SMMLV.',
    l: [`El salario puede ser proporcional: mínimo ${M(SM / 2)}. El auxilio de transporte se paga completo si va a trabajar todos los días.`,
      'Para salud y pensión el IBC no puede ser menor a 1 SMMLV: cotiza como si ganara el mínimo completo.',
      'Prima, cesantías y vacaciones se calculan sobre lo que realmente gana.'], refs: ['cst145', 'ley100_18', 'auxMedio'], go: 'casos' },
  pordias: { t: 'Trabajo por días', s: 'Se paga un valor por cada día trabajado (jornal). Mínimo SMMLV ÷ 30 por día, más el descanso dominical proporcional.',
    l: ['Típico en el aseo de casas: la persona va algunos días a la semana. Se le paga el jornal de cada día + el dominical proporcional + auxilio de transporte proporcional, y tiene prima, cesantías y vacaciones en proporción.',
      'Si en el mes gana menos de 1 SMMLV, puede cotizar por semanas (Decreto 2616): pensión y caja sobre ¼ SMMLV por semana, ARL sobre 1 SMMLV. Salud queda en el régimen subsidiado.'],
    ej: `Jornal mínimo 2026: ${M(SM / 30)}.`, refs: ['cst173', 'dec2616', 'ley2466_34'], go: 'casos' },
  domestico: { t: 'Servicio doméstico', s: 'Trabajo de aseo, cocina o cuidado en una casa de familia. Tiene los mismos derechos que cualquier trabajador, con contrato escrito obligatorio.',
    l: ['Puede ser interna (vive en la casa), externa (va y vuelve cada día) o por días. Tiene salario mínimo, auxilio de transporte, prima, cesantías, intereses, vacaciones, dotación y seguridad social.',
      'Desde la Ley 2466 de 2025 el contrato debe ser escrito y registrarse en PILA. El hogar aporta a Caja de Compensación pero no a SENA ni ICBF. Si el hogar tiene un solo trabajador, paga salud 8,5 %.',
      'La interna no puede trabajar más de 10 horas diarias; lo que pase de ahí son horas extra.'], refs: ['ley2466_33', 'ley1788', 'dec721', 'c372', 'cst129'], go: 'casos' },
  aseo: { t: 'Personal de aseo en empresas', s: 'Trabajador con contrato laboral normal: salario mínimo o más, auxilio, prestaciones, dotación y seguridad social completa.',
    l: ['Si trabaja para una empresa (directamente o por una empresa de aseo), se liquida como cualquier trabajador. Si es medio tiempo, aplica el mínimo proporcional y el IBC mínimo de 1 SMMLV.',
      'La clase de riesgo ARL depende de las tareas: confírmala con la ARL.'], refs: ['cst145', 'cst230', 'arl'], go: 'casos' },
  hogar: { t: 'Empleador hogar', s: 'Una familia que contrata servicio doméstico. Paga salud, pensión, ARL y Caja, pero no SENA ni ICBF.',
    l: ['El hogar es una persona natural empleadora. Solo queda exonerado de salud 8,5 % si tiene 2 o más trabajadores.', 'Puede pagar la seguridad social a tiempo parcial por semanas cuando el trabajo es por días.'],
    refs: ['dec721', 'et1141', 'ley2466_34'], go: 'casos' },
  nosalarial: { t: 'Pagos no salariales', s: 'Pagos que no retribuyen directamente el trabajo (bonificaciones ocasionales o pactadas como no salariales). No suman a prestaciones.',
    l: ['Deben pactarse expresamente. No cuentan para prima, cesantías ni vacaciones.', 'Pero ojo: si superan el 40 % de toda la remuneración, el exceso sí cotiza a seguridad social (Ley 1393).'],
    refs: ['cst128', 'ley1393_30'], go: 'ibc' },

  // ===== Campos de los formularios =====
  mes: { t: 'Mes que liquidas', s: 'El mes cambia dos reglas en 2026: el recargo dominical (80 % → 90 % el 1 de julio) y la jornada (44 → 42 h el 15 de julio).',
    l: ['Elige el mes de la nómina. De enero a junio el recargo dominical es 80 %; desde julio, 90 %. La jornada máxima es 44 h hasta el 14 de julio y 42 h desde el 15.'], refs: ['ley2466_14', 'ley2101'] },
  jornadaMax: { t: 'Jornada máxima legal', s: 'El máximo de horas ordinarias por semana: 44 h hasta el 14-jul-2026 y 42 h desde el 15-jul-2026. Define el valor de la hora.',
    l: ['La Ley 2101 de 2021 bajó la jornada de 48 a 42 horas de forma gradual. Con menos horas, cada hora vale más y las horas extra cuestan más.', 'Se elige sola según el mes, pero puedes cambiarla (por ejemplo, para la segunda quincena de julio).'], refs: ['ley2101'] },
  tipoSalario: { t: 'Tipo de salario', s: 'Ordinario (el normal, con prestaciones aparte) o integral (desde 13 SMMLV, con prestaciones incluidas).', l: ['Casi todos los trabajadores tienen salario ordinario. El integral es para salarios altos y debe pactarse por escrito.'], refs: ['cst132'] },
  jornadaTipo: { t: 'Jornada del trabajador', s: 'Tiempo completo, medio tiempo, otra cantidad de horas o por días. Cambia el mínimo legal, el auxilio y la forma de cotizar.',
    l: ['Tiempo completo: la jornada máxima. Medio tiempo: la mitad. Otra: indica horas por semana. Por días: se paga un jornal por cada día trabajado (típico en el aseo de casas).'], refs: ['cst145', 'cst173'] },
  horasSemana: { t: 'Horas pactadas por semana', s: 'Para jornadas parciales: cuántas horas trabaja a la semana. El mínimo se calcula en proporción.', l: ['Ejemplo: 24 h de 42 h = 57 % de la jornada → mínimo proporcional 57 % del SMMLV.'], refs: ['cst145'] },
  jornal: { t: 'Valor del día (jornal)', s: `Lo que se paga por cada día trabajado. Mínimo ${M(SM / 30)} (SMMLV ÷ 30).`, l: ['Además del jornal, por cada 6 días trabajados se paga un día de descanso dominical.'], refs: ['cst145', 'cst173'] },
  diasTrab: { t: 'Días trabajados en el mes', s: 'Cuántos días fue a trabajar en el mes. Define el pago, el dominical proporcional, el auxilio y las semanas de cotización.', l: ['Para cotizar por semanas: 1–7 días = 1 semana, 8–14 = 2, 15–21 = 3, más de 21 = 4 (mes completo).'], refs: ['dec2616'] },
  cotizaSemanas: { t: 'Cotizar por semanas (Decreto 2616)', s: 'Si trabaja por días y gana menos de 1 SMMLV en el mes, puede cotizar pensión y caja por semanas en vez del mes completo.',
    l: ['Pensión y Caja: ¼ SMMLV por cada semana trabajada. ARL: sobre 1 SMMLV. No incluye salud (queda en el régimen subsidiado o como beneficiario).', 'Si lo desmarcas, cotiza como mes completo sobre 1 SMMLV.'], refs: ['dec2616', 'ley2466_34'] },
  salario: { t: 'Salario mensual pactado', s: 'Lo que se acordó pagar al mes por el trabajo, sin auxilio de transporte. No puede ser menor al mínimo (o al mínimo proporcional).', l: ['Si incluye una parte en especie (vivienda, comida), escribe el salario total y la parte en especie en su campo.'], refs: ['cst145', 'dec1469'] },
  diasPeriodo: { t: 'Días del periodo', s: 'Normalmente 30. Usa menos si el trabajador ingresó o se retiró en este mes.', l: ['En nómina todos los meses son de 30 días. Si entró el día 16, el periodo es de 15 días.'], refs: ['mes30'] },
  auxCompleto: { t: 'Auxilio completo en medio tiempo', s: 'Si trabaja medio tiempo pero va todos los días, el Ministerio de Trabajo indica pagar el auxilio completo.', l: ['El auxilio es para el transporte: si se desplaza todos los días, gasta lo mismo que alguien de tiempo completo. Es un criterio del Ministerio, no una ley.'], refs: ['auxMedio'] },
  diasVac: { t: 'Días de vacaciones en el mes', s: 'Días calendario de vacaciones que caen en este mes. Se pagan con el salario ordinario, sin auxilio.', l: ['Si solo sabes los días hábiles, usa la pestaña Vacaciones para convertirlos en días calendario.'], refs: ['cst186'] },
  diasIncap: { t: 'Días de incapacidad', s: 'Días de incapacidad por enfermedad general en el mes. Se pagan al 66,67 % sin bajar del mínimo diario.', l: [], refs: ['cst227', 'dec780'] },
  hed: { t: 'Hora extra diurna', s: 'Hora adicional a la jornada entre 6 a.m. y 7 p.m. Vale la hora ordinaria × 1,25.', l: [], refs: ['cst168'] },
  hen: { t: 'Hora extra nocturna', s: 'Hora adicional a la jornada entre 7 p.m. y 6 a.m. Vale la hora ordinaria × 1,75.', l: [], refs: ['cst168', 'ley2466_10'] },
  heddf: { t: 'Hora extra diurna en domingo/festivo', s: 'Extra diurna (25 %) en domingo o festivo: se suma el recargo dominical. ×2,05 hasta junio; ×2,15 desde julio de 2026.', l: [], refs: ['cst168', 'ley2466_14'] },
  hendf: { t: 'Hora extra nocturna en domingo/festivo', s: 'Extra nocturna (75 %) en domingo o festivo: ×2,55 hasta junio; ×2,65 desde julio de 2026.', l: [], refs: ['cst168', 'ley2466_14'] },
  rn: { t: 'Recargo nocturno', s: 'Horas ordinarias (dentro de la jornada) trabajadas entre 7 p.m. y 6 a.m. Se paga solo el 35 % adicional.', l: [], refs: ['cst168', 'ley2466_10'] },
  rdf: { t: 'Recargo dominical/festivo', s: 'Horas ordinarias trabajadas en domingo o festivo. Se paga solo el adicional: 80 % hasta junio, 90 % desde julio de 2026.', l: ['Si el trabajo en domingo es ocasional, además puede pedir un día de descanso compensatorio o el pago; si es habitual, tiene derecho al descanso compensatorio.'], refs: ['ley2466_14'] },
  rndf: { t: 'Recargo nocturno dominical/festivo', s: 'Horas ordinarias de noche en domingo o festivo: 35 % + recargo dominical (125 % desde julio de 2026).', l: [], refs: ['cst168', 'ley2466_14'] },
  comisiones: { t: 'Comisiones o bonificación salarial', s: 'Pagos variables que retribuyen el trabajo. Son salario: cuentan para seguridad social y prestaciones.', l: [], refs: ['cst127'] },
  noSalarial: { t: 'Bonificación no salarial', s: 'Pago pactado expresamente como no salarial. No suma a prestaciones; a seguridad social solo si supera el 40 % del total.', l: [], refs: ['cst128', 'ley1393_30'] },
  otrasDed: { t: 'Otros descuentos', s: 'Préstamos, libranzas, embargos o cuotas. Requieren autorización escrita del trabajador u orden judicial.', l: [], refs: ['cst149'] },
  calcRete: { t: 'Calcular retención', s: 'Activa el cálculo de retención en la fuente (procedimiento 1). Con salarios bajos el resultado suele ser $0.', l: [], refs: ['et383'] },
  dependientes: { t: 'Dependientes económicos', s: 'Hijos, cónyuge o padres que dependen del trabajador. Permiten deducir 10 % del ingreso (máx. 32 UVT al mes) en la retención.', l: [], refs: ['et387'] },
  prepagada: { t: 'Medicina prepagada', s: 'Lo que paga al mes por medicina prepagada o seguro de salud. Se deduce en la retención hasta 16 UVT al mes.', l: [], refs: ['et387'] },
  vivienda: { t: 'Intereses de vivienda', s: 'Intereses del crédito de vivienda. Se deducen en la retención hasta 100 UVT al mes.', l: [], refs: ['et387'] },
  empleador: { t: 'Tipo de empleador', s: 'Empresa u hogar. Un hogar (servicio doméstico) no paga SENA ni ICBF y solo está exonerado de salud si tiene 2 o más trabajadores.', l: [], refs: ['dec721', 'et1141'] },
  hogarVarios: { t: 'Hogar con 2 o más trabajadores', s: 'Las personas naturales con 2 o más trabajadores quedan exoneradas de salud 8,5 % por quienes ganan menos de 10 SMMLV.', l: [], refs: ['et1141'] },
  exonerado: { t: 'Empresa exonerada', s: 'Las empresas no pagan salud 8,5 %, SENA ni ICBF por trabajadores que ganan menos de 10 SMMLV. Casi todas las empresas lo están.', l: ['No aplica, por ejemplo, a entidades sin ánimo de lucro (que tienen reglas propias). Si tienes dudas, consulta a tu contador.'], refs: ['et1141'] },
  arlCampo: { t: 'Clase de riesgo ARL', s: 'De I (oficina, 0,522 %) a V (alturas, minería, 6,96 %). La define la ARL según la actividad.', l: [], refs: ['arl'] },
  fechaIngreso: { t: 'Fecha de ingreso', s: 'El primer día del contrato. Con ella se calcula el tiempo total trabajado.', l: [], refs: ['mes30'] },
  fechaCorte: { t: 'Fecha de corte o retiro', s: 'El día hasta el que liquidas: el último día trabajado o la fecha en que quieres ver lo acumulado.', l: [], refs: ['mes30'] },
  salarioBasico: { t: 'Salario básico mensual', s: 'El salario fijo mensual, sin auxilio ni extras. Si cambió en los últimos meses, revisa la regla del promedio con tu contador.', l: [], refs: ['cst249'] },
  promExtras: { t: 'Promedio de horas extra y recargos', s: 'Lo que en promedio recibe al mes por extras y recargos. Suma para prima y cesantías, pero no para vacaciones.', l: [], refs: ['cst249', 'cst186'] },
  promComis: { t: 'Promedio de comisiones', s: 'Lo que en promedio recibe al mes por comisiones. Suma para prima, cesantías y vacaciones.', l: [], refs: ['cst127'] },
  vacTomadas: { t: 'Días de vacaciones ya disfrutados', s: 'Días hábiles de vacaciones que ya tomó durante el contrato. Se restan de los ganados.', l: [], refs: ['cst186'] },
  primaPagada: { t: 'Prima del semestre ya pagada', s: 'Si ya le pagaste la prima de este semestre, elige "Sí" para no contarla dos veces.', l: [], refs: ['cst306'] },
  motivo: { t: 'Motivo de terminación', s: 'Renuncia o justa causa: no hay indemnización. Despido sin justa causa en contrato indefinido: sí hay indemnización.', l: [], refs: [] },
  vacBase: { t: 'Salario base para vacaciones', s: 'Salario ordinario sin auxilio de transporte ni horas extra. Si es variable, el promedio del último año.', l: [], refs: ['cst186'] },
  vacInicio: { t: 'Primer día de vacaciones', s: 'Desde qué día sale a vacaciones. La calculadora cuenta los días hábiles saltando domingos y festivos de 2026.', l: [], refs: ['cst186'] },
  vacDias: { t: 'Días hábiles a disfrutar', s: 'Normalmente 15 por año. Se cuentan solo días hábiles: los domingos y festivos no se descuentan.', l: [], refs: ['cst186'] },
  sabado: { t: '¿El sábado es hábil?', s: 'Por regla general sí. Si el contrato o el reglamento dice que la semana es de lunes a viernes, desmárcalo.', l: [], refs: ['cst186'] },
};

// Campos → explicación (por id del input)
const FIELD_HELP = {
  mes: 'mes', jornadaMax: 'jornadaMax', tipoSalario: 'tipoSalario', jornadaTipo: 'jornadaTipo', horasSemana: 'horasSemana', jornal: 'jornal', diasTrab: 'diasTrab',
  cotizaSemanas: 'cotizaSemanas', salario: 'salario', diasPeriodo: 'diasPeriodo', auxCompleto: 'auxCompleto', diasVac: 'diasVac', diasIncap: 'diasIncap',
  h_hed: 'hed', h_hen: 'hen', h_heddf: 'heddf', h_hendf: 'hendf', h_rn: 'rn', h_rdf: 'rdf', h_rndf: 'rndf',
  comisiones: 'comisiones', noSalarial: 'noSalarial', especie: 'especie', otrasDed: 'otrasDed', calcRete: 'calcRete', dependientes: 'dependientes',
  prepagada: 'prepagada', vivienda: 'vivienda', empleador: 'empleador', hogarVarios: 'hogarVarios', arl: 'arlCampo', exonerado: 'exonerado',
  pTipo: 'tipoSalario', pIngreso: 'fechaIngreso', pCorte: 'fechaCorte', pSalario: 'salarioBasico', pExtras: 'promExtras', pComis: 'promComis', pAux: 'aux',
  pVacTomadas: 'vacTomadas', pPrimaPagada: 'primaPagada', pMotivo: 'motivo',
  vSalario: 'vacBase', vInicio: 'vacInicio', vDias: 'vacDias', vSabado: 'sabado', vIngreso: 'fechaIngreso', vCorte: 'fechaCorte', vTomados: 'vacTomadas',
};
// Controles del sandbox (por data-k)
const DATAK_HELP = { ...FIELD_HELP, arl: 'arlCampo', 'horas.hed': 'hed', 'horas.hen': 'hen', 'horas.heddf': 'heddf', 'horas.hendf': 'hendf', 'horas.rn': 'rn', 'horas.rdf': 'rdf', 'horas.rndf': 'rndf' };

// Textos de resultados → concepto (el orden importa)
const AUTO = [
  [/Base gravable|Tabla art\. 383|Renta exenta|^\(−\) Dependientes|Medicina prepagada|Intereses de vivienda|Aportes obligatorios|Ingresos laborales|Retención|Pasar a UVT/i, 'retencion'],
  [/Fondo de Solidaridad|Solidaridad/i, 'fsp'],
  [/Intereses (sobre )?cesant/i, 'intereses'],
  [/Descanso dominical|dominical proporcional/i, 'dominical'],
  [/especie/i, 'especie'],
  [/^Salud|Salud del trabajador|Salud empleador|Salud empresa/i, 'salud'],
  [/^Pensión|Pensión del trabajador|Pensión empleador|Pensión empresa/i, 'pension'],
  [/Auxilio/i, 'aux'],
  [/IBC|Ingreso Base|Cotización por semanas|Ajuste al mínimo|Tope máximo/i, 'ibc'],
  [/40 %|no salarial/i, 'nosalarial'],
  [/Hora extra|^Extra |Extras|horas extras/i, 'extras'],
  [/Recargo/i, 'recargos'],
  [/Incapacidad/i, 'incapacidad'],
  [/Vacaciones|Días ganados|Días pendientes|días hábiles|Días calendario|Valor a pagar|Regresa/i, 'vacaciones'],
  [/Cesantías/i, 'cesantias'],
  [/Prima/i, 'prima'],
  [/^ARL/i, 'arl'],
  [/Caja/i, 'caja'],
  [/ICBF|SENA/i, 'icbf_sena'],
  [/Parafiscales/i, 'parafiscales'],
  [/Indemnización/i, 'indemnizacion'],
  [/Provisi/i, 'provision'],
  [/COSTO|Costo|Factor de costo/i, 'costo'],
  [/NETO|Neto/, 'neto'],
  [/deducciones|Deducciones/, 'deducciones'],
  [/Devengado|devengado/, 'devengado'],
  [/Comisiones/i, 'comisiones'],
  [/Valor (del )?día|Valor día|jornal/i, 'valordia'],
  [/Valor hora|Horas al mes|hora ordinaria|Horas del mes/i, 'valorhora'],
  [/Tiempo total|Días para|Tiempo de servicio|Tiempo trabajado/i, 'dias360'],
  [/SMMLV|salarios mínimos|salario mínimo/i, 'smmlv'],
  [/UVT/, 'uvt'],
  [/Jornada/i, 'jornadaMax'],
  [/Nocturno/i, 'nocturno'],
  [/Salario/i, 'salario'],
];
function conceptoDe(txt) { for (const [re, k] of AUTO) if (re.test(txt)) return k; return null; }

// ---------- 2. Inyectar botones "?" ----------
function hqBtn(key) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'hq'; b.dataset.help = key; b.textContent = '?';
  b.setAttribute('aria-label', 'Qué significa: ' + HELP[key].t);
  return b;
}
function attach(host, key, where = 'append') {
  if (!host || !HELP[key] || host.dataset.hqt) return;
  host.dataset.hqt = '1'; host.dataset.help = key; host.classList.add('has-help');
  const b = hqBtn(key);
  if (where === 'afterText') {
    const first = [...host.childNodes].find(nd => nd.nodeType === 3 && nd.textContent.trim());
    if (first && first.nextSibling) host.insertBefore(b, first.nextSibling); else host.appendChild(b);
  } else host.appendChild(b);
}
function labelDe(input) {
  if (!input) return null;
  if (input.type === 'checkbox') { const l = input.closest('label'); return l ? (l.querySelector('span') || l) : null; }
  return (input.id && document.querySelector(`label[for="${input.id}"]`)) || null;
}
let tagging = false;
function tagAll() {
  tagging = true;
  try {
    for (const [id, key] of Object.entries(FIELD_HELP)) attach(labelDe(document.getElementById(id)), key);
    document.querySelectorAll('#sbMain [data-k]').forEach(el => { if (el.dataset.r) return; attach(labelDe(el), DATAK_HELP[el.dataset.k]); });
    document.querySelectorAll('table.calc td:first-child, table.ref td:first-child, .kpi .t, #chips .chip, .eq .cap, #sbSlip .ln span:first-child, .pgroup > .lbl').forEach(el => {
      if (el.dataset.hqt) return;
      const txt = (el.childNodes[0] && el.childNodes[0].textContent || el.textContent || '').trim();
      if (!txt) return;
      let key = /Aseo y servicio/.test(txt) ? 'domestico' : conceptoDe(txt);
      if (!key) { el.dataset.hqt = '1'; return; }
      attach(el, key, el.tagName === 'TD' ? 'afterText' : 'append');
    });
  } finally { tagging = false; }
}
let tagQueued = false;
const obs = new MutationObserver(() => { if (tagging || tagQueued) return; tagQueued = true; setTimeout(() => { tagQueued = false; tagAll(); }, 30); });

// ---------- 3. Tooltip (pasar el mouse) ----------
const tip = document.createElement('div');
tip.id = 'helpTip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
document.body.appendChild(tip);
let tipTimer = null;
function showTip(el, key) {
  const h = HELP[key]; if (!h) return;
  tip.innerHTML = `<b>${esc(h.t)}</b><p>${esc(h.s)}</p><span>Haz clic en <i class="hq hq-mini">?</i> para la explicación completa</span>`;
  tip.hidden = false;
  const r = el.getBoundingClientRect(), tw = Math.min(320, innerWidth - 24);
  tip.style.maxWidth = tw + 'px';
  const th = tip.offsetHeight;
  let top = r.bottom + 8; if (top + th > innerHeight - 8) top = r.top - th - 8;
  let left = Math.min(Math.max(12, r.left), innerWidth - tip.offsetWidth - 12);
  tip.style.top = Math.max(8, top) + 'px'; tip.style.left = left + 'px';
}
function hideTip() { clearTimeout(tipTimer); tip.hidden = true; }
const canHover = matchMedia('(hover: hover)').matches;
document.addEventListener('mouseover', e => {
  if (!canHover || document.body.classList.contains('touring')) return;
  const q = e.target.closest('.hq, .has-help');
  if (!q) return;
  const key = q.dataset.help; clearTimeout(tipTimer);
  tipTimer = setTimeout(() => showTip(q, key), q.classList.contains('hq') ? 80 : 450);
});
document.addEventListener('mouseout', e => { const q = e.target.closest('.hq, .has-help'); if (q && !q.contains(e.relatedTarget)) hideTip(); });
document.addEventListener('focusin', e => { if (e.target.classList && e.target.classList.contains('hq')) showTip(e.target, e.target.dataset.help); });
document.addEventListener('focusout', e => { if (e.target.classList && e.target.classList.contains('hq')) hideTip(); });
addEventListener('scroll', hideTip, { passive: true });

// ---------- 4. Modal (clic) ----------
const dlg = document.createElement('dialog');
dlg.className = 'help-modal'; dlg.setAttribute('aria-labelledby', 'hmTitle');
document.body.appendChild(dlg);
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
function abrirAyuda(key) {
  const h = HELP[key]; if (!h) return;
  hideTip();
  const goIdx = h.go && typeof STEPS !== 'undefined' ? STEPS.findIndex(s => s.id === h.go) : -1;
  dlg.innerHTML = `
    <div class="hm-head"><h2 id="hmTitle">${esc(h.t)}</h2><button type="button" class="hm-x" data-close aria-label="Cerrar">×</button></div>
    <div class="hm-body">
      <p class="hm-lead">${esc(h.s)}</p>
      ${h.l.map(p => `<p>${esc(p)}</p>`).join('')}
      ${h.ej ? `<div class="hm-ej"><b>Ejemplo 2026</b><span>${esc(h.ej)}</span></div>` : ''}
      ${h.refs && h.refs.length ? `<h3>¿De dónde sale? · Referencia oficial</h3><div class="refs">${h.refs.map(refHTML).join('')}</div>` : ''}
    </div>
    <div class="hm-foot">
      ${goIdx >= 0 ? `<button type="button" class="btn" data-go-sb="${goIdx}">Verlo paso a paso en el sandbox →</button>` : '<span></span>'}
      <button type="button" class="btn primary" data-close>Entendido</button>
    </div>`;
  if (!dlg.open) dlg.showModal();
  dlg.querySelector('.hm-body').scrollTop = 0;
  dlg.querySelector('[data-close].btn').focus();
}
dlg.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) { dlg.close(); return; }
  const g = e.target.closest('[data-go-sb]');
  if (g) { dlg.close(); $('#t-sandbox').click(); ir(+g.dataset.goSb); return; }
  const k = e.target.closest('[data-glos]'); if (k) abrirAyuda(k.dataset.glos);
});
document.addEventListener('click', e => {
  const q = e.target.closest('.hq'); if (!q || q.closest('#helpTip')) return;
  e.preventDefault(); e.stopPropagation(); abrirAyuda(q.dataset.help);
}, true);

// ---------- 5. Glosario ----------
const CONCEPTOS = ['smmlv', 'aux', 'devengado', 'deducciones', 'neto', 'costo', 'ibc', 'salud', 'pension', 'fsp', 'retencion', 'uvt', 'arl', 'caja', 'icbf_sena', 'parafiscales',
  'cesantias', 'intereses', 'prima', 'vacaciones', 'incapacidad', 'extras', 'recargos', 'nocturno', 'dominical', 'especie', 'valordia', 'valorhora', 'provision',
  'indemnizacion', 'dias360', 'dotacion', 'integral', 'mediotiempo', 'pordias', 'domestico', 'aseo', 'hogar', 'nosalarial'];
function abrirGlosario() {
  hideTip();
  const items = CONCEPTOS.map(k => [k, HELP[k]]).sort((a, b) => a[1].t.localeCompare(b[1].t, 'es'));
  dlg.innerHTML = `
    <div class="hm-head"><h2 id="hmTitle">Glosario de nómina</h2><button type="button" class="hm-x" data-close aria-label="Cerrar">×</button></div>
    <div class="hm-body">
      <input type="search" id="glosQ" class="glos-q" placeholder="Busca: prima, IBC, por días, doméstica…" aria-label="Buscar en el glosario">
      <ul class="glos-list" id="glosList">${items.map(([k, h]) => `<li data-t="${esc((h.t + ' ' + h.s).toLowerCase())}"><button type="button" data-glos="${k}"><b>${esc(h.t)}</b><span>${esc(h.s)}</span></button></li>`).join('')}</ul>
    </div>
    <div class="hm-foot"><span class="hint">${items.length} conceptos · clic para ver la explicación completa</span><button type="button" class="btn primary" data-close>Cerrar</button></div>`;
  if (!dlg.open) dlg.showModal();
  const q = $('#glosQ'); q.focus();
  q.addEventListener('input', () => {
    const v = q.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    dlg.querySelectorAll('#glosList li').forEach(li => { li.hidden = v && !li.dataset.t.normalize('NFD').replace(/[̀-ͯ]/g, '').includes(v); });
  });
}

// ---------- 6. Tutorial guiado "Enséñame" ----------
const hole = document.createElement('div'); hole.className = 'tour-hole'; hole.hidden = true;
const pop = document.createElement('div'); pop.className = 'tour-pop'; pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-live', 'polite');
document.body.append(hole, pop);

const sbIdx = id => STEPS.findIndex(s => s.id === id);
const F = (id, key, extra) => ({ sel: '#' + id, up: '.field, .check, .hx, .ctrl', help: key, x: extra });

const TOUR_INTRO = [
  { sel: 'header.top h1', t: 'Bienvenido al tutorial', x: 'Te voy a mostrar cada parte de esta sección y para qué sirve. Avanza con «Siguiente» o con las flechas del teclado. Sal cuando quieras con «Salir» o Esc.' },
  { sel: '#chips', t: 'Los valores clave de 2026', x: `Aquí están los números que usa todo el cálculo: salario mínimo ${M(SM)}, auxilio de transporte ${M(AUX)}, UVT ${M(UVT)}, el recargo dominical, la jornada y el horario nocturno. Cada uno tiene su «?» con la explicación y la norma.` },
  { sel: 'nav.tabs', t: 'Las secciones', x: '★ Sandbox: aprende paso a paso. 1 · Nómina mensual: la calculadora completa. 2 · Prestaciones: liquidación por fechas. 3 · Vacaciones: días y fecha de regreso. 4 · Aprende: tablas, glosario y quiz. Este tutorial explica la sección que tengas abierta.' },
  { sel: '.top-actions', t: 'Ayuda siempre a la mano', x: '«Enséñame» abre este tutorial. «Glosario» tiene todos los conceptos con buscador. Y junto a cada dato verás un botón «?»: pasa el mouse para la explicación corta y haz clic para la completa con ejemplo y referencia oficial.' },
];

const TOURS = {
  'tab-sandbox': [
    { before: () => ir(0), sel: '#sbPills', t: 'El recorrido', x: 'El sandbox tiene 18 pasos. Cada pastilla es un paso: haz clic en cualquiera para saltar. Las verdes ya las viste.' },
    { sel: '#sbMain .presets', t: 'Elige un trabajador', x: 'Empieza con un caso típico: salario mínimo, medio tiempo, aseo en empresa, doméstica interna o por días, vigilante… Luego puedes cambiar cualquier dato.' },
    { before: () => ir(sbIdx('salario')), sel: '#sbMain h2', t: 'Cada paso explica un concepto', x: 'Arriba está el tema del paso y una explicación sencilla de qué es y por qué importa.' },
    { sel: '#sbMain .sb-sec.ctrls', t: 'Juega con los datos', x: 'Mueve las barras o escribe valores. Todo se recalcula al instante: los cálculos de abajo y el desprendible de la derecha.' },
    { sel: '#sbCalc', t: 'Así se calcula', x: 'La fórmula con TUS números. Azul = tu dato, amarillo = valor fijado por la ley, verde = resultado. Así ves de dónde sale cada peso.' },
    { sel: '#sbMain .try', t: '¿Y si…?', x: 'Un experimento para entender la regla: cambia un dato y observa qué pasa.' },
    { sel: '#sbMain .quizbox', t: 'Ponte a prueba', x: 'Calcula tú y escribe tu respuesta. Te dice si acertaste; si no, puedes ver la solución con la fórmula.' },
    { sel: '#sbMain .refs', t: '¿De dónde sale? Referencia oficial', x: 'Cada regla tiene su norma: ley, artículo, qué dice y un enlace al texto oficial. Las marcadas «Doctrina / Práctica» no son ley, son criterios de aplicación.' },
    { sel: '#sbSlip', t: 'Tu desprendible de nómina', x: 'Se llena a medida que avanzas. La línea resaltada es la del paso actual; las que tienen «· · ·» las verás más adelante.' },
    { before: () => ir(sbIdx('casos')), sel: '#sbMain h2', t: 'Aseo, medio tiempo y servicio doméstico', x: 'Este paso explica los casos especiales: medio tiempo, trabajo por días (jornal y dominical proporcional), cotización por semanas, salario en especie y las reglas del servicio doméstico.' },
    { sel: '#sbNext', t: 'Avanza', x: 'Usa «Siguiente» y «Anterior» (o las flechas del teclado). Al final verás el resumen con el costo real del trabajador y todas las fuentes.' },
  ],
  'tab-nomina': [
    { sel: '#presets', t: 'Ejemplos rápidos', x: 'Carga un caso con un clic: básicos, aseo y servicio doméstico (interna, externa, por días) u otros oficios. Después modifícalo para ver qué cambia.' },
    F('mes', 'mes'), F('jornadaMax', 'jornadaMax'), F('tipoSalario', 'tipoSalario'), F('jornadaTipo', 'jornadaTipo'),
    F('salario', 'salario'), F('diasPeriodo', 'diasPeriodo'),
    { sel: '#cardNovedades', t: 'Novedades del mes', help: 'vacaciones', x: 'Días de vacaciones e incapacidad que cayeron este mes. Se pagan distinto y no llevan auxilio de transporte.' },
    { sel: '#hxList', t: 'Horas extras y recargos', help: 'extras', x: 'Escribe cuántas horas de cada tipo trabajó. Debajo de cada nombre ves el factor y cuánto vale cada hora con el salario actual. Cada una tiene su «?».' },
    F('comisiones', 'comisiones'), F('noSalarial', 'noSalarial'), F('especie', 'especie'), F('otrasDed', 'otrasDed'),
    { sel: '#calcRete', up: '.card', t: 'Retención en la fuente', help: 'retencion', x: 'Activa el cálculo y agrega deducciones (dependientes, prepagada, vivienda). Con salarios bajos da $0.' },
    F('empleador', 'empleador'), F('arl', 'arlCampo'), F('exonerado', 'exonerado'),
    { sel: '#kpis', t: 'El resultado en 4 números', help: 'neto', x: 'Devengado (lo que gana), deducciones (lo que se le descuenta), neto (lo que recibe) y costo para la empresa.' },
    { sel: '#stack', up: '.card', t: '¿A dónde va el dinero?', help: 'costo', x: 'La barra reparte el costo total: neto al trabajador, sus descuentos, aportes del empleador y prestaciones.' },
    { sel: '#alerts', t: 'Avisos', x: 'Aquí aparecen errores (salario por debajo del mínimo, especie mayor al tope…) y recordatorios como la dotación o las reglas del servicio doméstico.', optional: true },
    { sel: '#steps', t: 'El cálculo paso a paso', x: 'Seis pasos con cada concepto, su fórmula con números reales y una nota explicativa. Cada concepto tiene su «?».' },
  ],
  'tab-prest': [
    F('pTipo', 'tipoSalario'), F('pIngreso', 'fechaIngreso'), F('pCorte', 'fechaCorte'), F('pSalario', 'salarioBasico'), F('pExtras', 'promExtras'), F('pComis', 'promComis'),
    F('pAux', 'aux'), F('pVacTomadas', 'vacTomadas'), F('pPrimaPagada', 'primaPagada'), F('pMotivo', 'motivo'),
    { sel: '#pKpis', t: 'Resultado', help: 'prima', x: 'Prima, vacaciones y el total acumulado o de la liquidación.' },
    { sel: '#pSteps', t: 'Cómo se calculó', help: 'dias360', x: 'Primero el tiempo trabajado (año de 360 días), luego cesantías, intereses, prima, vacaciones e indemnización si aplica.' },
  ],
  'tab-vac': [
    F('vSalario', 'vacBase'), F('vInicio', 'vacInicio'), F('vDias', 'vacDias'), F('vSabado', 'sabado'),
    { sel: '#vOut .kpis', t: 'Resultado', help: 'vacaciones', x: 'Cuánto se paga, cuántos días calendario descansa y qué día regresa.' },
    { sel: '#vOut .cal', up: '.card', t: 'Calendario', x: 'Verde = día hábil de vacaciones. Amarillo = domingo o festivo (no se descuenta). El último es el día de regreso.' },
    F('vIngreso', 'fechaIngreso', 'Calcula cuántos días de vacaciones tienes acumulados desde que entraste.'), F('vTomados', 'vacTomadas'),
  ],
  'tab-aprende': [
    { sel: '#learn .flow', up: '.card', t: 'La nómina en 6 pasos', x: 'El mapa general: valor día/hora → devengados → IBC → deducciones → neto → costo empresa.' },
    { sel: '#learn table.ref', up: '.card', t: 'Tablas de referencia', x: 'Valores 2026, recargos, aportes y prestaciones. Cada concepto tiene su «?».' },
    { sel: '#quizBox', up: '.card', t: 'Quiz', x: 'Pon a prueba lo que aprendiste. Cada respuesta trae su explicación.' },
    { sel: '#learn .refs', up: '.card', t: 'Todas las referencias oficiales', x: 'De dónde sale cada regla, con enlace al texto oficial, y la prensa usada para contrastar los valores de 2026.' },
  ],
};

let tour = null, tIdx = 0;
function activeTab() { const t = document.querySelector('.panel.active'); return t ? t.id : 'tab-sandbox'; }
function startTour() {
  hideTip(); if (dlg.open) dlg.close();
  tour = [...TOUR_INTRO, ...(TOURS[activeTab()] || [])];
  tIdx = 0; document.body.classList.add('touring'); hole.hidden = false; pop.hidden = false;
  showStep(0);
}
function endTour() {
  tour = null; document.body.classList.remove('touring'); hole.hidden = true; pop.hidden = true;
  try { localStorage.setItem('nomina-welcome', '1'); } catch (e) { /* ignore */ }
}
function stepEl(st) {
  let el = document.querySelector(st.sel);
  if (el && st.up) el = el.closest(st.up) || el;
  return el && el.getClientRects().length ? el : null;
}
function showStep(i, dir = 1) {
  if (!tour) return;
  if (i < 0) i = 0;
  if (i >= tour.length) { endTour(); return; }
  const st = tour[i];
  if (st.before) { try { st.before(); } catch (e) { /* ignore */ } }
  const el = stepEl(st);
  if (!el) { showStep(i + dir, dir); return; }   // si no está visible, saltar
  tIdx = i;
  const h = st.help ? HELP[st.help] : null;
  const titulo = st.t || (h && h.t) || '';
  const texto = st.x || (h ? h.s : '');
  const extra = h ? (st.x ? h.s : (h.l[0] || '')) : '';
  pop.innerHTML = `
    <div class="tp-count">${i + 1} / ${tour.length}</div>
    <h3>${esc(titulo)}</h3>
    <p>${esc(texto)}</p>
    ${extra ? `<p class="tp-more">${esc(extra)}</p>` : ''}
    <div class="tp-nav">
      <button type="button" class="btn" data-t="end">Salir</button>
      <span>${h ? `<button type="button" class="btn" data-t="more" data-k="${st.help}">Explicación completa</button>` : ''}</span>
      <span class="tp-r"><button type="button" class="btn" data-t="prev" ${i === 0 ? 'disabled' : ''}>←</button>
      <button type="button" class="btn primary" data-t="next">${i === tour.length - 1 ? 'Terminar' : 'Siguiente →'}</button></span>
    </div>`;
  el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  place(el);
  setTimeout(() => place(el), 350);
  pop.querySelector('[data-t="next"]').focus({ preventScroll: true });
}
function place(el) {
  if (!tour) return;
  const r = el.getBoundingClientRect(), pad = 6;
  Object.assign(hole.style, { top: (r.top - pad) + 'px', left: (r.left - pad) + 'px', width: (r.width + pad * 2) + 'px', height: (r.height + pad * 2) + 'px' });
  if (innerWidth < 640) { pop.style.left = '8px'; pop.style.right = '8px'; pop.style.top = 'auto'; pop.style.bottom = '8px'; return; }
  pop.style.right = 'auto'; pop.style.bottom = 'auto';
  const pw = pop.offsetWidth, ph = pop.offsetHeight;
  let top = r.bottom + 14;
  if (top + ph > innerHeight - 8) top = r.top - ph - 14;
  if (top < 8) top = Math.min(innerHeight - ph - 8, Math.max(8, r.top + 8));
  const left = Math.min(Math.max(8, r.left), innerWidth - pw - 8);
  pop.style.top = top + 'px'; pop.style.left = left + 'px';
}
function replace() { if (tour) { const el = stepEl(tour[tIdx]); if (el) place(el); } }
addEventListener('scroll', replace, { passive: true });
addEventListener('resize', replace);
pop.addEventListener('click', e => {
  const b = e.target.closest('[data-t]'); if (!b) return;
  if (b.dataset.t === 'next') showStep(tIdx + 1, 1);
  else if (b.dataset.t === 'prev') showStep(tIdx - 1, -1);
  else if (b.dataset.t === 'end') endTour();
  else if (b.dataset.t === 'more') abrirAyuda(b.dataset.k);
});
document.addEventListener('keydown', e => {
  if (!tour || dlg.open) return;
  if (e.key === 'Escape') { endTour(); e.preventDefault(); }
  else if (e.key === 'ArrowRight') { showStep(tIdx + 1, 1); e.preventDefault(); e.stopImmediatePropagation(); }
  else if (e.key === 'ArrowLeft') { showStep(tIdx - 1, -1); e.preventDefault(); e.stopImmediatePropagation(); }
}, true);

// ---------- 7. Bienvenida (primera visita) ----------
function bienvenida() {
  dlg.innerHTML = `
    <div class="hm-head"><h2 id="hmTitle">¿Primera vez aquí?</h2><button type="button" class="hm-x" data-close aria-label="Cerrar">×</button></div>
    <div class="hm-body">
      <p class="hm-lead">Esta calculadora te enseña a liquidar una nómina en Colombia 2026, desde el salario mínimo hasta el costo total para el empleador. Incluye medio tiempo, trabajo por días, personal de aseo y servicio doméstico.</p>
      <p>Hay tres formas de aprender:</p>
      <ul class="checks">
        <li class="ok"><span><b>Tutorial guiado:</b> te muestro cada parte de la pantalla, una por una.</span></li>
        <li class="ok"><span><b>Sandbox paso a paso:</b> construyes un desprendible de nómina concepto por concepto, con su norma oficial.</span></li>
        <li class="ok"><span><b>Botones <i class="hq hq-mini">?</i>:</b> junto a cada dato. Pasa el mouse para una explicación corta o haz clic para la completa.</span></li>
      </ul>
    </div>
    <div class="hm-foot hm-foot-3">
      <button type="button" class="btn" data-w="solo">Explorar solo</button>
      <button type="button" class="btn" data-w="sandbox">Ir al sandbox</button>
      <button type="button" class="btn primary" data-w="tour">Sí, enséñame</button>
    </div>`;
  dlg.showModal();
  dlg.querySelector('[data-w="tour"]').focus();
}
dlg.addEventListener('click', e => {
  const w = e.target.closest('[data-w]'); if (!w) return;
  try { localStorage.setItem('nomina-welcome', '1'); } catch (err) { /* ignore */ }
  dlg.close();
  if (w.dataset.w === 'sandbox') { $('#t-sandbox').click(); ir(0); }
  if (w.dataset.w === 'tour') startTour();
});
dlg.addEventListener('close', () => { try { localStorage.setItem('nomina-welcome', '1'); } catch (e) { /* ignore */ } });

// ---------- 8. Arranque ----------
$('#tourBtn').addEventListener('click', startTour);
$('#glosBtn').addEventListener('click', abrirGlosario);
tagAll();
obs.observe(document.body, { childList: true, subtree: true });
let visto = false;
try { visto = !!localStorage.getItem('nomina-welcome'); } catch (e) { visto = true; }
if (!visto && !navigator.webdriver) setTimeout(bienvenida, 400);
