'use strict';
/* =========================================================================
   MODO SANDBOX · recorrido guiado paso a paso
   Usa lo que define nomina.js: P, calcNomina, factoresHoras, reglasMes,
   TABLA383, MESES, money, n, pctTxt, esc, $.
   Cada paso tiene: controles (para jugar), cálculo en vivo, "¿Y si…?",
   una pregunta para practicar y la REFERENCIA OFICIAL de donde sale la regla.
   ========================================================================= */

// ---------- 1. Fuentes oficiales (verificadas: responden y corresponden a la norma) ----------
const OFICIAL = {
  CST: 'http://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo.html',
  ET: 'http://www.secretariasenado.gov.co/senado/basedoc/estatuto_tributario.html',
  L100: 'http://www.secretariasenado.gov.co/senado/basedoc/ley_0100_1993.html',
  L797: 'http://www.secretariasenado.gov.co/senado/basedoc/ley_0797_2003.html',
  L789: 'http://www.secretariasenado.gov.co/senado/basedoc/ley_0789_2002.html',
  L1393: 'http://www.secretariasenado.gov.co/senado/basedoc/ley_1393_2010.html',
  L2101: 'http://www.secretariasenado.gov.co/senado/basedoc/ley_2101_2021.html',
  L2466: 'http://www.secretariasenado.gov.co/senado/basedoc/ley_2466_2025.html',
  L50: 'https://normativa.colpensiones.gov.co/colpensiones/compilacion/docs/ley_0050_1990.htm',
  L21: 'https://normativa.colpensiones.gov.co/colpensiones/compilacion/docs/ley_0021_1982.htm',
  D1469: 'https://normograma.mintic.gov.co/mintic/compilacion/docs/decreto_1469_2025.htm',
  D0159: 'https://cancilleria.gov.co/normograma/compilacion/docs/decreto_0159_2026.htm',
  D1470: 'https://normativa.colpensiones.gov.co/colpensiones/compilacion/docs/decreto_1470_2025.htm',
  R238: 'https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0238_2025.htm',
  D1990: 'https://normativa.colpensiones.gov.co/colpensiones/compilacion/docs/decreto_1990_2016.htm',
  D2616: 'https://normativa.colpensiones.gov.co/colpensiones/compilacion/docs/decreto_2616_2013.htm',
  D1072: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=72173',
  D780: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=77813',
};

// tipo: Ley · Código · Decreto · Resolución · Doctrina · Práctica   (las dos últimas NO son norma)
const REFS = {
  dec1469: { tipo: 'Decreto', norma: 'Decreto 1469 de 2025', art: 'art. 1', dice: 'Fija el salario mínimo de 2026 en $1.750.905 (alza del 23 %), desde el 1 de enero de 2026.', url: OFICIAL.D1469 },
  dec0159: { tipo: 'Decreto', norma: 'Decreto 0159 de 2026', art: '19 de febrero de 2026', dice: 'El Consejo de Estado suspendió provisionalmente el Decreto 1469; este decreto fija transitoriamente el salario mínimo 2026 en el mismo valor mientras se decide el fondo.', url: OFICIAL.D0159 },
  cst145: { tipo: 'Código', norma: 'Código Sustantivo del Trabajo', art: 'arts. 145 y 147', dice: 'Salario mínimo: lo que todo trabajador tiene derecho a recibir. Si la jornada es inferior a la máxima legal, el mínimo rige en proporción a las horas trabajadas (art. 147).', url: OFICIAL.CST },
  cst132: { tipo: 'Código', norma: 'Código Sustantivo del Trabajo', art: 'art. 132', dice: 'Salario integral: mínimo 10 SMMLV + 30 % de factor prestacional (13 SMMLV). Ya incluye prestaciones, recargos y horas extra.', url: OFICIAL.CST },
  ley789_49: { tipo: 'Ley', norma: 'Ley 789 de 2002', art: 'art. 49', dice: 'En salario integral, la base de cotización es el 70 % del salario.', url: OFICIAL.L789 },
  mes30: { tipo: 'Práctica', norma: 'Mes comercial de 30 días', art: 'convención de liquidación', dice: 'En nómina y liquidaciones todos los meses se cuentan de 30 días y el año de 360. No es un artículo puntual: es la forma aceptada de liquidar salarios mensuales y prestaciones.', url: '' },
  ley2101: { tipo: 'Ley', norma: 'Ley 2101 de 2021', art: 'arts. 2 y 3', dice: 'Reduce la jornada máxima a 42 h semanales de forma gradual: 47 h (2023), 46 h (2024), 44 h (15-jul-2025) y 42 h desde el 15 de julio de 2026.', url: OFICIAL.L2101 },
  horasPractica: { tipo: 'Práctica', norma: 'Divisor de horas del mes', art: 'cálculo contable', dice: 'La ley no fija una fórmula única para el valor hora. Lo usual es (horas semanales ÷ 6) × 30 → 220 h con 44 h y 210 h con 42 h. Otros usan semanas: 42 × 52 ÷ 12 ≈ 182 h.', url: '' },
  dec1470: { tipo: 'Decreto', norma: 'Decreto 1470 de 2025', art: 'arts. 1 y 2', dice: 'Auxilio de transporte 2026: $249.095 para quienes devenguen hasta 2 SMMLV. Si trabaja en casa sin desplazarse, se reconoce como auxilio de conectividad digital.', url: OFICIAL.D1470 },
  auxPrest: { tipo: 'Ley', norma: 'Ley 1 de 1963', art: 'art. 7', dice: 'El auxilio de transporte se tiene en cuenta como salario solo para liquidar prestaciones sociales (prima y cesantías), no para seguridad social ni vacaciones.', url: '' },
  auxMedio: { tipo: 'Doctrina', norma: 'Conceptos del Ministerio de Trabajo', art: 'medio tiempo', dice: 'El Ministerio ha señalado que quien trabaja medio tiempo y se desplaza todos los días recibe el auxilio completo. Es un criterio administrativo, no una ley.', url: '' },
  cst168: { tipo: 'Código', norma: 'Código Sustantivo del Trabajo', art: 'arts. 159 y 168', dice: 'Trabajo suplementario = el que excede la jornada. Recargos: nocturno 35 %, extra diurna 25 %, extra nocturna 75 %. Estos recargos no se acumulan entre sí (la extra nocturna es 75 %, no 35 % + 75 %).', url: OFICIAL.CST },
  ley2466_10: { tipo: 'Ley', norma: 'Ley 2466 de 2025 (reforma laboral)', art: 'art. 10 → modifica art. 160 CST', dice: 'Trabajo diurno: 6:00 a.m. a 7:00 p.m. Trabajo nocturno: 7:00 p.m. a 6:00 a.m.', url: OFICIAL.L2466 },
  ley2466_14: { tipo: 'Ley', norma: 'Ley 2466 de 2025 (reforma laboral)', art: 'art. 14 → modifica art. 179 CST', dice: 'El trabajo en domingo o festivo se paga con recargo del 100 %, aplicado gradualmente: 80 % desde 1-jul-2025, 90 % desde 1-jul-2026 y 100 % desde 1-jul-2027. Este recargo sí se suma al de hora extra.', url: OFICIAL.L2466 },
  ley50_22: { tipo: 'Ley', norma: 'Ley 50 de 1990', art: 'art. 22', dice: 'Las horas extra no pueden exceder 2 horas diarias ni 12 semanales.', url: OFICIAL.L50 },
  cst186: { tipo: 'Código', norma: 'Código Sustantivo del Trabajo', art: 'arts. 186, 189 y 192', dice: '15 días hábiles consecutivos de vacaciones remuneradas por año. Se pagan con el salario ordinario, sin horas extra ni recargos. Al terminar el contrato se compensan en dinero.', url: OFICIAL.CST },
  cst227: { tipo: 'Código', norma: 'Código Sustantivo del Trabajo', art: 'art. 227', dice: 'Incapacidad por enfermedad no profesional: auxilio de las dos terceras partes (66,67 %) del salario hasta por 180 días.', url: OFICIAL.CST },
  dec780: { tipo: 'Decreto', norma: 'Decreto 780 de 2016 (Único de Salud)', art: 'art. 3.2.1.10', dice: 'Los dos primeros días de incapacidad por enfermedad general los paga el empleador; desde el tercero, la EPS.', url: OFICIAL.D780 },
  incapMin: { tipo: 'Doctrina', norma: 'Corte Constitucional', art: 'jurisprudencia', dice: 'El pago de la incapacidad no puede ser inferior al salario mínimo, porque sustituye el ingreso del trabajador.', url: '' },
  cst127: { tipo: 'Código', norma: 'Código Sustantivo del Trabajo', art: 'art. 127', dice: 'Es salario todo lo que recibe el trabajador como contraprestación directa del servicio: salario fijo, horas extra, recargos, comisiones…', url: OFICIAL.CST },
  cst128: { tipo: 'Código', norma: 'Código Sustantivo del Trabajo', art: 'art. 128', dice: 'No son salario los pagos ocasionales por mera liberalidad ni los que las partes pacten expresamente como no salariales.', url: OFICIAL.CST },
  ley100_18: { tipo: 'Ley', norma: 'Ley 100 de 1993', art: 'arts. 18 y 204', dice: 'La base de cotización es el salario mensual. No puede ser menor a 1 SMMLV ni mayor a 25 SMMLV.', url: OFICIAL.L100 },
  ley1393_30: { tipo: 'Ley', norma: 'Ley 1393 de 2010', art: 'art. 30', dice: 'Los pagos no salariales no pueden superar el 40 % del total de la remuneración; lo que exceda se suma a la base de cotización.', url: OFICIAL.L1393 },
  dec2616: { tipo: 'Decreto', norma: 'Decreto 2616 de 2013', art: 'cotización por semanas', dice: 'Quien trabaja por periodos inferiores a 30 días y gana menos de 1 SMMLV puede cotizar por semanas. (No aplica a medio tiempo que trabaja todos los días.)', url: OFICIAL.D2616 },
  ley100_204: { tipo: 'Ley', norma: 'Ley 100 de 1993', art: 'art. 204', dice: 'Cotización a salud: 12,5 % del IBC → 8,5 % empleador y 4 % trabajador.', url: OFICIAL.L100 },
  ley100_20: { tipo: 'Ley', norma: 'Ley 100 de 1993', art: 'art. 20', dice: 'Cotización a pensión: 16 % del IBC → 12 % empleador y 4 % trabajador.', url: OFICIAL.L100 },
  dec1990: { tipo: 'Decreto', norma: 'Decreto 1990 de 2016', art: 'aproximaciones en PILA', dice: 'En la planilla PILA el IBC se aproxima al peso y el valor de cada cotización al múltiplo de $100 superior.', url: OFICIAL.D1990 },
  ley797_8: { tipo: 'Ley', norma: 'Ley 797 de 2003', art: 'art. 8 → modifica art. 27 Ley 100', dice: 'Fondo de Solidaridad Pensional: 1 % adicional desde 4 SMMLV; entre 16 y 20 SMMLV sube 0,2 % por cada salario, hasta 2 % por encima de 20.', url: OFICIAL.L797 },
  et383: { tipo: 'Ley', norma: 'Estatuto Tributario', art: 'art. 383', dice: 'Tabla de retención en la fuente para pagos laborales, en UVT: 0 % hasta 95 UVT; luego 19 %, 28 %, 33 %, 35 %, 37 % y 39 % marginal.', url: OFICIAL.ET },
  et206: { tipo: 'Ley', norma: 'Estatuto Tributario', art: 'art. 206 num. 10', dice: 'Es renta exenta el 25 % de los pagos laborales, limitado a 790 UVT anuales.', url: OFICIAL.ET },
  et336: { tipo: 'Ley', norma: 'Estatuto Tributario', art: 'art. 336', dice: 'Deducciones y rentas exentas juntas no pueden superar el 40 % del ingreso depurado ni 1.340 UVT anuales.', url: OFICIAL.ET },
  et387: { tipo: 'Ley', norma: 'Estatuto Tributario', art: 'arts. 119 y 387', dice: 'Deducciones: dependientes 10 % (máx. 32 UVT/mes), medicina prepagada (máx. 16 UVT/mes), intereses de vivienda (máx. 1.200 UVT/año ≈ 100 UVT/mes).', url: OFICIAL.ET },
  res238: { tipo: 'Resolución', norma: 'Resolución DIAN 000238 de 2025', art: 'art. 1', dice: 'Fija la UVT para 2026 en $52.374.', url: OFICIAL.R238 },
  cst149: { tipo: 'Código', norma: 'Código Sustantivo del Trabajo', art: 'art. 149', dice: 'El empleador no puede descontar nada del salario sin orden escrita del trabajador para cada caso o mandato judicial (salvo aportes de ley).', url: OFICIAL.CST },
  et1141: { tipo: 'Ley', norma: 'Estatuto Tributario', art: 'art. 114-1', dice: 'Exoneración: personas jurídicas (y naturales con 2 o más empleados) no pagan salud 8,5 %, SENA ni ICBF por trabajadores que ganan menos de 10 SMMLV.', url: OFICIAL.ET },
  ley21_12: { tipo: 'Ley', norma: 'Ley 21 de 1982 y Ley 89 de 1988', art: 'Ley 21 art. 12', dice: 'Aportes parafiscales del empleador privado: 4 % Caja de Compensación, 2 % SENA; y 3 % ICBF (Ley 89 de 1988).', url: OFICIAL.L21 },
  arl: { tipo: 'Decreto', norma: 'Decreto 1772 de 1994, art. 13 (compilado en el Decreto 1072 de 2015)', art: 'tabla de cotización ARL', dice: 'La ARL la paga 100 % el empleador según la clase de riesgo: I 0,522 % · II 1,044 % · III 2,436 % · IV 4,350 % · V 6,960 %.', url: OFICIAL.D1072 },
  cst249: { tipo: 'Código', norma: 'Código Sustantivo del Trabajo', art: 'art. 249', dice: 'Cesantías: un mes de salario por cada año de servicio y proporcional por fracción. Se consignan al fondo antes del 14 de febrero.', url: OFICIAL.CST },
  ley52: { tipo: 'Ley', norma: 'Ley 52 de 1975', art: 'art. 1', dice: 'Intereses sobre cesantías: 12 % anual, pagados directamente al trabajador en enero.', url: '' },
  cst306: { tipo: 'Código', norma: 'Código Sustantivo del Trabajo', art: 'art. 306', dice: 'Prima de servicios: 30 días de salario por año, pagada la mitad a más tardar el 30 de junio y la otra el 20 de diciembre.', url: OFICIAL.CST },
};

// Fuentes secundarias (prensa) con las que contrasté los valores 2026
const PRENSA = [
  ['Consultorsalud · Decretos 1469 y 1470 de 2025', 'https://consultorsalud.com/aumento-del-salario-minimo-en-colombia-2026/'],
  ['Portafolio · Consejo de Estado y el aumento del mínimo 2026', 'https://www.portafolio.co/economia/gobierno/consejo-de-estado-reactiva-el-aumento-del-23-del-salario-minimo-de-2026-esto-determino-498416'],
  ['Noticias Caracol · Recargo dominical al 90 % desde julio 2026', 'https://www.noticiascaracol.com/economia/recargo-dominical-aumenta-al-90-desde-este-1-de-julio-y-se-acerca-disminucion-de-jornada-laboral-a-42-horas-semanales-so35'],
  ['La República · Jornada de 42 horas', 'https://www.larepublica.co/economia/hoy-empieza-a-regir-reduccion-de-la-jornada-laboral-que-sera-de-42-horas-semanales-4436098'],
  ['Noticias RCN · Valor de la hora con jornada de 42 h', 'https://www.noticiasrcn.com/economia/reduccion-de-la-jornada-laboral-en-colombia-valor-de-la-hora-en-julio-1023632'],
  ['INCP · UVT 2026 en $52.374', 'https://incp.org.co/publicaciones/infoincp-publicaciones/impuestos/2025/12/dian-fijo-en-52-374-en-valor-de-la-uvt-para-el-ano-gravable-2026/'],
];

// ---------- 2. Estado del sandbox ----------
const HORAS0 = { hed: 0, hen: 0, heddf: 0, hendf: 0, rn: 0, rdf: 0, rndf: 0 };
function estadoBase(extra = {}) {
  const hoy = new Date();
  const mes = hoy.getFullYear() === P.anio ? hoy.getMonth() + 1 : 1;
  return {
    mes, jornadaMax: reglasMes(mes).jornadaMax, tipoSalario: 'ordinario', jornadaTipo: 'completo', horasSemana: 24,
    salario: P.SMMLV, diasPeriodo: 30, diasVac: 0, diasIncap: 0, auxCompleto: true, horas: { ...HORAS0 },
    comisiones: 0, noSalarial: 0, otrasDed: 0, calcRete: true, dependientes: false, prepagada: 0, vivienda: 0,
    arl: 0.00522, exonerado: true, ...extra,
  };
}
const SB_PRESETS = {
  'Salario mínimo': {},
  'Medio tiempo': { jornadaTipo: 'medio', salario: Math.round(P.SMMLV / 2) },
  'Mesero nocturno con domingos': { salario: 2000000, horas: { ...HORAS0, hen: 6, rn: 40, rdf: 16, rndf: 6 } },
  'Vendedor con comisiones': { salario: 2400000, comisiones: 900000, noSalarial: 300000, horas: { ...HORAS0, hed: 8 } },
  'Profesional con retención': { salario: 9500000, dependientes: true, prepagada: 450000, arl: 0.00522 },
  'Gerente con salario integral': { tipoSalario: 'integral', salario: 25000000 },
};

let S = estadoBase();
let cur = 0;
let R = null;      // resultado de calcNomina
try {
  const saved = JSON.parse(localStorage.getItem('nomina-sb') || 'null');
  if (saved && saved.S) { S = { ...estadoBase(), ...saved.S, horas: { ...HORAS0, ...(saved.S.horas || {}) } }; cur = saved.cur || 0; }
} catch (e) { /* sin almacenamiento */ }
function guardar() { try { localStorage.setItem('nomina-sb', JSON.stringify({ S, cur })); } catch (e) { /* ignore */ } }

function getK(k) { return k.split('.').reduce((o, p) => o[p], S); }
function setK(k, v) { const ps = k.split('.'); const last = ps.pop(); ps.reduce((o, p) => o[p], S)[last] = v; }

function calcular() {
  R = calcNomina({ ...S, recargoDom: reglasMes(S.mes).recargoDom });
  const d = R.d;
  d.hExtras = 0; d.hRec = 0; d.hx = [];
  if (!d.integral) for (const h of factoresHoras(d.R)) {
    const q = S.horas[h.id] || 0, v = d.valorHora * h.f * q;
    d.hx.push({ ...h, q, v });
    if (h.recargo) d.hRec += v; else d.hExtras += v;
  }
  return d;
}

// ---------- 3. Mini componentes visuales ----------
// tok: valor con etiqueta. k = 'in' (tu dato) | 'k' (valor legal) | 'out' (resultado). f = 'm' dinero | 'n' número | 'p' % | 't' texto
function tok(v, label, k = 'in', f = 'm') {
  const txt = f === 'm' ? money(v) : f === 'p' ? pctTxt(v) : f === 'n' ? n(v) : v;
  return `<span class="tok ${k}"><b>${esc(txt)}</b><small>${esc(label)}</small></span>`;
}
const op = s => `<span class="op">${s}</span>`;
const eq = (cap, ...parts) => `<div class="eq">${cap ? `<div class="cap">${esc(cap)}</div>` : ''}${parts.join('')}</div>`;
const checks = items => `<ul class="checks">${items.map(([cls, t]) => `<li class="${cls}">${t}</li>`).join('')}</ul>`;
const LEYENDA = `<div class="toklegend">${tok('dato', 'lo cambias tú', 'in', 't')}${tok('ley', 'valor fijado por norma', 'k', 't')}${tok('= resultado', 'se calcula', 'out', 't')}</div>`;
const tabla = rows => `<table class="calc"><tbody>${rows.map(r => `<tr class="${r.cls || ''}"><td>${r.c}${r.f ? `<span class="f">${esc(r.f)}</span>` : ''}</td><td class="v">${r.v}</td></tr>`).join('')}</tbody></table>`;

// ---------- 4. Los pasos ----------
const mesesOpts = MESES.map((m, k) => [k + 1, `${m} ${P.anio}`]);
const C = {
  mes: { k: 'mes', t: 'select', label: 'Mes que liquidas', opts: mesesOpts },
  jornadaTipo: { k: 'jornadaTipo', t: 'select', label: 'Jornada del trabajador', opts: [['completo', 'Tiempo completo'], ['medio', 'Medio tiempo'], ['otra', 'Otra (horas por semana)']] },
  horasSemana: { k: 'horasSemana', t: 'int', label: 'Horas pactadas por semana', min: 1, max: 44, when: () => S.jornadaTipo === 'otra' },
  jornadaMax: { k: 'jornadaMax', t: 'select', label: 'Jornada máxima legal vigente', opts: [[44, '44 h/semana (hasta 14-jul-2026)'], [42, '42 h/semana (desde 15-jul-2026)']] },
  salario: { k: 'salario', t: 'money', label: 'Salario mensual pactado', min: 0, max: 30000000, step: 10000 },
  tipoSalario: { k: 'tipoSalario', t: 'select', label: 'Tipo de salario', opts: [['ordinario', 'Ordinario'], ['integral', 'Integral']] },
};

const STEPS = [
  { // 0
    corto: 'Inicio', titulo: 'Bienvenido al sandbox de nómina',
    lead: ['La nómina es el cálculo de lo que se le paga a un trabajador cada mes y de lo que la empresa paga por él. Aquí vas a construir un desprendible de nómina real, línea por línea.',
      'En cada paso: cambia los datos, mira cómo se calcula, prueba el "¿Y si…?", ponte a prueba y revisa de qué norma sale la regla. El desprendible de la derecha se va llenando.'],
    controls: [C.mes, C.jornadaTipo, C.horasSemana],
    calc: () => `
      <p style="margin:0 0 8px">Elige un trabajador para empezar (puedes cambiar todo después):</p>
      <div class="presets">${Object.keys(SB_PRESETS).map(k => `<button type="button" class="btn" data-sbp="${esc(k)}">${esc(k)}</button>`).join('')}</div>
      <p style="margin:14px 0 6px" class="muted">Así leerás los cálculos:</p>${LEYENDA}
      <p style="margin:14px 0 6px" class="muted">Y así se marcan las referencias:</p>
      <div class="toklegend"><span class="tb">Ley / Código</span><span class="tb t-decreto">Decreto / Resolución</span><span class="tb t-doctrina">Doctrina / Práctica (no es norma)</span></div>`,
    tryIt: 'Elige "Mesero nocturno con domingos" y avanza: verás recargos, horas extra y cómo cambian todos los descuentos.',
    refs: [],
  },
  { // 1
    corto: 'Salario', titulo: 'El salario y los umbrales que lo cambian todo',
    lead: ['El salario se pacta entre trabajador y empresa, pero nunca puede ser menor al salario mínimo (SMMLV). Si trabaja menos horas que la jornada máxima, el mínimo es proporcional.',
      'Mide el salario en "número de SMMLV": varias reglas se activan al cruzar 2, 4, 10 o 13 salarios mínimos.'],
    controls: [C.salario, C.tipoSalario, C.jornadaTipo],
    calc: d => {
      const k = d.salario / P.SMMLV;
      return eq('¿Cuántos salarios mínimos gana?', tok(d.salario, 'salario'), op('÷'), tok(P.SMMLV, 'SMMLV 2026', 'k'), op('='), tok(n(k, 2) + ' SMMLV', 'resultado', 'out', 't'))
        + (d.fraccion < 1 ? eq('Mínimo proporcional (medio tiempo / parcial)', tok(P.SMMLV, 'SMMLV', 'k'), op('×'), tok(d.fraccion, 'de la jornada', 'in', 'p'), op('='), tok(d.minimoProp, 'mínimo para sus horas', 'out')) : '')
        + checks([
          d.integral ? [d.salario >= 13 * P.SMMLV ? 'ok' : 'bad', `Salario integral: mínimo 13 SMMLV (${money(13 * P.SMMLV)}) ${d.salario >= 13 * P.SMMLV ? '— cumple' : '— <b>NO cumple</b>'}`]
            : [d.salario + 1 >= d.minimoProp ? 'ok' : 'bad', `Gana al menos el mínimo${d.fraccion < 1 ? ' proporcional' : ''} (${money(d.minimoProp)}) ${d.salario + 1 >= d.minimoProp ? '— cumple' : '— <b>es ilegal</b>'}`],
          [d.tieneAux ? 'ok' : 'no', `Hasta 2 SMMLV (${money(2 * P.SMMLV)}) → recibe auxilio de transporte`],
          [d.tFSP ? 'ok' : 'no', `Desde 4 SMMLV (${money(4 * P.SMMLV)}) de IBC → aporta al Fondo de Solidaridad Pensional`],
          [d.salario < 10 * P.SMMLV && !d.integral ? 'ok' : 'no', `Menos de 10 SMMLV (${money(10 * P.SMMLV)}) → la empresa puede estar exonerada de salud 8,5 %, SENA e ICBF`],
          [d.salario >= 13 * P.SMMLV ? 'ok' : 'no', `Desde 13 SMMLV (${money(13 * P.SMMLV)}) → se puede pactar salario integral`],
        ]);
    },
    tryIt: 'Sube el salario a <b>$3.600.000</b>: mira cómo desaparece el auxilio de transporte del desprendible. Luego prueba con medio tiempo y medio mínimo.',
    quiz: { q: '¿Cuánto es 2 SMMLV en 2026? (tope para recibir auxilio de transporte)', a: () => 2 * P.SMMLV, exp: () => `${money(P.SMMLV)} × 2 = ${money(2 * P.SMMLV)}` },
    refs: ['dec1469', 'dec0159', 'cst145', 'cst132'],
  },
  { // 2
    corto: 'Valor día', titulo: 'Valor del día: el mes siempre tiene 30 días',
    lead: ['En nómina todos los meses son de 30 días ("mes comercial"), incluso febrero o los meses de 31. Así el salario mensual es igual todos los meses.',
      'Si el trabajador entró o salió a mitad de mes, se paga solo por los días del periodo.'],
    controls: [C.salario, { k: 'diasPeriodo', t: 'int', label: 'Días del periodo', min: 1, max: 30 }],
    calc: d => eq('1. Valor de un día', tok(d.salario, 'salario'), op('÷'), tok(30, 'días mes comercial', 'k', 'n'), op('='), tok(d.valorDia, 'valor día', 'out'))
      + eq(`2. Salario de los días laborados${d.diasVac || d.diasIncap ? ' (sin vacaciones ni incapacidad)' : ''}`, tok(d.valorDia, 'valor día', 'out'), op('×'), tok(d.diasLab, 'días laborados', 'in', 'n'), op('='), tok(d.salDias, 'salario del periodo', 'out')),
    tryIt: 'Pon <b>15 días</b>: así se liquida a alguien que entró el día 16. Observa que el auxilio de transporte también baja a la mitad.',
    quiz: { q: 'Con el salario actual, ¿cuánto vale un día de trabajo?', a: d => d.valorDia, exp: d => `${money(d.salario)} ÷ 30 = ${money(d.valorDia)}` },
    refs: ['mes30'],
  },
  { // 3
    corto: 'Valor hora', titulo: 'Valor de la hora y la jornada de 42 horas',
    lead: ['Para pagar horas extra y recargos necesitas el valor de una hora ordinaria. Se divide el salario entre las horas que el trabajador debe laborar en el mes.',
      'La jornada máxima viene bajando por la Ley 2101: 44 h hasta el 14 de julio de 2026 y 42 h desde el 15 de julio. Menos horas = cada hora vale más.'],
    controls: [C.mes, C.jornadaMax, C.jornadaTipo, C.horasSemana],
    calc: d => eq('1. Horas del mes', tok(d.horasSemana, 'horas/semana', 'in', 'n'), op('÷'), tok(6, 'días/semana', 'k', 'n'), op('×'), tok(30, 'días/mes', 'k', 'n'), op('='), tok(n(d.horasMes) + ' h', 'horas al mes', 'out', 't'))
      + eq('2. Valor de una hora ordinaria', tok(d.salario, 'salario'), op('÷'), tok(n(d.horasMes) + ' h', 'horas al mes', 'out', 't'), op('='), tok(d.valorHora, 'valor hora', 'out'))
      + `<div class="tl" style="margin-top:8px">${[[47, 'jul 2023'], [46, 'jul 2024'], [44, '15 jul 2025'], [42, '15 jul 2026']].map(([h, t]) => `<span class="${h === +S.jornadaMax ? 'on' : ''}"><b>${h} h</b>${t}</span>`).join('')}</div>`,
    tryIt: 'Cambia el mes de <b>junio</b> a <b>agosto</b>: la jornada pasa de 44 a 42 h y el valor hora sube de ' + money(P.SMMLV / 220) + ' a ' + money(P.SMMLV / 210) + ' con el mínimo.',
    quiz: { q: 'Con los datos actuales, ¿cuánto vale una hora ordinaria?', a: d => d.valorHora, exp: d => `${money(d.salario)} ÷ ${n(d.horasMes)} h = ${money(d.valorHora)}` },
    refs: ['ley2101', 'horasPractica'],
  },
  { // 4
    corto: 'Auxilio', titulo: 'Auxilio de transporte',
    lead: ['Es un pago para ayudar con el transporte a quienes ganan hasta 2 SMMLV. No es salario para seguridad social ni vacaciones, pero sí cuenta para prima y cesantías.',
      'Se paga por los días efectivamente trabajados: no se paga en vacaciones ni incapacidades.'],
    controls: [C.salario, { k: 'auxCompleto', t: 'toggle', label: 'Pagar completo aunque sea medio tiempo (va todos los días)', when: () => S.jornadaTipo !== 'completo' }],
    calc: d => {
      if (d.integral) return checks([['no', 'Salario integral: no tiene auxilio de transporte.']]);
      if (!d.tieneAux) return checks([['no', `Gana ${money(d.salario)}, más de 2 SMMLV (${money(2 * P.SMMLV)}): <b>no recibe auxilio</b>.`]]);
      const parcial = S.jornadaTipo !== 'completo' && !S.auxCompleto;
      return eq('Auxilio del mes', tok(P.AUX, 'auxilio 2026', 'k'), op('÷'), tok(30, 'días', 'k', 'n'), op('×'), tok(d.diasLab, 'días trabajados', 'in', 'n'),
        ...(parcial ? [op('×'), tok(d.fraccion, 'proporción jornada', 'in', 'p')] : []), op('='), tok(d.aux, 'auxilio', 'out'))
        + checks([['ok', `Gana ${money(d.salario)} ≤ ${money(2 * P.SMMLV)} → tiene derecho`], ['no', 'NO entra al IBC (salud, pensión)'], ['no', 'NO entra a la base de vacaciones'], ['ok', 'SÍ entra a la base de prima y cesantías']]);
    },
    tryIt: 'En el paso 7 agrega días de vacaciones y vuelve aquí: el auxilio baja porque esos días no se trabajan.',
    quiz: { q: '¿Cuánto auxilio recibe quien trabajó solo 15 días del mes?', a: () => P.AUX / 2, exp: () => `${money(P.AUX)} ÷ 30 × 15 = ${money(P.AUX / 2)}` },
    refs: ['dec1470', 'auxPrest', 'auxMedio'],
  },
  { // 5
    corto: 'Horas extra', titulo: 'Horas extras: trabajar más allá de la jornada',
    lead: ['Hora extra es la que pasa de la jornada pactada o de la máxima legal. Se paga la hora completa MÁS un recargo: 25 % si es diurna, 75 % si es nocturna.',
      'Si además es domingo o festivo, se suma el recargo dominical. Máximo 2 horas extra al día y 12 a la semana.'],
    controls: [
      { k: 'horas.hed', t: 'hours', label: 'Extras diurnas (6 a.m.–7 p.m.)', max: 60 },
      { k: 'horas.hen', t: 'hours', label: 'Extras nocturnas (7 p.m.–6 a.m.)', max: 60 },
      { k: 'horas.heddf', t: 'hours', label: 'Extras diurnas en domingo/festivo', max: 40 },
      { k: 'horas.hendf', t: 'hours', label: 'Extras nocturnas en domingo/festivo', max: 40 },
    ],
    calc: d => {
      const strip = `<div class="lbl">Un día de 24 horas según la Ley 2466 (amarillo = diurno, azul = nocturno)</div>
        <div class="day24">${Array.from({ length: 24 }, (_, h) => `<span class="${h >= 6 && h < 19 ? 'dd' : 'nn'}" title="${h}:00"></span>`).join('')}</div>
        <div class="day24lbl">${Array.from({ length: 24 }, (_, h) => `<span>${[0, 6, 12, 19].includes(h) ? h + 'h' : ''}</span>`).join('')}</div>`;
      if (d.integral) return strip + checks([['no', 'Salario integral: las horas extra ya están compensadas en el 30 % prestacional (art. 132 CST).']]);
      const ext = d.hx.filter(h => !h.recargo);
      return strip + ext.map(h => eq(`${h.nombre} · ${h.como}`, tok(d.valorHora, 'valor hora', 'out'), op('×'), tok('×' + n(h.f, 2), 'factor', 'k', 't'), op('×'), tok(h.q, 'horas', 'in', 'n'), op('='), tok(h.v, 'a pagar', 'out'))).join('')
        + eq('Total horas extras', tok(d.hExtras, 'total', 'out'))
        + (ext.reduce((a, h) => a + h.q, 0) > 52 ? checks([['bad', 'Más de 52 horas extra al mes supera el tope legal (12 por semana).']]) : '');
    },
    tryIt: 'Pon 2 horas extra diurnas y 2 nocturnas: la nocturna paga ×1,75 y la diurna ×1,25. Luego mira cómo sube el "Total devengado".',
    quiz: { q: 'Con tu salario, ¿cuánto vale UNA hora extra diurna?', a: d => d.valorHora * 1.25, exp: d => `${money(d.valorHora)} × 1,25 = ${money(d.valorHora * 1.25)}` },
    refs: ['cst168', 'ley2466_10', 'ley2466_14', 'ley50_22'],
  },
  { // 6
    corto: 'Recargos', titulo: 'Recargos: noche, domingos y festivos',
    lead: ['Recargo es trabajar DENTRO de tu jornada normal, pero de noche o en domingo/festivo. Como esa hora ya está pagada en el salario mensual, solo se paga el porcentaje adicional.',
      'El recargo dominical está subiendo por la reforma laboral: 80 % → 90 % (1 de julio de 2026) → 100 % (2027).'],
    controls: [C.mes,
      { k: 'horas.rn', t: 'hours', label: 'Horas ordinarias nocturnas', max: 120 },
      { k: 'horas.rdf', t: 'hours', label: 'Horas ordinarias en domingo/festivo (diurnas)', max: 80 },
      { k: 'horas.rndf', t: 'hours', label: 'Horas ordinarias nocturnas en domingo/festivo', max: 60 }],
    calc: d => {
      const tl = `<div class="tl">${[[0.80, 'desde 1 jul 2025'], [0.90, 'desde 1 jul 2026'], [1.00, 'desde 1 jul 2027']].map(([r, t]) => `<span class="${Math.abs(r - d.R) < 1e-9 ? 'on' : ''}"><b>${pctTxt(r)}</b>${t}</span>`).join('')}</div>`;
      if (d.integral) return tl + checks([['no', 'Salario integral: no se pagan recargos aparte.']]);
      const rec = d.hx.filter(h => h.recargo);
      return tl + rec.map(h => eq(`${h.nombre} · ${h.como}`, tok(d.valorHora, 'valor hora', 'out'), op('×'), tok(pctTxt(h.f), 'recargo', 'k', 't'), op('×'), tok(h.q, 'horas', 'in', 'n'), op('='), tok(h.v, 'a pagar', 'out'))).join('')
        + eq('Total recargos', tok(d.hRec, 'total', 'out'));
    },
    tryIt: 'Pon 8 horas en domingo y cambia el mes de <b>junio</b> a <b>julio</b>: el recargo pasa de 80 % a 90 %.',
    quiz: { q: 'Con tu salario y el mes elegido, ¿cuánto se paga de recargo por UNA hora ordinaria en domingo?', a: d => d.valorHora * d.R, exp: d => `${money(d.valorHora)} × ${pctTxt(d.R)} = ${money(d.valorHora * d.R)}` },
    refs: ['ley2466_14', 'ley2466_10', 'cst168'],
  },
  { // 7
    corto: 'Novedades', titulo: 'Novedades: vacaciones e incapacidades',
    lead: ['Las "novedades" son los días del mes que no se trabajaron pero sí se pagan (o se pagan distinto).',
      'Vacaciones: se pagan con el salario ordinario, sin auxilio ni horas extra. Incapacidad por enfermedad general: 66,67 % del salario, pero nunca menos del mínimo diario.'],
    controls: [{ k: 'diasVac', t: 'int', label: 'Días de vacaciones (calendario) en el mes', min: 0, max: 30 }, { k: 'diasIncap', t: 'int', label: 'Días de incapacidad por enfermedad general', min: 0, max: 30 }],
    calc: d => {
      const diaInc = d.diasIncap ? d.incap / d.diasIncap : Math.max(d.valorDia * 2 / 3, Math.min(P.SMMLV / 30, d.valorDia));
      return eq('Días del periodo', tok(d.diasPeriodo, 'periodo', 'in', 'n'), op('−'), tok(d.diasVac, 'vacaciones', 'in', 'n'), op('−'), tok(d.diasIncap, 'incapacidad', 'in', 'n'), op('='), tok(d.diasLab, 'días laborados', 'out', 'n'))
        + eq('Vacaciones', tok(d.valorDia, 'valor día'), op('×'), tok(d.diasVac, 'días', 'in', 'n'), op('='), tok(d.vac, 'vacaciones', 'out'))
        + eq('Incapacidad: valor diario', op('máx('), tok(d.valorDia * 2 / 3, '66,67 % del día'), op(';'), tok(Math.min(P.SMMLV / 30, d.valorDia), 'mínimo diario', 'k'), op(')'), op('='), tok(diaInc, 'por día', 'out'))
        + eq('Incapacidad del mes', tok(diaInc, 'por día', 'out'), op('×'), tok(d.diasIncap, 'días', 'in', 'n'), op('='), tok(d.incap, 'incapacidad', 'out'))
        + checks([['ok', 'Días 1 y 2 de incapacidad: los paga el empleador. Desde el día 3: la EPS (la empresa paga y luego recobra).'], ['no', 'En días de vacaciones o incapacidad NO se paga auxilio de transporte.']]);
    },
    tryIt: 'Con salario mínimo pon 3 días de incapacidad: el 66,67 % queda debajo del mínimo diario, así que se paga el día completo. Con $3.000.000 sí se nota el 66,67 %.',
    quiz: { q: '¿Cuánto vale un día de vacaciones con el salario actual?', a: d => d.valorDia, exp: d => `${money(d.salario)} ÷ 30 = ${money(d.valorDia)}` },
    refs: ['cst186', 'cst227', 'dec780', 'incapMin'],
  },
  { // 8
    corto: 'Devengado', titulo: 'Total devengado: salarial vs. no salarial',
    lead: ['Devengado es la suma de todo lo que gana en el mes. Pero no todo pesa igual: los pagos SALARIALES cuentan para seguridad social y prestaciones; los NO salariales, en principio, no.',
      'Comisiones = salario. Una bonificación pactada expresamente como no salarial = no salario.'],
    controls: [{ k: 'comisiones', t: 'money', label: 'Comisiones o bonificación salarial', min: 0, max: 10000000, step: 10000 }, { k: 'noSalarial', t: 'money', label: 'Bonificación NO salarial', min: 0, max: 10000000, step: 10000 }],
    calc: d => {
      const tot = d.totalDev || 1, w = v => (v / tot * 100) + '%';
      return `<div class="bar3" role="img" aria-label="Composición del devengado">
          <span style="width:${w(d.baseSalarial)};background:var(--c-neto)">${d.baseSalarial / tot > 0.15 ? 'salarial' : ''}</span>
          <span style="width:${w(d.aux)};background:var(--c-apo)">${d.aux / tot > 0.08 ? 'auxilio' : ''}</span>
          <span style="width:${w(S.noSalarial)};background:var(--c-prov)">${S.noSalarial / tot > 0.1 ? 'no salarial' : ''}</span></div>`
        + eq('Suma', tok(d.salDias + d.vac + d.incap, 'salario + novedades'), op('+'), tok(d.hExtras + d.hRec, 'extras y recargos'), op('+'), tok(S.comisiones, 'comisiones'), op('+'), tok(d.aux, 'auxilio'), op('+'), tok(S.noSalarial, 'no salarial'), op('='), tok(d.totalDev, 'total devengado', 'out'));
    },
    tryIt: 'Pon una bonificación no salarial de <b>$2.000.000</b> con salario mínimo y pasa al siguiente paso: una parte terminará cotizando por la regla del 40 %.',
    quiz: { q: '¿Cuál es el total devengado de este mes?', a: d => d.totalDev, exp: d => `Suma de todos los pagos = ${money(d.totalDev)}` },
    refs: ['cst127', 'cst128'],
  },
  { // 9
    corto: 'IBC', titulo: 'IBC: la base sobre la que se cotiza',
    lead: ['El Ingreso Base de Cotización (IBC) es la base para salud, pensión y ARL. Solo incluye pagos salariales; el auxilio de transporte nunca entra.',
      'Tiene un piso de 1 SMMLV y un techo de 25 SMMLV. Y si los pagos no salariales pasan del 40 % de lo que gana, el exceso también cotiza.'],
    controls: [{ k: 'noSalarial', t: 'money', label: 'Bonificación NO salarial (para probar la regla del 40 %)', min: 0, max: 10000000, step: 10000 }],
    calc: d => `<div class="inout">
        <div><h4>✓ Entra al IBC</h4>${checks([['ok', `Salario y novedades: ${money(d.salDias + d.vac + d.incap)}`], ['ok', `Extras y recargos: ${money(d.hExtras + d.hRec)}`], ['ok', `Comisiones: ${money(S.comisiones)}`], [d.exceso40 ? 'ok' : 'no', `Exceso no salarial sobre el 40 %: ${money(d.exceso40)}`]])}</div>
        <div><h4>✗ No entra</h4>${checks([['no', `Auxilio de transporte: ${money(d.aux)}`], ['no', `No salarial hasta el 40 %: ${money(S.noSalarial - d.exceso40)}`]])}</div></div>`
      + (d.integral ? eq('Salario integral: cotiza el 70 %', tok(d.baseSalarial, 'pagos salariales'), op('×'), tok(0.7, 'Ley 789 art. 49', 'k', 'p'), op('='), tok(d.baseIBC, 'base', 'out')) : '')
      + eq('Regla del 40 % (Ley 1393)', tok(S.noSalarial, 'no salarial'), op('−'), tok(0.4, 'tope', 'k', 'p'), op('×'), tok(d.totalRem, 'remuneración total'), op('='), tok(d.exceso40, 'exceso que cotiza', 'out'))
      + eq('IBC final', tok(d.baseIBC, 'base salarial'), op('+'), tok(d.exceso40, 'exceso 40 %'), op('→'), tok(d.minIBC, 'piso 1 SMMLV', 'k'), op('/'), tok(d.maxIBC, 'techo 25 SMMLV', 'k'), op('='), tok(d.ibc, 'IBC', 'out'))
      + (d.baseIBC + d.exceso40 < d.minIBC ? checks([['bad', 'La base quedó por debajo de 1 SMMLV, así que se sube al mínimo. Pasa en medio tiempo: cotiza como si ganara el mínimo completo.']]) : ''),
    tryIt: 'Vuelve al paso 1, elige <b>medio tiempo</b> con medio mínimo y regresa: el IBC sube a ' + money(P.SMMLV) + '.',
    quiz: { q: '¿Cuál es el IBC de este mes?', a: d => d.ibc, exp: d => `Pagos salariales${d.exceso40 ? ' + exceso del 40 %' : ''}, con piso y techo = ${money(d.ibc)}` },
    refs: ['ley100_18', 'ley1393_30', 'ley789_49', 'dec2616'],
  },
  { // 10
    corto: 'Salud y pensión', titulo: 'Salud y pensión del trabajador: 4 % + 4 %',
    lead: ['Salud cuesta 12,5 % del IBC y pensión 16 %. La mayor parte la paga la empresa; al trabajador le descuentan 4 % de cada una.',
      'En la planilla PILA cada aporte se redondea al múltiplo de $100 hacia arriba.'],
    controls: [C.salario],
    calc: d => eq('Salud del trabajador', tok(d.ibc, 'IBC', 'out'), op('×'), tok(0.04, 'trabajador', 'k', 'p'), op('='), tok(d.ibc * 0.04, 'exacto'), op('↑100'), tok(d.salud, 'salud', 'out'))
      + eq('Pensión del trabajador', tok(d.ibc, 'IBC', 'out'), op('×'), tok(0.04, 'trabajador', 'k', 'p'), op('='), tok(d.ibc * 0.04, 'exacto'), op('↑100'), tok(d.pension, 'pensión', 'out'))
      + tabla([{ c: '<b>Concepto</b>', v: '<b>Trabajador · Empresa · Total</b>' }, { c: 'Salud', v: '4 % · 8,5 % · 12,5 %' }, { c: 'Pensión', v: '4 % · 12 % · 16 %' }]),
    tryIt: 'Con el mínimo, 4 % da ' + money(P.SMMLV * 0.04) + ' exactos, pero se descuentan ' + money(Math.ceil(P.SMMLV * 0.04 / 100) * 100) + ' por el redondeo de PILA.',
    quiz: { q: '¿Cuánto se descuenta de salud este mes?', a: d => d.salud, tol: 100, exp: d => `${money(d.ibc)} × 4 % = ${money(d.ibc * 0.04)} → redondeado ${money(d.salud)}` },
    refs: ['ley100_204', 'ley100_20', 'dec1990'],
  },
  { // 11
    corto: 'Solidaridad', titulo: 'Fondo de Solidaridad Pensional',
    lead: ['Quien cotiza sobre 4 SMMLV o más aporta un porcentaje adicional a pensión para subsidiar a quienes no pueden cotizar.'],
    controls: [C.salario],
    calc: d => {
      const k = d.ibcMensual / P.SMMLV;
      const filas = [[0, 4, 0], [4, 16, 0.01], [16, 17, 0.012], [17, 18, 0.014], [18, 19, 0.016], [19, 20, 0.018], [20, Infinity, 0.02]];
      return tabla([{ c: '<b>IBC en SMMLV</b>', v: '<b>Tarifa</b>' }, ...filas.map(([a, b, t]) => ({ cls: k >= a && k < b ? 'hl' : '', c: b === Infinity ? `más de ${a}` : `${a} a menos de ${b}`, v: t ? pctTxt(t) : 'no aplica' }))])
        + eq('Tu caso', tok(d.ibcMensual, 'IBC', 'out'), op('÷'), tok(P.SMMLV, 'SMMLV', 'k'), op('='), tok(n(k, 2) + ' SMMLV', '', 'out', 't'), op('→'), tok(d.ibc, 'IBC', 'out'), op('×'), tok(d.tFSP, 'tarifa', 'k', 'p'), op('='), tok(d.fsp, 'FSP', 'out'));
    },
    tryIt: 'Sube el salario a <b>$7.100.000</b> (más de 4 SMMLV) y mira aparecer el FSP en las deducciones.',
    quiz: { q: '¿Desde qué IBC se empieza a pagar el FSP? (4 SMMLV)', a: () => 4 * P.SMMLV, exp: () => `${money(P.SMMLV)} × 4 = ${money(4 * P.SMMLV)}` },
    refs: ['ley797_8'],
  },
  { // 12
    corto: 'Retención', titulo: 'Retención en la fuente (procedimiento 1)',
    lead: ['Es un anticipo del impuesto de renta que la empresa descuenta y paga a la DIAN. Solo aplica cuando, después de "depurar" el ingreso, la base supera 95 UVT.',
      'Depurar = restar aportes obligatorios, deducciones (dependientes, prepagada, vivienda) y la renta exenta del 25 %, con un límite del 40 %.'],
    controls: [C.salario, { k: 'calcRete', t: 'toggle', label: 'Calcular retención' }, { k: 'dependientes', t: 'toggle', label: 'Tiene dependientes económicos' },
      { k: 'prepagada', t: 'money', label: 'Medicina prepagada al mes', min: 0, max: 2000000, step: 10000 }, { k: 'vivienda', t: 'money', label: 'Intereses de vivienda al mes', min: 0, max: 6000000, step: 10000 }],
    calc: d => {
      const x = d.reteD;
      if (!x) return checks([['no', 'Retención desactivada.']]);
      const U = P.UVT;
      return tabla([
        { c: 'Ingresos laborales del mes', v: money(x.ingresos) },
        { c: '(−) Aportes obligatorios: salud + pensión + FSP', v: '−' + money(x.incr) },
        { c: '<b>= Subtotal</b>', v: money(x.neto1) },
        { c: '(−) Deducciones', f: `dependientes ${money(x.dDep)} · prepagada ${money(x.dPre)} · vivienda ${money(x.dViv)}`, v: '−' + money(x.deducciones) },
        { c: '(−) Renta exenta 25 %', f: `máx. 790 UVT/año = ${money(790 / 12 * U)}/mes`, v: '−' + money(x.exenta) },
        ...(x.deducciones + x.exenta > x.limite ? [{ c: 'Tope 40 % / 1.340 UVT: beneficios recortados a', v: money(x.limite) }] : []),
        { c: '<b>= Base gravable</b>', v: money(x.base) },
      ])
        + eq('Pasar a UVT', tok(x.base, 'base gravable', 'out'), op('÷'), tok(U, 'UVT 2026', 'k'), op('='), tok(n(x.baseU) + ' UVT', 'base en UVT', 'out', 't'))
        + tabla([{ c: '<b>Rango en UVT</b>', v: '<b>Fórmula</b>' }, ...TABLA383.map(t => ({ cls: t === x.tramo ? 'hl' : '', c: t.hasta === Infinity ? `más de ${t.desde}` : `${t.desde} a ${t.hasta}`, v: t.tasa ? `(base − ${t.desde}) × ${pctTxt(t.tasa)} + ${t.mas} UVT` : '0' }))])
        + eq('Retención', tok(n(x.impU) + ' UVT', 'impuesto', 'out', 't'), op('×'), tok(U, 'UVT', 'k'), op('≈'), tok(d.rete, 'redondeado a miles', 'out'));
    },
    tryIt: 'Elige "Profesional con retención" en el paso 0 y aquí quita los dependientes: la retención sube.',
    quiz: { q: '¿Cuánto es 95 UVT en pesos? (hasta ahí la tarifa es 0 %)', a: () => 95 * P.UVT, exp: () => `95 × ${money(P.UVT)} = ${money(95 * P.UVT)}` },
    refs: ['et383', 'et206', 'et336', 'et387', 'res238'],
  },
  { // 13
    corto: 'Neto', titulo: 'Neto a pagar: lo que llega a la cuenta',
    lead: ['Neto = total devengado − total deducciones. Cualquier otro descuento (préstamos, libranzas) necesita autorización escrita del trabajador u orden judicial.'],
    controls: [{ k: 'otrasDed', t: 'money', label: 'Otros descuentos (préstamo, libranza)', min: 0, max: 3000000, step: 10000 }],
    calc: d => eq('Deducciones', tok(d.salud, 'salud'), op('+'), tok(d.pension, 'pensión'), op('+'), tok(d.fsp, 'FSP'), op('+'), tok(d.rete, 'retención'), op('+'), tok(S.otrasDed, 'otros'), op('='), tok(d.totalDed, 'total deducciones', 'out'))
      + eq('Neto', tok(d.totalDev, 'devengado', 'out'), op('−'), tok(d.totalDed, 'deducciones', 'out'), op('='), tok(d.neto, 'NETO A PAGAR', 'out')),
    tryIt: 'Compara el neto con el salario pactado: con el mínimo el neto (' + money(P.SMMLV + P.AUX - 140200) + ') es mayor que el salario gracias al auxilio de transporte.',
    quiz: { q: '¿Cuál es el neto a pagar?', a: d => d.neto, exp: d => `${money(d.totalDev)} − ${money(d.totalDed)} = ${money(d.neto)}` },
    refs: ['cst149'],
  },
  { // 14
    corto: 'Empresa', titulo: 'Lo que paga la empresa: aportes y parafiscales',
    lead: ['Además del salario, la empresa paga su parte de salud y pensión, la ARL completa y los parafiscales (Caja, ICBF, SENA).',
      'Si el trabajador gana menos de 10 SMMLV, la mayoría de empresas están exoneradas de salud 8,5 %, ICBF y SENA.'],
    controls: [{ k: 'arl', t: 'select', label: 'Clase de riesgo ARL', opts: [[0.00522, 'I · 0,522 % (oficina)'], [0.01044, 'II · 1,044 %'], [0.02436, 'III · 2,436 %'], [0.0435, 'IV · 4,350 %'], [0.0696, 'V · 6,960 % (alturas, minería)']] },
      { k: 'exonerado', t: 'toggle', label: 'Empresa exonerada (art. 114-1 E.T.)' }],
    calc: d => eq('Salud empresa', tok(d.ibc, 'IBC', 'out'), op('×'), tok(d.exon ? 0 : 0.085, d.exon ? 'exonerada' : '8,5 %', 'k', 'p'), op('='), tok(d.saludP, 'salud', 'out'))
      + eq('Pensión empresa', tok(d.ibc, 'IBC', 'out'), op('×'), tok(0.12, '12 %', 'k', 'p'), op('='), tok(d.pensionP, 'pensión', 'out'))
      + eq('ARL', tok(d.ibcARL, 'IBC días laborados', 'out'), op('×'), tok(+S.arl, 'tarifa', 'in', 'p'), op('='), tok(d.arl, 'ARL', 'out'))
      + eq('Parafiscales', tok(d.basePara, 'base salarial', 'out'), op('×'), tok('4 % + ' + (d.exon ? '0 % + 0 %' : '3 % + 2 %'), 'Caja + ICBF + SENA', 'k', 't'), op('='), tok(d.parafiscales, 'parafiscales', 'out'))
      + eq('Total aportes empresa', tok(d.aportes + d.parafiscales, 'seguridad social + parafiscales', 'out')),
    tryIt: 'Desmarca "Empresa exonerada" y mira cuánto más cuesta el trabajador. Luego cambia el riesgo ARL a clase V.',
    quiz: { q: '¿Cuánto paga la empresa de pensión este mes?', a: d => d.pensionP, tol: 100, exp: d => `${money(d.ibc)} × 12 % = ${money(d.ibc * 0.12)} → ${money(d.pensionP)}` },
    refs: ['ley100_204', 'ley100_20', 'et1141', 'arl', 'ley21_12'],
  },
  { // 15
    corto: 'Prestaciones', titulo: 'Prestaciones sociales: el ahorro mensual de la empresa',
    lead: ['Prima, cesantías, intereses y vacaciones no se pagan cada mes, pero la empresa debe reservar ("provisionar") su valor mes a mes.',
      'Prima y cesantías: un salario por año cada una (8,33 % mensual), con auxilio incluido. Intereses: 12 % anual sobre cesantías. Vacaciones: 15 días por año (4,17 %), sin auxilio ni extras.'],
    controls: [C.salario],
    calc: d => d.integral ? checks([['no', 'Salario integral: no hay prima, cesantías ni intereses.']]) + eq('Vacaciones', tok(d.baseVac, 'base'), op('×'), tok(15 / 360, '15 ÷ 360', 'k', 'p'), op('='), tok(d.provVac, 'vacaciones', 'out'))
      : eq('Cesantías', tok(d.basePrest, 'salario + extras + auxilio'), op('×'), tok(1 / 12, '1 mes por año', 'k', 'p'), op('='), tok(d.ces, 'cesantías', 'out'))
      + eq('Intereses sobre cesantías', tok(d.ces, 'cesantías', 'out'), op('×'), tok(0.12, 'anual', 'k', 'p'), op('='), tok(d.intC, 'intereses', 'out'))
      + eq('Prima de servicios', tok(d.basePrest, 'salario + extras + auxilio'), op('×'), tok(1 / 12, '30 días por año', 'k', 'p'), op('='), tok(d.prima, 'prima', 'out'))
      + eq('Vacaciones', tok(d.baseVac, 'salario sin auxilio ni extras'), op('×'), tok(15 / 360, '15 días por año', 'k', 'p'), op('='), tok(d.provVac, 'vacaciones', 'out'))
      + checks([['ok', 'Prima: mitad antes del 30 de junio y mitad antes del 20 de diciembre.'], ['ok', 'Cesantías: al fondo antes del 14 de febrero. Intereses: al trabajador en enero.'], ['ok', 'Para liquidar por fechas reales usa la pestaña "Prestaciones y liquidación".']]),
    tryIt: 'Agrega horas extra en el paso 5: suben prima y cesantías, pero NO las vacaciones.',
    quiz: { q: '¿Cuánto debe provisionar la empresa este mes para la prima?', a: d => d.prima, exp: d => `${money(d.basePrest)} × 8,33 % = ${money(d.prima)}` },
    refs: ['cst249', 'ley52', 'cst306', 'cst186'],
  },
  { // 16
    corto: 'Resumen', titulo: 'Resumen: el costo real de un trabajador',
    lead: ['Ya construiste la nómina completa. Esta es la foto: lo que recibe el trabajador y lo que realmente le cuesta a la empresa.'],
    controls: [],
    calc: d => {
      const parts = [['Neto al trabajador', d.neto, 'var(--c-neto)'], ['Descuentos del trabajador', d.totalDed, 'var(--c-ded)'], ['Aportes y parafiscales', d.aportes + d.parafiscales, 'var(--c-apo)'], ['Prestaciones', d.provision, 'var(--c-prov)']];
      const tot = parts.reduce((a, p) => a + p[1], 0) || 1;
      return `<div class="kpis">${kpi('Salario pactado', d.salario)}${kpi('Neto a pagar', d.neto, true)}${kpi('Costo empresa', d.costo)}<div class="kpi"><div class="t">Factor de costo</div><div class="v">×${n(d.costo / Math.max(d.salario, 1), 2)}</div></div></div>
        <div class="stack">${parts.map(p => `<span style="width:${p[1] / tot * 100}%;background:${p[2]}"></span>`).join('')}</div>
        <div class="legend">${parts.map(p => `<span><i style="background:${p[2]}"></i>${p[0]} · <b>${money(p[1])}</b></span>`).join('')}</div>
        <p style="margin:16px 0 6px"><b>Repasa cualquier paso:</b></p>
        <div class="presets">${STEPS.slice(1, -1).map((s, k) => `<button type="button" class="btn" data-go="${k + 1}">${k + 1}. ${esc(s.corto)}</button>`).join('')}</div>
        <p style="margin:16px 0 0" class="muted">Todas las fuentes usadas están abajo. Las marcadas como <span class="tb t-doctrina">Doctrina / Práctica</span> no son normas: son criterios de aplicación que conviene validar con un contador.</p>`;
    },
    refs: Object.keys(REFS),
    fuentesExtra: true,
  },
];

// ---------- 5. Desprendible ----------
const SLIP = [
  { g: 'Devengados' },
  { l: d => `Salario (${d.diasLab} días)`, s: 2, v: d => d.salDias },
  { l: () => 'Auxilio de transporte', s: 4, v: d => d.aux, show: d => d.tieneAux },
  { l: () => 'Horas extras', s: 5, v: d => d.hExtras, show: d => d.hExtras > 0 },
  { l: () => 'Recargos', s: 6, v: d => d.hRec, show: d => d.hRec > 0 },
  { l: d => `Vacaciones (${d.diasVac} d)`, s: 7, v: d => d.vac, show: d => d.vac > 0 },
  { l: d => `Incapacidad (${d.diasIncap} d)`, s: 7, v: d => d.incap, show: d => d.incap > 0 },
  { l: () => 'Comisiones', s: 8, v: () => S.comisiones, show: () => S.comisiones > 0 },
  { l: () => 'Bonificación no salarial', s: 8, v: () => S.noSalarial, show: () => S.noSalarial > 0 },
  { l: () => 'Total devengado', s: 8, v: d => d.totalDev, cls: 'tot' },
  { g: 'Deducciones' },
  { l: () => 'Salud 4 %', s: 10, v: d => d.salud },
  { l: () => 'Pensión 4 %', s: 10, v: d => d.pension },
  { l: d => `Fondo Solidaridad ${pctTxt(d.tFSP)}`, s: 11, v: d => d.fsp, show: d => d.fsp > 0 },
  { l: () => 'Retención en la fuente', s: 12, v: d => d.rete, show: () => S.calcRete },
  { l: () => 'Otros descuentos', s: 13, v: () => S.otrasDed, show: () => S.otrasDed > 0 },
  { l: () => 'Total deducciones', s: 13, v: d => d.totalDed, cls: 'tot' },
  { l: () => 'NETO A PAGAR', s: 13, v: d => d.neto, cls: 'tot big' },
  { g: 'Lo que paga la empresa' },
  { l: d => d.exon ? 'Salud 8,5 % (exonerada)' : 'Salud 8,5 %', s: 14, v: d => d.saludP },
  { l: () => 'Pensión 12 %', s: 14, v: d => d.pensionP },
  { l: () => 'ARL', s: 14, v: d => d.arl },
  { l: () => 'Caja 4 %', s: 14, v: d => d.caja },
  { l: () => 'ICBF + SENA', s: 14, v: d => d.icbf + d.sena },
  { l: () => 'Prestaciones (provisión)', s: 15, v: d => d.provision },
  { l: () => 'COSTO TOTAL EMPRESA', s: 15, v: d => d.costo, cls: 'tot big' },
];
function renderSlip(d) {
  const tipo = S.tipoSalario === 'integral' ? 'Salario integral' : ({ completo: 'Tiempo completo', medio: 'Medio tiempo', otra: `${S.horasSemana} h/semana` }[S.jornadaTipo]);
  let h = `<h2><span>Desprendible de nómina</span><span class="hint">${esc(MESES[S.mes - 1])} ${P.anio}</span></h2><p class="who">${esc(tipo)} · salario ${money(S.salario)}</p>`;
  for (const ln of SLIP) {
    if (ln.g) { h += `<h4>${esc(ln.g)}</h4>`; continue; }
    if (ln.show && !ln.show(d)) continue;
    const st = ln.s > cur ? 'pend' : ln.s === cur ? 'now' : '';
    h += `<div class="ln ${ln.cls || ''} ${st}"><span>${esc(ln.l(d))}</span><span>${ln.s > cur ? '· · ·' : money(ln.v(d))}</span></div>`;
  }
  $('#sbSlip').innerHTML = h;
}

// ---------- 6. Render de un paso ----------
function ctrlHTML(c, idx) {
  const id = 'sbc' + idx, v = getK(c.k);
  const hid = c.when && !c.when() ? ' hidden' : '';
  if (c.t === 'select') return `<div class="ctrl" data-c="${idx}"${hid}><label for="${id}">${esc(c.label)}</label><select id="${id}" data-k="${c.k}">${c.opts.map(([ov, ot]) => `<option value="${ov}" ${String(ov) === String(v) ? 'selected' : ''}>${esc(ot)}</option>`).join('')}</select></div>`;
  if (c.t === 'toggle') return `<div class="ctrl" data-c="${idx}"${hid}><label class="check"><input type="checkbox" id="${id}" data-k="${c.k}" ${v ? 'checked' : ''}><span>${esc(c.label)}</span></label></div>`;
  const min = c.min ?? 0, max = c.max ?? 100, step = c.step ?? (c.t === 'hours' ? 0.5 : 1);
  return `<div class="ctrl" data-c="${idx}"${hid}><label for="${id}">${esc(c.label)}</label><div class="ctrl-in">
    <input type="range" aria-label="${esc(c.label)}" min="${min}" max="${max}" step="${step}" value="${Math.min(v, max)}" data-k="${c.k}" data-r="1">
    <input type="number" id="${id}" min="${min}" step="${c.t === 'money' ? 1000 : step}" value="${v}" data-k="${c.k}"></div></div>`;
}
function refHTML(id) {
  const r = REFS[id]; if (!r) return '';
  const t = 't-' + r.tipo.toLowerCase();
  return `<div class="refcard ${t}"><div class="rh"><span class="tb ${t}">${esc(r.tipo)}</span><span class="rn">${esc(r.norma)}</span><span class="muted" style="font-size:13px">· ${esc(r.art)}</span></div>
    <p>${esc(r.dice)}</p>${r.url ? `<a href="${r.url}" target="_blank" rel="noopener">Ver texto oficial ↗</a>` : `<span class="hint">${r.tipo === 'Doctrina' || r.tipo === 'Práctica' ? 'No es una norma: es criterio de aplicación.' : 'Sin enlace oficial verificado; búscala en el Diario Oficial.'}</span>`}</div>`;
}

function renderStep() {
  const st = STEPS[cur];
  const d = calcular();
  $('#sbMain').innerHTML = `
    <div class="sb-count">Paso ${cur} de ${STEPS.length - 1}</div>
    <h2>${esc(st.titulo)}</h2>
    ${st.lead.map(p => `<p class="sb-lead">${esc(p)}</p>`).join('')}
    ${st.controls.length ? `<section class="sb-sec ctrls"><h3>Juega con los datos</h3>${st.controls.map(ctrlHTML).join('')}</section>` : ''}
    <section class="sb-sec"><h3>Así se calcula</h3><div id="sbCalc"></div><div id="sbWarn"></div></section>
    ${st.tryIt ? `<section class="sb-sec"><h3>¿Y si…?</h3><div class="try">${st.tryIt}</div></section>` : ''}
    ${st.quiz ? `<section class="sb-sec"><h3>Ponte a prueba</h3><p style="margin:0 0 8px">${esc(st.quiz.q)}</p>
      <div class="quizbox"><input type="text" inputmode="decimal" id="sbAns" placeholder="Escribe tu respuesta en pesos" aria-label="Tu respuesta"><button type="button" class="btn primary" id="sbCheck">Comprobar</button><button type="button" class="btn" id="sbShow">Ver solución</button></div>
      <div class="quizfb" id="sbFb" aria-live="polite"></div></section>` : ''}
    ${st.refs.length ? `<section class="sb-sec"><h3>${st.fuentesExtra ? 'Todas las referencias oficiales' : 'Referencia oficial · ¿de dónde sale esto?'}</h3><div class="refs">${st.refs.map(refHTML).join('')}</div></section>` : ''}
    ${st.fuentesExtra ? `<section class="sb-sec"><h3>Fuentes de prensa con las que contrasté los valores 2026</h3><ul class="muted" style="margin:0;padding-left:18px">${PRENSA.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul></section>` : ''}`;
  renderDyn(d);
  // barra y pastillas
  $('#sbProg').style.width = (cur / (STEPS.length - 1) * 100) + '%';
  $('#sbPills').innerHTML = STEPS.map((s, k) => `<button type="button" role="listitem" class="sb-pill ${k === cur ? 'cur' : k < cur ? 'done' : ''}" data-go="${k}" ${k === cur ? 'aria-current="step"' : ''}>${k}. ${esc(s.corto)}</button>`).join('');
  const pill = $('#sbPills .cur'); if (pill) pill.scrollIntoView({ block: 'nearest', inline: 'center' });
  $('#sbPrev').disabled = cur === 0;
  $('#sbNext').textContent = cur === STEPS.length - 1 ? 'Volver al inicio ↺' : 'Siguiente →';
  guardar();
}

function renderDyn(d = calcular()) {
  const st = STEPS[cur];
  $('#sbCalc').innerHTML = st.calc(d, S);
  $('#sbWarn').innerHTML = renderAlerts(R.warn.filter(w => w[0] !== 'info'));
  // visibilidad de controles dependientes
  st.controls.forEach((c, i) => { const el = $(`#sbMain .ctrl[data-c="${i}"]`); if (el) el.hidden = !!(c.when && !c.when()); });
  renderSlip(d);
  const fb = $('#sbFb'); if (fb && fb.dataset.state) { fb.textContent = ''; fb.className = 'quizfb'; delete fb.dataset.state; }
}

function parseAns(s) {
  // acepta "1.750.905", "1750905", "$ 58.363,5", "58363.5"
  let t = String(s).replace(/[^\d.,-]/g, '');
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if ((t.match(/\./g) || []).length > 1 || /\.\d{3}$/.test(t)) t = t.replace(/\./g, '');
  return parseFloat(t);
}

// ---------- 7. Eventos ----------
function ir(k) { cur = Math.max(0, Math.min(STEPS.length - 1, k)); renderStep(); $('#sbMain').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }

function onCtrl(e) {
  const el = e.target; const k = el.dataset && el.dataset.k; if (!k) return;
  let v;
  if (el.type === 'checkbox') v = el.checked;
  else if (el.tagName === 'SELECT') v = isNaN(+el.value) ? el.value : +el.value;
  else { v = parseFloat(el.value); if (!isFinite(v) || v < 0) v = 0; }
  setK(k, v);
  if (k === 'mes') { S.jornadaMax = reglasMes(v).jornadaMax; const jm = $('#sbMain select[data-k="jornadaMax"]'); if (jm) jm.value = S.jornadaMax; }
  if (k === 'jornadaTipo' && v === 'medio' && S.salario >= P.SMMLV && S.tipoSalario === 'ordinario') { /* deja que el usuario vea la diferencia */ }
  // sincroniza el gemelo (range <-> number)
  $('#sbMain').querySelectorAll(`[data-k="${k}"]`).forEach(o => { if (o !== el && o.type !== 'checkbox' && o.tagName !== 'SELECT') o.value = v; });
  renderDyn();
  guardar();
}

function initSandbox() {
  $('#sbMain').addEventListener('input', onCtrl);
  $('#sbMain').addEventListener('change', e => { if (e.target.tagName === 'SELECT' || e.target.type === 'checkbox') return; onCtrl(e); });
  $('#sbMain').addEventListener('click', e => {
    const p = e.target.closest('[data-sbp]');
    if (p) { const mes = S.mes; S = estadoBase({ mes, ...JSON.parse(JSON.stringify(SB_PRESETS[p.dataset.sbp])) }); S.jornadaMax = reglasMes(S.mes).jornadaMax; renderStep(); return; }
    const g = e.target.closest('[data-go]'); if (g) { ir(+g.dataset.go); return; }
    if (e.target.id === 'sbCheck' || e.target.id === 'sbShow') {
      const q = STEPS[cur].quiz, d = R.d, ans = q.a(d), fb = $('#sbFb');
      fb.dataset.state = '1';
      if (e.target.id === 'sbShow') { fb.className = 'quizfb'; fb.textContent = 'Solución: ' + q.exp(d); return; }
      const x = parseAns($('#sbAns').value);
      if (!isFinite(x)) { fb.className = 'quizfb bad'; fb.textContent = 'Escribe un número, por ejemplo 1.750.905'; return; }
      const tol = Math.max(q.tol || 2, Math.abs(ans) * 0.002);
      const ok = Math.abs(x - ans) <= tol;
      fb.className = 'quizfb ' + (ok ? 'ok' : 'bad');
      fb.textContent = ok ? `¡Correcto! ${q.exp(d)}` : `Todavía no. Tu respuesta: ${money(x)}. Pista: revisa la fórmula de "Así se calcula" y vuelve a intentarlo.`;
    }
  });
  $('#sbMain').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'sbAns') $('#sbCheck').click(); });
  $('#sbPills').addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) ir(+g.dataset.go); });
  $('#sbPrev').addEventListener('click', () => ir(cur - 1));
  $('#sbNext').addEventListener('click', () => ir(cur === STEPS.length - 1 ? 0 : cur + 1));
  document.addEventListener('keydown', e => {
    if (!$('#tab-sandbox').classList.contains('active')) return;
    if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') ir(cur + 1); else if (e.key === 'ArrowLeft') ir(cur - 1);
  });
  renderStep();

  // La pestaña "Aprende" también muestra todas las referencias oficiales
  const learn = $('#learn');
  if (learn) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h2>Referencias oficiales (de dónde sale cada regla)</h2><div class="refs">${Object.keys(REFS).map(refHTML).join('')}</div>
      <h3>Prensa usada para contrastar los valores 2026</h3><ul class="muted" style="margin:0;padding-left:18px">${PRENSA.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul>`;
    learn.appendChild(card);
  }
}

initSandbox();
