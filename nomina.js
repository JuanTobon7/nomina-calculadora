'use strict';
/* =========================================================================
   Calculadora didáctica de nómina · Colombia 2026
   Todo el cálculo vive en funciones puras (calcNomina, calcPrestaciones,
   calcVacaciones) que devuelven "pasos" con fórmula + valor, y luego se
   pintan en pantalla. Lee el código: también está pensado para aprender.
   ========================================================================= */

// ---------- 1. Parámetros legales 2026 ----------
const P = {
  anio: 2026,
  SMMLV: 1750905,   // Decreto 1469 de 2025 (fijado transitoriamente por Decreto 0159 de 2026)
  AUX: 249095,      // Auxilio de transporte · Decreto 1470 de 2025
  UVT: 52374,       // Resolución DIAN 000238 de 2025
  saludEmp: 0.04, pensionEmp: 0.04,        // lo que paga el trabajador
  saludPatrono: 0.085, pensionPatrono: 0.12,
  caja: 0.04, icbf: 0.03, sena: 0.02,
  cesantias: 1 / 12, intCes: 0.12, prima: 1 / 12, vacaciones: 15 / 360,
  recargoNocturno: 0.35, extraDiurna: 0.25, extraNocturna: 0.75,
};

// Festivos Colombia 2026 (+ inicio de 2027 por si las vacaciones cruzan el año)
const FESTIVOS = {
  '2026-01-01': 'Año Nuevo', '2026-01-12': 'Reyes Magos', '2026-03-23': 'San José',
  '2026-04-02': 'Jueves Santo', '2026-04-03': 'Viernes Santo', '2026-05-01': 'Día del Trabajo',
  '2026-05-18': 'Ascensión', '2026-06-08': 'Corpus Christi', '2026-06-15': 'Sagrado Corazón',
  '2026-06-29': 'San Pedro y San Pablo', '2026-07-20': 'Independencia', '2026-08-07': 'Batalla de Boyacá',
  '2026-08-17': 'Asunción de la Virgen', '2026-10-12': 'Día de la Raza', '2026-11-02': 'Todos los Santos',
  '2026-11-16': 'Independencia de Cartagena', '2026-12-08': 'Inmaculada Concepción', '2026-12-25': 'Navidad',
  '2027-01-01': 'Año Nuevo', '2027-01-11': 'Reyes Magos', '2027-03-22': 'San José',
  '2027-03-25': 'Jueves Santo', '2027-03-26': 'Viernes Santo',
};

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Reglas que cambian durante 2026
function reglasMes(m) {
  return {
    recargoDom: m >= 7 ? 0.90 : 0.80,       // Ley 2466/2025: 80 % desde jul-2025, 90 % desde 1-jul-2026
    jornadaMax: m >= 8 ? 42 : 44,           // Ley 2101/2021: 42 h desde el 15-jul-2026
  };
}

function factoresHoras(R) {
  return [
    { id: 'hed', nombre: 'Hora extra diurna', f: 1 + P.extraDiurna, como: '100 % + 25 %' },
    { id: 'hen', nombre: 'Hora extra nocturna', f: 1 + P.extraNocturna, como: '100 % + 75 %' },
    { id: 'heddf', nombre: 'Extra diurna dominical/festiva', f: 1 + P.extraDiurna + R, como: `100 % + 25 % + ${pctTxt(R)}` },
    { id: 'hendf', nombre: 'Extra nocturna dominical/festiva', f: 1 + P.extraNocturna + R, como: `100 % + 75 % + ${pctTxt(R)}` },
    { id: 'rn', nombre: 'Recargo nocturno (hora ordinaria)', f: P.recargoNocturno, como: 'solo el 35 % (la hora ya va en el salario)', recargo: true },
    { id: 'rdf', nombre: 'Recargo dominical/festivo (hora ordinaria)', f: R, como: `solo el ${pctTxt(R)} (la hora ya va en el salario)`, recargo: true },
    { id: 'rndf', nombre: 'Recargo nocturno dominical/festivo', f: P.recargoNocturno + R, como: `35 % + ${pctTxt(R)}`, recargo: true },
  ];
}

const ARL_CLASE = { '0.00522': 'I', '0.01044': 'II', '0.02436': 'III', '0.0435': 'IV', '0.0696': 'V' };

// Tabla del artículo 383 del Estatuto Tributario (en UVT)
const TABLA383 = [
  { desde: 0, hasta: 95, tasa: 0, mas: 0 },
  { desde: 95, hasta: 150, tasa: 0.19, mas: 0 },
  { desde: 150, hasta: 360, tasa: 0.28, mas: 10 },
  { desde: 360, hasta: 640, tasa: 0.33, mas: 69 },
  { desde: 640, hasta: 945, tasa: 0.35, mas: 162 },
  { desde: 945, hasta: 2300, tasa: 0.37, mas: 268 },
  { desde: 2300, hasta: Infinity, tasa: 0.39, mas: 770 },
];

// ---------- 2. Utilidades ----------
const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const $ = (s, r = document) => r.querySelector(s);
const money = v => fmt.format(Math.round(v || 0));
function pctTxt(v) { return (v * 100).toLocaleString('es-CO', { maximumFractionDigits: 3 }) + ' %'; }
const n = (v, d = 2) => Number(v).toLocaleString('es-CO', { maximumFractionDigits: d });
const ceil100 = v => Math.ceil(Math.round(v) / 100) * 100;   // PILA redondea aportes al múltiplo de 100 superior
const round1000 = v => Math.round(v / 1000) * 1000;          // DIAN: retención al múltiplo de 1.000 más cercano
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const numVal = id => { const v = parseFloat($('#' + id).value); return isFinite(v) && v > 0 ? v : 0; };
const chk = id => $('#' + id).checked;
function parseDate(s) { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function iso(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
const DIAS_SEM = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
function fechaLarga(d) { return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }

// Días entre dos fechas con el año comercial de 360 días (inclusive), como se liquida en Colombia
function dias360(a, b) {
  const finFeb = d => d.getMonth() === 1 && new Date(d.getFullYear(), 2, 0).getDate() === d.getDate();
  let d1 = a.getDate(), d2 = b.getDate();
  if (d1 === 31) d1 = 30;
  if (d2 === 31 || finFeb(b)) d2 = 30;
  return (b.getFullYear() - a.getFullYear()) * 360 + (b.getMonth() - a.getMonth()) * 30 + (d2 - d1) + 1;
}

function tasaFSP(ibcMensual) {
  const k = ibcMensual / P.SMMLV;
  if (k < 4) return 0; if (k < 16) return 0.01; if (k < 17) return 0.012;
  if (k < 18) return 0.014; if (k < 19) return 0.016; if (k < 20) return 0.018; return 0.02;
}

// ---------- 3. Motor de cálculo: nómina mensual ----------
function calcNomina(i) {
  const warn = [];
  const R = i.recargoDom;
  const porDias = i.jornadaTipo === 'dias';          // trabajo por días (ej. servicio doméstico por días)
  const hogar = i.empleador === 'hogar';             // empleador persona natural: servicio doméstico
  const integral = i.tipoSalario === 'integral' && !porDias;
  const horasSemana = (i.jornadaTipo === 'completo' || porDias) ? i.jornadaMax : i.jornadaTipo === 'medio' ? i.jornadaMax / 2 : Math.min(i.horasSemana || 1, i.jornadaMax);
  const fraccion = horasSemana / i.jornadaMax;
  const horasMes = horasSemana / 6 * 30;
  const salario = porDias ? (i.jornal || 0) * 30 : i.salario;   // por días: equivalente mensual del jornal
  const diasPeriodo = porDias ? 30 : Math.min(Math.max(Math.round(i.diasPeriodo) || 30, 1), 30);
  const diasVac = porDias ? 0 : Math.min(Math.round(i.diasVac), diasPeriodo);
  const diasIncap = porDias ? 0 : Math.min(Math.round(i.diasIncap), diasPeriodo - diasVac);
  const diasLab = porDias ? Math.min(Math.max(Math.round(i.diasTrab) || 0, 0), 30) : diasPeriodo - diasVac - diasIncap;
  const valorDia = salario / 30;
  const valorHora = horasMes ? salario / horasMes : 0;
  const minimoProp = P.SMMLV * fraccion;
  const especie = (porDias || integral) ? 0 : Math.min(i.especie || 0, salario);

  // ---- Validaciones didácticas ----
  if (porDias) {
    if (i.tipoSalario === 'integral') warn.push(['info', 'El salario integral no aplica al trabajo por días; se calculó como salario ordinario.']);
    if ((i.jornal || 0) + 0.5 < P.SMMLV / 30) warn.push(['danger', `El jornal (valor del día) mínimo 2026 es ${money(P.SMMLV / 30)}: SMMLV ÷ 30.`]);
    if (diasLab > 26) warn.push(['info', 'Con más de 26 días al mes ya es tiempo completo: usa la jornada "Tiempo completo".']);
  } else if (integral) {
    if (salario < 13 * P.SMMLV) warn.push(['danger', `El salario integral debe ser mínimo 13 SMMLV (${money(13 * P.SMMLV)}): 10 SMMLV de salario + 30 % de factor prestacional.`]);
    if (i.jornadaTipo !== 'completo') warn.push(['warn', 'El salario integral normalmente se pacta para jornada completa.']);
  } else if (salario + 1 < minimoProp) {
    warn.push(['danger', `Este salario está por debajo del mínimo ${fraccion < 1 ? 'proporcional ' : ''}legal: ${money(minimoProp)} para ${n(horasSemana)} h/semana.`]);
  }
  if (diasVac + diasIncap > diasPeriodo) warn.push(['warn', 'Vacaciones + incapacidad no pueden superar los días del periodo; se ajustaron.']);
  if (especie) {
    const lim = salario <= P.SMMLV + 1 ? 0.3 : 0.5;
    if (especie > lim * salario + 1) warn.push(['danger', `El salario en especie no puede pasar del ${lim * 100} % del salario (art. 129 CST): máximo ${money(lim * salario)}.`]);
  }
  if (!integral && salario <= 2 * P.SMMLV) warn.push(['info', 'Dotación: como gana hasta 2 SMMLV, si lleva más de 3 meses tiene derecho a un par de zapatos y un vestido de labor cada 4 meses, gratis (art. 230 CST). Se entrega en especie, no en dinero.']);
  if (hogar && !porDias) warn.push(['info', 'Servicio doméstico: el contrato debe ser escrito y registrarse en PILA (Ley 2466 de 2025, art. 33). Tiene derecho a prima, cesantías, intereses, vacaciones y dotación como cualquier trabajador.']);

  const steps = [];

  // ---- PASO 1: valores base ----
  steps.push({
    titulo: 'Valor del día y de la hora',
    porque: porDias
      ? 'En el trabajo por días se pacta un valor por día (jornal). No puede ser menor al salario mínimo diario (SMMLV ÷ 30). Para comparar, su equivalente mensual es jornal × 30.'
      : 'Todo parte del salario. En Colombia el mes se liquida como de 30 días, y la hora se obtiene dividiendo por las horas que el trabajador debe laborar en el mes: (horas semanales ÷ 6 días) × 30.',
    filas: [
      ...(porDias
        ? [{ c: 'Valor del día pactado (jornal)', v: valorDia, tip: `Mínimo legal: ${money(P.SMMLV / 30)} por día.` }, { c: 'Equivalente mensual', f: `${money(valorDia)} × 30`, v: salario }]
        : [{ c: 'Salario mensual pactado', v: salario }, { c: 'Valor día', f: `${money(salario)} ÷ 30`, v: valorDia }]),
      { c: 'Horas al mes', f: `(${n(horasSemana)} h ÷ 6) × 30 = ${n(horasMes)} h`, vtxt: `${n(horasMes)} h`,
        tip: (i.jornadaTipo === 'completo' || porDias) ? `Con jornada de ${i.jornadaMax} h la empresa divide por ${n(horasMes)}. Algunos usan semanas (${i.jornadaMax} × 52 ÷ 12 = ${n(i.jornadaMax * 52 / 12, 1)} h); aquí usamos el método de 30 días.` : `Medio tiempo / parcial: ${n(horasSemana)} de ${i.jornadaMax} horas = ${pctTxt(fraccion)} de la jornada.` },
      { c: 'Valor hora ordinaria', f: `${money(salario)} ÷ ${n(horasMes)} h`, v: valorHora },
    ],
  });

  // ---- PASO 2: devengados ----
  const dev = [];
  const salDias = valorDia * diasLab;
  dev.push({ c: `Salario por ${diasLab} días ${porDias ? 'trabajados' : 'laborados'}`, f: `${money(valorDia)} × ${diasLab}`, v: salDias,
    tip: especie ? `Incluye ${money(especie)} de salario en especie (alimentación/vivienda) que no se paga en dinero.` : undefined });

  let dominical = 0;
  if (porDias) {
    const dd = Math.max(0, Math.min(diasLab / 6, 30 - diasLab));
    dominical = valorDia * dd;
    dev.push({ c: 'Descanso dominical proporcional', f: `${money(valorDia)} × (${diasLab} días ÷ 6) = ${money(valorDia)} × ${n(dd)}`, v: dominical,
      tip: 'Quien no trabaja todos los días de la semana tiene derecho al domingo pagado en proporción a lo que trabajó (art. 173 num. 5 CST): un día de descanso pagado por cada 6 trabajados.' });
  }

  let vac = 0;
  if (diasVac) {
    vac = valorDia * diasVac;
    dev.push({ c: `Vacaciones disfrutadas (${diasVac} días calendario)`, f: `${money(valorDia)} × ${diasVac}`, v: vac, tip: 'Se pagan con el salario ordinario, sin auxilio de transporte ni horas extra. Domingos y festivos dentro de las vacaciones también se remuneran.' });
  }

  let incap = 0;
  if (diasIncap) {
    const diaIncap = Math.max(valorDia * 2 / 3, Math.min(P.SMMLV / 30, valorDia));
    incap = diaIncap * diasIncap;
    dev.push({ c: `Incapacidad enfermedad general (${diasIncap} días)`, f: `máx(66,67 % × ${money(valorDia)}; mínimo diario) × ${diasIncap}`, v: incap, tip: 'Se paga al 66,67 % sin bajar del salario mínimo diario. Días 1 y 2 los asume el empleador; desde el día 3 la EPS (la empresa paga y luego recobra).' });
  }

  let extras = 0;
  const filasExtra = [];
  if (!integral) {
    for (const h of factoresHoras(R)) {
      const q = i.horas[h.id] || 0;
      if (!q) continue;
      const v = valorHora * h.f * q;
      extras += v;
      filasExtra.push({ c: `${h.nombre} · ${n(q)} h`, f: `${money(valorHora)} × ${n(h.f, 3)} × ${n(q)} h  (${h.como})`, v });
    }
  } else if (Object.values(i.horas).some(x => x > 0)) {
    warn.push(['info', 'Con salario integral no se pagan horas extras ni recargos aparte: el 30 % de factor prestacional ya los compensa (art. 132 CST). Se ignoraron.']);
  }
  dev.push(...filasExtra);
  const totExtraHoras = !integral ? (i.horas.hed + i.horas.hen + i.horas.heddf + i.horas.hendf) : 0;
  if (totExtraHoras > 52) warn.push(['warn', `Registraste ${n(totExtraHoras)} horas extra en el mes. El tope legal es 2 al día y 12 a la semana (≈ 52 al mes).`]);

  if (i.comisiones) dev.push({ c: 'Comisiones / bonificación salarial', v: i.comisiones, tip: 'Es salario: suma para seguridad social y prestaciones.' });

  // Auxilio de transporte
  let aux = 0;
  const tieneAux = !integral && salario <= 2 * P.SMMLV;
  if (tieneAux) {
    const factorAux = (i.jornadaTipo !== 'completo' && !porDias && !i.auxCompleto) ? fraccion : 1;
    aux = P.AUX / 30 * diasLab * factorAux;
    dev.push({ c: 'Auxilio de transporte', f: `${money(P.AUX)} ÷ 30 × ${diasLab} días${factorAux < 1 ? ' × ' + pctTxt(factorAux) : ''}`, v: aux,
      tip: `Lo recibe quien gana hasta 2 SMMLV (${money(2 * P.SMMLV)}). No se paga en días de vacaciones ni incapacidad. NO es base de seguridad social ni de vacaciones, pero SÍ de prima y cesantías.${i.jornadaTipo !== 'completo' ? ' En medio tiempo el Ministerio de Trabajo indica pagarlo completo si el trabajador se desplaza todos los días.' : ''}` });
  } else if (!integral) {
    dev.push({ c: 'Auxilio de transporte', vtxt: 'No aplica', tip: `Gana más de 2 SMMLV (${money(2 * P.SMMLV)}).` });
  }

  if (i.noSalarial) dev.push({ c: 'Bonificación no salarial', v: i.noSalarial, tip: 'Pactada expresamente como no salarial (art. 128 CST).' });

  const baseSalarial = salDias + dominical + vac + incap + extras + i.comisiones;
  const totalDev = baseSalarial + aux + i.noSalarial;
  dev.push({ c: 'Total devengado', v: totalDev, total: true });

  steps.push({ titulo: 'Devengados: todo lo que gana en el mes', porque: 'Se suman los pagos. Algunos son "salario" (salario, horas extra, recargos, comisiones) y otros no (auxilio de transporte, bonificaciones no salariales). Esta diferencia importa en el siguiente paso.', filas: dev });

  // ---- PASO 3: IBC ----
  const ibcF = [];
  let baseIBC = baseSalarial;
  ibcF.push({ c: 'Pagos salariales', f: 'salario + vacaciones + incapacidad + extras/recargos + comisiones', v: baseSalarial });
  if (integral) {
    baseIBC = baseSalarial * 0.7;
    ibcF.push({ c: 'Salario integral: solo cotiza el 70 %', f: `${money(baseSalarial)} × 70 %`, v: baseIBC });
  }
  const totalRem = baseSalarial + i.noSalarial;
  const exceso40 = Math.max(0, i.noSalarial - 0.4 * totalRem);
  if (i.noSalarial) {
    ibcF.push({ c: 'Regla del 40 % (Ley 1393 de 2010)', f: `no salarial ${money(i.noSalarial)} − 40 % × ${money(totalRem)} = exceso`, v: exceso40,
      tip: exceso40 ? 'Los pagos no salariales superan el 40 % de la remuneración total: el exceso se suma al IBC.' : 'Los pagos no salariales no superan el 40 %: no suman al IBC.' });
  }
  let ibc = baseIBC + exceso40;
  // Decreto 2616 de 2013: quien trabaja por días y gana menos de 1 SMMLV en el mes cotiza por semanas
  const semanasMode = porDias && !!i.cotizaSemanas && baseSalarial < P.SMMLV;
  if (porDias && i.cotizaSemanas && !semanasMode) warn.push(['info', 'Este mes gana 1 SMMLV o más: no aplica la cotización por semanas del Decreto 2616; cotiza por el mes completo.']);
  const semanas = semanasMode ? (diasLab <= 7 ? 1 : diasLab <= 14 ? 2 : diasLab <= 21 ? 3 : 4) : 0;
  const minIBC = semanasMode ? P.SMMLV / 4 * semanas : P.SMMLV / 30 * diasPeriodo, maxIBC = 25 * P.SMMLV;
  if (semanasMode) {
    ibcF.push({ c: 'Cotización por semanas (Decreto 2616 de 2013)', f: `${diasLab} días → ${semanas} semana(s) × ¼ SMMLV (${money(P.SMMLV / 4)})`, v: minIBC,
      tip: '1–7 días = 1 semana · 8–14 = 2 · 15–21 = 3 · más de 21 = 4 (un mes completo). Solo cubre pensión, ARL y caja de compensación.' });
    if (ibc < minIBC) ibc = minIBC;
  } else if (ibc < minIBC) {
    ibcF.push({ c: 'Ajuste al mínimo', f: `IBC no puede ser menor a 1 SMMLV (proporcional a ${diasPeriodo} días)`, v: minIBC,
      tip: i.jornadaTipo !== 'completo' ? 'En medio tiempo, aunque el salario sea menor, se cotiza sobre al menos 1 SMMLV. (Solo quien trabaja por días puede cotizar por semanas, Decreto 2616 de 2013.)' : undefined });
    ibc = minIBC;
  }
  if (ibc > maxIBC) { ibcF.push({ c: 'Tope máximo', f: 'IBC máximo 25 SMMLV', v: maxIBC }); ibc = maxIBC; }
  ibc = Math.round(ibc);
  ibcF.push({ c: 'IBC · Ingreso Base de Cotización', v: ibc, total: true, tip: 'El auxilio de transporte NUNCA hace parte del IBC.' });
  steps.push({ titulo: 'IBC: la base para salud y pensión', porque: 'La seguridad social se calcula sobre el Ingreso Base de Cotización: solo los pagos salariales, con un mínimo de 1 SMMLV y un máximo de 25 SMMLV.', filas: ibcF });

  // ---- PASO 4: deducciones ----
  const ded = [];
  const salud = semanasMode ? 0 : ceil100(ibc * P.saludEmp);
  const pension = ceil100(ibc * P.pensionEmp);
  const ibcMensual = ibc * 30 / diasPeriodo;
  const tFSP = tasaFSP(ibcMensual);
  const fsp = tFSP ? ceil100(ibc * tFSP) : 0;
  ded.push(semanasMode
    ? { c: 'Salud', vtxt: 'No aplica', tip: 'La cotización por semanas (Decreto 2616) no incluye salud: el trabajador debe estar en el régimen subsidiado o como beneficiario. La Ley 2466 (art. 33) permite a las trabajadoras domésticas mantener el subsidiado.' }
    : { c: 'Salud (4 %)', f: `${money(ibc)} × 4 %`, v: salud, tip: 'Las cotizaciones se redondean al múltiplo de $100 superior (PILA).' });
  ded.push({ c: 'Pensión (4 %)', f: `${money(ibc)} × 4 %`, v: pension });
  ded.push(tFSP
    ? { c: `Fondo de Solidaridad Pensional (${pctTxt(tFSP)})`, f: `${money(ibc)} × ${pctTxt(tFSP)}  · IBC = ${n(ibcMensual / P.SMMLV, 1)} SMMLV`, v: fsp, tip: 'Desde 4 SMMLV se aporta 1 % adicional; desde 16 SMMLV sube gradualmente hasta 2 %.' }
    : { c: 'Fondo de Solidaridad Pensional', vtxt: 'No aplica', tip: `Solo si el IBC es ≥ 4 SMMLV (${money(4 * P.SMMLV)}).` });

  // Retención en la fuente
  let rete = 0, reteFilas = null, reteD = null;
  if (i.calcRete) {
    const U = P.UVT;
    const ingresos = totalDev;
    const incr = salud + pension + fsp;
    const neto1 = ingresos - incr;
    const dDep = i.dependientes ? Math.min(0.10 * ingresos, 32 * U) : 0;
    const dPre = Math.min(i.prepagada, 16 * U);
    const dViv = Math.min(i.vivienda, 100 * U);
    const deducciones = dDep + dPre + dViv;
    const exenta = Math.min(0.25 * Math.max(0, neto1 - deducciones), 790 / 12 * U);
    const limite = Math.min(0.40 * neto1, 1340 / 12 * U);
    const beneficios = Math.min(deducciones + exenta, limite);
    const base = Math.max(0, neto1 - beneficios);
    const baseU = base / U;
    const tramo = TABLA383.find(t => baseU > t.desde && baseU <= t.hasta) || TABLA383[0];
    const impU = tramo.tasa ? (baseU - tramo.desde) * tramo.tasa + tramo.mas : 0;
    rete = round1000(impU * U);
    reteD = { ingresos, incr, neto1, dDep, dPre, dViv, deducciones, exenta, limite, beneficios, base, baseU, tramo, impU };
    reteFilas = [
      { c: 'Ingresos laborales del mes', v: ingresos },
      { c: '(−) Aportes obligatorios salud + pensión + FSP', v: -incr, neg: true, tip: 'Ingresos no constitutivos de renta.' },
      { c: '= Subtotal', v: neto1, sub: true },
      ...(dDep ? [{ c: '(−) Dependientes (10 %, máx. 32 UVT)', v: -dDep, neg: true }] : []),
      ...(dPre ? [{ c: '(−) Medicina prepagada (máx. 16 UVT)', v: -dPre, neg: true }] : []),
      ...(dViv ? [{ c: '(−) Intereses de vivienda (máx. 100 UVT)', v: -dViv, neg: true }] : []),
      { c: '(−) Renta exenta 25 %', f: `25 % × (subtotal − deducciones), máx. 790 UVT/año (${money(790 / 12 * U)}/mes)`, v: -exenta, neg: true },
      ...(deducciones + exenta > limite ? [{ c: 'Límite del 40 % / 1.340 UVT año', f: `deducciones + exentas no pueden pasar de ${money(limite)}`, vtxt: 'Aplicado' }] : []),
      { c: '= Base gravable', f: `${money(base)} ÷ UVT ${money(U)} = ${n(baseU)} UVT`, v: base, sub: true },
      { c: 'Tabla art. 383 E.T.', f: tramo.tasa ? `(${n(baseU)} − ${tramo.desde}) × ${pctTxt(tramo.tasa)} + ${tramo.mas} UVT = ${n(impU)} UVT` : `Hasta 95 UVT (${money(95 * U)}) la tarifa es 0 %`, vtxt: tramo.tasa ? `${pctTxt(tramo.tasa)} marginal` : '0 %' },
      { c: 'Retención en la fuente', f: tramo.tasa ? `${n(impU)} UVT × ${money(U)}, redondeado a miles` : '', v: rete, total: true },
    ];
    ded.push({ c: 'Retención en la fuente', v: rete, tip: rete ? 'Detalle en el paso siguiente.' : 'Base gravable por debajo de 95 UVT: no hay retención.' });
  }
  if (i.otrasDed) ded.push({ c: 'Otros descuentos', v: i.otrasDed, tip: 'Préstamos, libranzas, embargos… requieren autorización escrita u orden judicial (art. 149 CST).' });
  const totalDed = salud + pension + fsp + rete + i.otrasDed;
  ded.push({ c: 'Total deducciones', v: totalDed, total: true });
  steps.push({ titulo: 'Deducciones: lo que se le descuenta al trabajador', porque: 'Al trabajador le descuentan 4 % para salud y 4 % para pensión sobre el IBC. Si gana mucho, también Fondo de Solidaridad y retención en la fuente.', filas: ded });

  if (reteFilas) steps.push({ titulo: 'Retención en la fuente (procedimiento 1)', porque: 'Se "depura" el ingreso: se restan aportes, deducciones y la renta exenta del 25 %. Lo que queda se pasa a UVT y se busca en la tabla del art. 383 del Estatuto Tributario.', filas: reteFilas });

  // ---- PASO 5: neto ----
  const neto = totalDev - totalDed - especie;
  steps.push({ titulo: 'Neto a pagar', porque: especie ? 'Lo que efectivamente recibe en dinero: se resta la parte del salario que ya recibió en especie (alimentación, vivienda).' : 'Lo que efectivamente llega a la cuenta del trabajador.', filas: [
    { c: 'Total devengado', v: totalDev }, { c: '(−) Total deducciones', v: -totalDed, neg: true },
    ...(especie ? [{ c: '(−) Parte del salario pagada en especie', v: -especie, neg: true, tip: 'No es un descuento: es salario que ya recibió como alimentación o vivienda (art. 129 CST).' }] : []),
    { c: especie ? 'NETO A PAGAR EN DINERO' : 'NETO A PAGAR', v: neto, total: true },
  ] });

  // ---- PASO 6: costo empleador ----
  const salarioBajo10 = salario < 10 * P.SMMLV && !integral;
  // Hogar: la exoneración del art. 114-1 solo aplica a personas naturales con 2 o más trabajadores
  const exon = hogar ? (!!i.hogarVarios && salarioBajo10) : (i.exonerado && salarioBajo10);
  // ARL: por días laborados; con Decreto 2616 la base de ARL es 1 SMMLV completo (art. 5)
  const ibcARL = semanasMode ? P.SMMLV : porDias ? ibc : Math.round(ibc * diasLab / diasPeriodo);
  const basePara = semanasMode ? ibc : Math.round(Math.max(0, (integral ? (baseSalarial - incap) * 0.7 : baseSalarial - incap) + exceso40));
  const saludP = (exon || semanasMode) ? 0 : ceil100(ibc * P.saludPatrono);
  const pensionP = ceil100(ibc * P.pensionPatrono);
  const arl = diasLab ? ceil100(ibcARL * i.arl) : 0;
  const caja = ceil100(basePara * P.caja);
  const sinIcbfSena = exon || hogar;   // los hogares solo aportan a Caja de Compensación
  const icbf = sinIcbfSena ? 0 : ceil100(basePara * P.icbf);
  const sena = sinIcbfSena ? 0 : ceil100(basePara * P.sena);
  const aportes = saludP + pensionP + arl;
  const parafiscales = caja + icbf + sena;

  const basePrest = baseSalarial + aux;
  const baseVac = salDias + dominical + vac + incap + i.comisiones; // sin extras ni auxilio
  const ces = integral ? 0 : basePrest * P.cesantias;
  const intC = integral ? 0 : ces * P.intCes;
  const prima = integral ? 0 : basePrest * P.prima;
  const provVac = baseVac * P.vacaciones;
  const provision = ces + intC + prima + provVac;
  const costo = totalDev + aportes + parafiscales + provision;

  const emp = [
    semanasMode
      ? { c: 'Salud empleador · no aplica', f: 'La cotización por semanas (Decreto 2616) no incluye salud', v: 0 }
      : { c: exon ? 'Salud empleador · exonerado' : 'Salud empleador (8,5 %)', f: exon ? `Art. 114-1 E.T.: ${hogar ? 'hogar con 2 o más trabajadores y ' : ''}trabajador gana < 10 SMMLV` : `${money(ibc)} × 8,5 %`, v: saludP,
        tip: hogar && !exon ? 'Un hogar con un solo trabajador no está exonerado: paga el 8,5 % de salud.' : undefined },
    { c: 'Pensión empleador (12 %)', f: `${money(ibc)} × 12 %`, v: pensionP },
    { c: `ARL clase ${ARL_CLASE[String(i.arl)] || ''} (${pctTxt(i.arl)})`, f: `${money(ibcARL)} × ${pctTxt(i.arl)}`, v: arl,
      tip: semanasMode ? 'Con cotización por semanas, la ARL siempre se calcula sobre 1 SMMLV completo (Decreto 2616, art. 5).' : diasVac || diasIncap ? 'La ARL solo se paga por los días efectivamente laborados.' : 'La paga 100 % el empleador.' },
    { c: 'Caja de compensación (4 %)', f: `${money(basePara)} × 4 %`, v: caja, tip: hogar ? 'Los hogares también deben afiliar a su trabajador(a) a una caja (Decreto 721 de 2013).' : undefined },
    { c: hogar ? 'ICBF · no aplica a hogares' : exon ? 'ICBF · exonerado' : 'ICBF (3 %)', f: sinIcbfSena ? '' : `${money(basePara)} × 3 %`, v: icbf },
    { c: hogar ? 'SENA · no aplica a hogares' : exon ? 'SENA · exonerado' : 'SENA (2 %)', f: sinIcbfSena ? '' : `${money(basePara)} × 2 %`, v: sena },
    { c: 'Subtotal seguridad social y parafiscales', v: aportes + parafiscales, sub: true },
  ];
  if (!integral) {
    emp.push(
      { c: 'Provisión cesantías (8,33 %)', f: `${money(basePrest)} × 8,33 %`, v: ces, tip: 'Base = salario + extras + comisiones + auxilio de transporte.' },
      { c: 'Provisión intereses cesantías (12 % anual)', f: `${money(ces)} × 12 %`, v: intC },
      { c: 'Provisión prima de servicios (8,33 %)', f: `${money(basePrest)} × 8,33 %`, v: prima },
    );
  }
  emp.push({ c: 'Provisión vacaciones (4,17 %)', f: `${money(baseVac)} × 4,17 %`, v: provVac, tip: 'Base sin auxilio de transporte ni horas extra.' });
  emp.push({ c: 'Subtotal provisiones de prestaciones', v: provision, sub: true });
  emp.push({ c: 'COSTO TOTAL PARA LA EMPRESA', f: 'devengado + aportes + parafiscales + provisiones', v: costo, total: true,
    tip: `Factor de costo: por cada $1.000 de salario pactado la empresa gasta ≈ ${money(costo / Math.max(salario, 1) * 1000)} (×${n(costo / Math.max(salario, 1), 2)}).` });
  steps.push({ titulo: 'Costo para el empleador', porque: 'Además del salario, la empresa paga su parte de seguridad social, los parafiscales y debe ir ahorrando ("provisionando") cada mes las prestaciones sociales que pagará después.', filas: emp });

  // "d" expone todos los valores intermedios (lo usa el modo sandbox)
  const d = { R, porDias, hogar, dominical, especie, semanasMode, semanas, jornal: porDias ? valorDia : 0, integral, horasSemana, fraccion, horasMes, salario, valorDia, valorHora, minimoProp, diasPeriodo, diasVac, diasIncap, diasLab,
    salDias, vac, incap, extras, aux, tieneAux, baseSalarial, baseIBC, totalRem, exceso40, minIBC, maxIBC, ibc, ibcMensual,
    salud, pension, tFSP, fsp, rete, reteD, totalDev, totalDed, neto, exon, saludP, pensionP, arl, ibcARL, basePara, caja, icbf, sena,
    aportes, parafiscales, basePrest, baseVac, ces, intC, prima, provVac, provision, costo };
  return { steps, warn, totalDev, totalDed, neto, costo, aportes, parafiscales, provision, ibc, valorHora, d };
}

// ---------- 4. Motor: prestaciones y liquidación ----------
function calcPrestaciones(i) {
  const warn = [], steps = [];
  const ing = parseDate(i.ingreso), cor = parseDate(i.corte);
  if (!ing || !cor || cor < ing) return { error: 'Revisa las fechas: la fecha de corte debe ser posterior a la de ingreso.' };
  const integral = i.tipo === 'integral';
  const auxOk = !integral && i.aux && i.salario <= 2 * P.SMMLV;
  if (i.aux && !auxOk && !integral) warn.push(['info', `El auxilio de transporte no aplica: el salario supera 2 SMMLV (${money(2 * P.SMMLV)}).`]);
  if (integral && i.salario < 13 * P.SMMLV) warn.push(['danger', `El salario integral debe ser mínimo ${money(13 * P.SMMLV)} (13 SMMLV).`]);
  const aux = auxOk ? P.AUX : 0;

  const diasTotal = dias360(ing, cor);
  const inicioAnio = new Date(cor.getFullYear(), 0, 1);
  const desdeCes = ing > inicioAnio ? ing : inicioAnio;
  const diasCes = dias360(desdeCes, cor);
  const inicioSem = new Date(cor.getFullYear(), cor.getMonth() < 6 ? 0 : 6, 1);
  const desdeSem = ing > inicioSem ? ing : inicioSem;
  const diasPrima = i.primaPagada === 'si' ? 0 : dias360(desdeSem, cor);

  const basePrest = i.salario + aux + i.extras + i.comis;
  const baseVac = i.salario + i.comis;

  steps.push({ titulo: 'Tiempo de servicio (año de 360 días)', porque: 'En liquidaciones laborales todos los meses cuentan como de 30 días y el año como de 360.', filas: [
    { c: 'Tiempo total del contrato', f: `${i.ingreso} → ${i.corte}`, vtxt: `${diasTotal} días` },
    { c: 'Días para cesantías e intereses', f: `desde ${iso(desdeCes)} (las de años anteriores ya se consignaron al fondo)`, vtxt: `${diasCes} días` },
    { c: 'Días para prima del semestre', f: i.primaPagada === 'si' ? 'ya se pagó la prima de este semestre' : `desde ${iso(desdeSem)}`, vtxt: `${diasPrima} días` },
  ] });

  let ces = 0, intC = 0, prima = 0;
  if (!integral) {
    ces = basePrest * diasCes / 360;
    intC = ces * diasCes * 0.12 / 360;
    prima = basePrest * diasPrima / 360;
    steps.push({ titulo: 'Base y prestaciones sociales', porque: 'Cesantías y prima usan el salario + auxilio de transporte + promedio variable. Los intereses son el 12 % anual sobre las cesantías.', filas: [
      { c: 'Base prestacional', f: `salario ${money(i.salario)} + aux ${money(aux)} + extras ${money(i.extras)} + comisiones ${money(i.comis)}`, v: basePrest },
      { c: 'Cesantías', f: `${money(basePrest)} × ${diasCes} ÷ 360`, v: ces, tip: 'Un mes de salario por año. Si hay retiro se pagan al trabajador; si no, se consignan al fondo antes del 14 de febrero.' },
      { c: 'Intereses sobre cesantías', f: `${money(ces)} × ${diasCes} × 12 % ÷ 360`, v: intC, tip: 'Se pagan directamente al trabajador, a más tardar el 31 de enero.' },
      { c: 'Prima de servicios', f: `${money(basePrest)} × ${diasPrima} ÷ 360`, v: prima, tip: 'Medio salario por semestre: se paga a más tardar el 30 de junio y el 20 de diciembre.' },
    ] });
  } else {
    warn.push(['info', 'Salario integral: no hay prima, cesantías ni intereses (ya están incluidos en el 30 % prestacional). Sí hay vacaciones.']);
  }

  const diasVacGanados = diasTotal * 15 / 360;
  const diasVacPend = Math.max(0, diasVacGanados - i.vacTomadas);
  const vac = baseVac / 30 * diasVacPend;
  steps.push({ titulo: 'Vacaciones pendientes', porque: '15 días hábiles por cada año trabajado (1,25 días por mes). Al terminar el contrato, las no disfrutadas se pagan en dinero.', filas: [
    { c: 'Días ganados', f: `${diasTotal} días × 15 ÷ 360`, vtxt: `${n(diasVacGanados)} días` },
    { c: '(−) Días ya disfrutados', vtxt: `${n(i.vacTomadas)} días` },
    { c: 'Días pendientes', vtxt: `${n(diasVacPend)} días`, sub: true },
    { c: 'Valor vacaciones', f: `${money(baseVac)} ÷ 30 × ${n(diasVacPend)}`, v: vac, tip: 'Base: salario sin auxilio de transporte ni horas extra.' + (integral ? ' En integral se usa el 100 % del salario.' : '') },
  ] });
  if (i.vacTomadas > diasVacGanados) warn.push(['warn', 'Disfrutó más días de los ganados (vacaciones anticipadas). La diferencia no se paga.']);

  let indem = 0;
  if (i.motivo === 'sinjusta') {
    const diario = i.salario / 30;
    const alto = i.salario >= 10 * P.SMMLV;
    const primer = alto ? 20 : 30, adic = alto ? 15 : 20;
    const diasIndem = diasTotal <= 360 ? primer : primer + adic * (diasTotal - 360) / 360;
    indem = diario * diasIndem;
    steps.push({ titulo: 'Indemnización por despido sin justa causa', porque: `Contrato a término indefinido (art. 64 CST). Salario ${alto ? '≥' : '<'} 10 SMMLV: ${primer} días por el primer año y ${adic} días por cada año adicional (y proporcional por fracción).`, filas: [
      { c: 'Días de indemnización', f: diasTotal <= 360 ? `menos de 1 año → ${primer} días` : `${primer} + ${adic} × (${diasTotal} − 360) ÷ 360`, vtxt: `${n(diasIndem)} días` },
      { c: 'Indemnización', f: `${money(diario)} × ${n(diasIndem)}`, v: indem },
    ] });
  }

  const total = ces + intC + prima + vac + indem;
  const filasT = [];
  if (!integral) filasT.push({ c: 'Cesantías', v: ces }, { c: 'Intereses cesantías', v: intC }, { c: 'Prima', v: prima });
  filasT.push({ c: 'Vacaciones', v: vac });
  if (indem) filasT.push({ c: 'Indemnización', v: indem });
  filasT.push({ c: i.motivo === 'corte' ? 'TOTAL ACUMULADO A LA FECHA' : 'TOTAL LIQUIDACIÓN', v: total, total: true,
    tip: i.motivo !== 'corte' ? 'Súmale el salario de los días trabajados del último mes que no se hayan pagado. Pagar tarde la liquidación genera la sanción del art. 65 CST (un día de salario por cada día de retraso).' : undefined });
  steps.push({ titulo: 'Resumen', porque: 'Esto es lo que se le debe al trabajador por concepto de prestaciones a la fecha de corte.', filas: filasT });

  return { steps, warn, total, ces, prima, vac, diasTotal };
}

// ---------- 5. Motor: vacaciones ----------
function calcVacaciones(i) {
  const ini = parseDate(i.inicio);
  if (!ini) return { error: 'Escribe la fecha de inicio.' };
  const dias = [];
  let d = new Date(ini), habiles = 0, guard = 0;
  while (habiles < i.dias && guard++ < 400) {
    const k = iso(d), dow = d.getDay();
    let tipo = 'h', nota = '';
    if (FESTIVOS[k]) { tipo = 'f'; nota = FESTIVOS[k]; }
    else if (dow === 0) { tipo = 'f'; nota = 'domingo'; }
    else if (dow === 6 && !i.sabado) { tipo = 's'; nota = 'sábado no hábil'; }
    if (tipo === 'h') habiles++;
    dias.push({ d: new Date(d), tipo, nota });
    d.setDate(d.getDate() + 1);
  }
  // fecha de regreso: siguiente día hábil
  let reg = new Date(d), g2 = 0;
  while (g2++ < 30) {
    const k = iso(reg), dow = reg.getDay();
    if (!FESTIVOS[k] && dow !== 0 && !(dow === 6 && !i.sabado)) break;
    reg.setDate(reg.getDate() + 1);
  }
  const calendario = dias.length;
  const valor = i.salario / 30 * i.dias;
  const fuera = dias.filter(x => x.tipo !== 'h');

  // acumulados
  let acum = null;
  const ing = parseDate(i.ingreso), cor = parseDate(i.corte);
  if (ing && cor && cor >= ing) {
    const t = dias360(ing, cor);
    acum = { t, ganados: t * 15 / 360, pend: Math.max(0, t * 15 / 360 - i.tomados) };
  }
  return { dias, reg, calendario, valor, fuera, acum };
}

// ---------- 6. Render ----------
function renderSteps(steps, startNum = 1) {
  return steps.map((s, k) => `
    <div class="card step">
      <div class="num" aria-hidden="true">${k + startNum}</div>
      <div>
        <h2>${esc(s.titulo)}</h2>
        <p class="why">${esc(s.porque)}</p>
        <table class="calc"><tbody>
          ${s.filas.map(r => `<tr class="${r.total ? 'total' : ''} ${r.sub ? 'sub' : ''}">
            <td>${esc(r.c)}${r.f ? `<span class="f">${esc(r.f)}</span>` : ''}${r.tip ? `<span class="tip">${esc(r.tip)}</span>` : ''}</td>
            <td class="v ${r.neg ? 'neg' : ''}">${r.vtxt !== undefined ? esc(r.vtxt) : (r.v < 0 ? '−' + money(-r.v) : money(r.v))}</td>
          </tr>`).join('')}
        </tbody></table>
      </div>
    </div>`).join('');
}
const renderAlerts = list => list.map(([t, m]) => `<div class="alert ${t}">${esc(m)}</div>`).join('');
const kpi = (t, v, main) => `<div class="kpi ${main ? 'main' : ''}"><div class="t">${esc(t)}</div><div class="v">${money(v)}</div></div>`;

// ---------- 7. Pestaña Nómina: formulario ----------
const HX_IDS = ['hed', 'hen', 'heddf', 'hendf', 'rn', 'rdf', 'rndf'];

function initNomina() {
  const mesSel = $('#mes');
  mesSel.innerHTML = MESES.map((m, k) => `<option value="${k + 1}">${m} ${P.anio}</option>`).join('');
  const hoy = new Date();
  mesSel.value = hoy.getFullYear() === P.anio ? hoy.getMonth() + 1 : 1;
  $('#jornadaMax').value = reglasMes(+mesSel.value).jornadaMax;
  $('#salario').value = P.SMMLV;

  $('#hxList').innerHTML = factoresHoras(0.9).map(h =>
    `<div class="hx"><label class="n" for="h_${h.id}">${h.nombre}<small id="hs_${h.id}"></small></label><input type="number" id="h_${h.id}" min="0" step="0.5" value="0"></div>`).join('');

  const grupos = {
    'Básicos': {
      'Mínimo tiempo completo': { salario: P.SMMLV },
      'Medio tiempo': { jornadaTipo: 'medio', salario: Math.round(P.SMMLV / 2) },
      'Vacaciones + incapacidad': { salario: 3000000, diasVac: 10, diasIncap: 3 },
      'Salario alto con retención': { salario: 9500000, dependientes: true, prepagada: 450000 },
      'Salario integral': { tipoSalario: 'integral', salario: 25000000 },
    },
    'Aseo y servicio doméstico': {
      'Aseo en empresa': { salario: P.SMMLV, arl: '0.01044' },
      'Aseo medio tiempo': { jornadaTipo: 'medio', salario: Math.round(P.SMMLV / 2), arl: '0.01044' },
      'Doméstica externa (tiempo completo)': { empleador: 'hogar', salario: P.SMMLV },
      'Doméstica interna (con vivienda y comida)': { empleador: 'hogar', salario: P.SMMLV, especie: 350000 },
      'Doméstica por días (2 días/semana)': { empleador: 'hogar', jornadaTipo: 'dias', jornal: 80000, diasTrab: 8, cotizaSemanas: true },
    },
    'Otros oficios': {
      'Mesero con extras y domingo': { salario: 2200000, h_hed: 10, h_hen: 4, h_rn: 8, h_rdf: 8 },
      'Vigilante (turnos de noche)': { salario: P.SMMLV, arl: '0.0435', h_hen: 12, h_hendf: 4, h_rn: 70, h_rdf: 16, h_rndf: 8 },
      'Vendedor con comisiones': { salario: 2400000, comisiones: 900000, noSalarial: 300000 },
    },
  };
  const presets = Object.assign({}, ...Object.values(grupos));
  const base = { tipoSalario: 'ordinario', jornadaTipo: 'completo', diasPeriodo: 30, diasVac: 0, diasIncap: 0, comisiones: 0, noSalarial: 0, otrasDed: 0, prepagada: 0, vivienda: 0,
    dependientes: false, calcRete: true, auxCompleto: true, horasSemana: 24, empleador: 'empresa', hogarVarios: false, exonerado: true,
    jornal: 80000, diasTrab: 8, cotizaSemanas: true, especie: 0, arl: '0.00522' };
  HX_IDS.forEach(id => base['h_' + id] = 0);
  $('#presets').innerHTML = Object.entries(grupos).map(([g, ps]) => `<div class="pgroup"><div class="lbl">${esc(g)}</div><div class="presets">${Object.keys(ps).map(k => `<button type="button" class="btn" data-p="${esc(k)}">${esc(k)}</button>`).join('')}</div></div>`).join('');
  $('#presets').addEventListener('click', e => {
    const b = e.target.closest('button[data-p]'); if (!b) return;
    const p = { ...base, ...presets[b.dataset.p] };
    for (const [k, v] of Object.entries(p)) { const el = $('#' + k); if (!el) continue; if (el.type === 'checkbox') el.checked = v; else el.value = v; }
    updateNomina();
  });

  mesSel.addEventListener('change', () => { $('#jornadaMax').value = reglasMes(+mesSel.value).jornadaMax; });
  $('#fNomina').addEventListener('input', updateNomina);
  $('#fNomina').addEventListener('change', updateNomina);
  updateNomina();
}

function leerNomina() {
  const m = +$('#mes').value;
  const horas = {}; HX_IDS.forEach(id => horas[id] = numVal('h_' + id));
  return {
    mes: m, recargoDom: reglasMes(m).recargoDom, jornadaMax: +$('#jornadaMax').value,
    tipoSalario: $('#tipoSalario').value, jornadaTipo: $('#jornadaTipo').value, horasSemana: numVal('horasSemana'),
    salario: numVal('salario'), diasPeriodo: numVal('diasPeriodo') || 30, diasVac: numVal('diasVac'), diasIncap: numVal('diasIncap'),
    auxCompleto: chk('auxCompleto'), horas,
    comisiones: numVal('comisiones'), noSalarial: numVal('noSalarial'), otrasDed: numVal('otrasDed'),
    calcRete: chk('calcRete'), dependientes: chk('dependientes'), prepagada: numVal('prepagada'), vivienda: numVal('vivienda'),
    arl: parseFloat($('#arl').value), exonerado: chk('exonerado'),
    empleador: $('#empleador').value, hogarVarios: chk('hogarVarios'),
    jornal: numVal('jornal'), diasTrab: numVal('diasTrab'), cotizaSemanas: chk('cotizaSemanas'), especie: numVal('especie'),
  };
}

function updateNomina() {
  const i = leerNomina();
  const porDias = i.jornadaTipo === 'dias';
  const integral = i.tipoSalario === 'integral' && !porDias;
  const hogar = i.empleador === 'hogar';
  $('#boxHoras').hidden = i.jornadaTipo !== 'otra';
  $('#boxDias').hidden = !porDias;
  $('#boxSalario').hidden = porDias;
  $('#boxPeriodo').hidden = porDias;
  $('#cardNovedades').hidden = porDias;
  $('#boxEspecie').hidden = porDias || integral;
  $('#boxExon').hidden = hogar;
  $('#boxHogar').hidden = !hogar;
  $('#boxAux').hidden = i.jornadaTipo === 'completo' || porDias || integral;
  $('#hxList').querySelectorAll('input').forEach(el => el.disabled = integral);

  const R = i.recargoDom;
  $('#mesHint').textContent = `${MESES[i.mes - 1]}: recargo dominical/festivo ${pctTxt(R)}` + (i.mes === 7 ? ' · Desde el 15 de julio la jornada baja a 42 h; elige 42 si liquidas la segunda quincena.' : '') + (i.mes < 7 ? ' (sube a 90 % el 1 de julio).' : '.');

  const r = calcNomina(i);
  factoresHoras(R).forEach(h => { $('#hs_' + h.id).textContent = `×${n(h.f, 3)} → ${money(r.valorHora * h.f)} por hora`; });

  const frac = (i.jornadaTipo === 'completo' ? i.jornadaMax : i.jornadaTipo === 'medio' ? i.jornadaMax / 2 : Math.min(i.horasSemana || 1, i.jornadaMax)) / i.jornadaMax;
  $('#jornalHint').textContent = `Jornal mínimo 2026: ${money(P.SMMLV / 30)} (SMMLV ÷ 30). Hoy: ${money(i.jornal)}`;
  $('#salarioHint').textContent = integral
    ? `Mínimo integral 2026: ${money(13 * P.SMMLV)} (13 SMMLV).`
    : `Mínimo ${frac < 1 ? 'proporcional ' : ''}2026: ${money(P.SMMLV * frac)} · Hoy: ${money(i.salario)}`;

  $('#kpis').innerHTML = kpi('Devengado', r.totalDev) + kpi('Deducciones', r.totalDed) + kpi('Neto a pagar', r.neto, true) + kpi('Costo empresa', r.costo);
  const parts = [
    ['Neto al trabajador', r.neto, 'var(--c-neto)'],
    ['Descuentos del trabajador', r.totalDed, 'var(--c-ded)'],
    ['Aportes y parafiscales empresa', r.aportes + r.parafiscales, 'var(--c-apo)'],
    ['Provisión prestaciones', r.provision, 'var(--c-prov)'],
  ];
  const tot = parts.reduce((a, p) => a + Math.max(0, p[1]), 0) || 1;
  $('#stack').innerHTML = parts.map(p => `<span style="width:${Math.max(0, p[1]) / tot * 100}%;background:${p[2]}" title="${p[0]}: ${money(p[1])}"></span>`).join('');
  $('#legend').innerHTML = parts.map(p => `<span><i style="background:${p[2]}"></i>${p[0]} · <b>${n(Math.max(0, p[1]) / tot * 100, 1)} %</b></span>`).join('');
  $('#alerts').innerHTML = renderAlerts(r.warn);
  $('#steps').innerHTML = renderSteps(r.steps);
}

// ---------- 8. Pestaña Prestaciones ----------
function initPrest() {
  $('#fPrest').addEventListener('input', updatePrest);
  $('#fPrest').addEventListener('change', updatePrest);
  updatePrest();
}
function updatePrest() {
  const i = {
    tipo: $('#pTipo').value, ingreso: $('#pIngreso').value, corte: $('#pCorte').value,
    salario: numVal('pSalario'), extras: numVal('pExtras'), comis: numVal('pComis'), aux: chk('pAux'),
    vacTomadas: numVal('pVacTomadas'), primaPagada: $('#pPrimaPagada').value, motivo: $('#pMotivo').value,
  };
  const r = calcPrestaciones(i);
  if (r.error) { $('#pKpis').innerHTML = ''; $('#pSteps').innerHTML = ''; $('#pAlerts').innerHTML = renderAlerts([['danger', r.error]]); return; }
  $('#pKpis').innerHTML = kpi('Prima', r.prima) + kpi('Vacaciones', r.vac) + kpi(i.motivo === 'corte' ? 'Total acumulado' : 'Total liquidación', r.total, true);
  $('#pAlerts').innerHTML = renderAlerts(r.warn);
  $('#pSteps').innerHTML = renderSteps(r.steps);
}

// ---------- 9. Pestaña Vacaciones ----------
function initVac() {
  $('#fVac').addEventListener('input', updateVac);
  $('#fVac').addEventListener('change', updateVac);
  updateVac();
}
function updateVac() {
  const i = { salario: numVal('vSalario'), inicio: $('#vInicio').value, dias: Math.max(1, Math.round(numVal('vDias')) || 15), sabado: chk('vSabado'),
    ingreso: $('#vIngreso').value, corte: $('#vCorte').value, tomados: numVal('vTomados') };
  const r = calcVacaciones(i);
  if (r.error) { $('#vOut').innerHTML = renderAlerts([['danger', r.error]]); return; }
  const chips = r.dias.map(x => `<span class="d ${x.tipo}" title="${esc(x.nota || 'día hábil de vacaciones')}">${DIAS_SEM[x.d.getDay()]} ${x.d.getDate()}/${x.d.getMonth() + 1}${x.nota && x.tipo === 'f' && x.nota !== 'domingo' ? '<br>festivo' : ''}</span>`).join('')
    + `<span class="d r" title="Fecha de regreso">regresa<br>${DIAS_SEM[r.reg.getDay()]} ${r.reg.getDate()}/${r.reg.getMonth() + 1}</span>`;
  const fest = r.fuera.filter(x => x.tipo === 'f' && x.nota !== 'domingo');
  $('#vOut').innerHTML = `
    <div class="kpis k3">
      ${kpi('Valor a pagar', r.valor, true)}
      <div class="kpi"><div class="t">Días calendario</div><div class="v">${r.calendario} días</div></div>
      <div class="kpi"><div class="t">Regresa el</div><div class="v" style="font-size:16px">${esc(fechaLarga(r.reg))}</div></div>
    </div>
    ${renderSteps([{
      titulo: 'Cómo se cuentan los días', porque: 'Las vacaciones son de 15 días HÁBILES. Los domingos y festivos (y el sábado si no es hábil) no se descuentan del saldo, por eso el trabajador descansa más días calendario.',
      filas: [
        { c: 'Días hábiles de vacaciones', vtxt: `${i.dias} días` },
        { c: 'Domingos dentro del periodo', vtxt: `${r.fuera.filter(x => x.nota === 'domingo').length}` },
        { c: 'Festivos dentro del periodo', f: fest.map(x => `${x.d.getDate()}/${x.d.getMonth() + 1} ${x.nota}`).join(' · '), vtxt: `${fest.length}` },
        ...(!i.sabado ? [{ c: 'Sábados no hábiles', vtxt: `${r.fuera.filter(x => x.tipo === 's').length}` }] : []),
        { c: 'Total días calendario de descanso', vtxt: `${r.calendario} días`, total: true, tip: 'Este es el número que pones en "Días de vacaciones (calendario)" en la pestaña Nómina.' },
      ] }, {
      titulo: 'Cuánto se paga', porque: 'Se pagan con el salario ordinario que tenga el trabajador al salir a vacaciones, sin auxilio de transporte ni horas extra (art. 192 CST). Pueden pagarse por anticipado.',
      filas: [
        { c: 'Valor día', f: `${money(i.salario)} ÷ 30`, v: i.salario / 30 },
        { c: 'Vacaciones', f: `${money(i.salario / 30)} × ${i.dias} días hábiles`, v: r.valor, total: true, tip: 'Los domingos y festivos del periodo ya están cubiertos por el salario mensual: en la nómina el trabajador recibe su mes completo, solo cambia el concepto.' },
      ] }])}
    <div class="card"><h2>Calendario</h2>
      <div class="legend"><span><i style="background:var(--accent)"></i>hábil de vacaciones</span><span><i style="background:var(--warn-bg);border:1px solid var(--warn)"></i>domingo / festivo</span>${!i.sabado ? '<span><i style="background:var(--surface-2);border:1px solid var(--border)"></i>sábado no hábil</span>' : ''}</div>
      <div class="cal">${chips}</div></div>
    ${r.acum ? renderSteps([{ titulo: 'Días acumulados', porque: 'Se ganan 15 días hábiles por cada 360 días trabajados. Se pueden acumular hasta por 2 años (4 años para técnicos, directivos y de confianza).',
      filas: [
        { c: 'Tiempo trabajado', vtxt: `${r.acum.t} días` },
        { c: 'Días ganados', f: `${r.acum.t} × 15 ÷ 360`, vtxt: `${n(r.acum.ganados)} días` },
        { c: '(−) Ya disfrutados', vtxt: `${n(i.tomados)} días` },
        { c: 'Días pendientes', vtxt: `${n(r.acum.pend)} días`, total: true },
        { c: 'Valor de los días pendientes', f: `${money(i.salario / 30)} × ${n(r.acum.pend)}`, v: i.salario / 30 * r.acum.pend },
      ] }], 3) : ''}`;
}

// ---------- 10. Pestaña Aprende ----------
function initLearn() {
  const h44 = P.SMMLV / 220, h42 = P.SMMLV / 210;
  const f1 = factoresHoras(0.80), f2 = factoresHoras(0.90);
  const quiz = [
    { q: `Un trabajador gana ${money(3800000)}. ¿Recibe auxilio de transporte?`, o: ['Sí', 'No'], a: 1, e: `No. Solo se paga hasta 2 SMMLV = ${money(2 * P.SMMLV)}.` },
    { q: '¿El auxilio de transporte se incluye para calcular salud y pensión?', o: ['Sí', 'No'], a: 1, e: 'No. El auxilio no es salario para seguridad social. Pero sí entra en la base de prima y cesantías.' },
    { q: '¿Cuánto es el recargo por trabajar un domingo desde el 1 de julio de 2026?', o: ['75 %', '80 %', '90 %', '100 %'], a: 2, e: 'Ley 2466 de 2025: 80 % desde julio 2025, 90 % desde julio 2026 y 100 % desde julio 2027.' },
    { q: '¿Desde qué hora empieza el trabajo nocturno?', o: ['6:00 p.m.', '7:00 p.m.', '9:00 p.m.', '10:00 p.m.'], a: 1, e: 'Desde el 25 de diciembre de 2025 el trabajo nocturno va de 7:00 p.m. a 6:00 a.m. (Ley 2466).' },
    { q: 'Con salario mínimo y jornada de 42 h, ¿cuánto vale una hora extra diurna?', o: [money(h42 * 1.25), money(h42 * 1.75), money(h42)], a: 0, e: `Hora = ${money(P.SMMLV)} ÷ 210 = ${money(h42)}; × 1,25 = ${money(h42 * 1.25)}.` },
    { q: '¿Qué porcentaje de pensión paga el empleador?', o: ['4 %', '8,5 %', '12 %', '16 %'], a: 2, e: 'Pensión total 16 %: 12 % empleador + 4 % trabajador.' },
    { q: '¿Cuántos días de vacaciones se ganan por año?', o: ['15 calendario', '15 hábiles', '30 hábiles'], a: 1, e: '15 días hábiles consecutivos por cada año de servicio (art. 186 CST).' },
    { q: 'Medio tiempo con salario de medio mínimo: ¿sobre qué base cotiza salud y pensión?', o: ['Medio SMMLV', '1 SMMLV'], a: 1, e: 'El IBC no puede ser inferior a 1 SMMLV cuando se trabajan todos los días del mes.' },
  ];
  $('#learn').innerHTML = `
    <div class="card"><h2>La nómina en 6 pasos</h2>
      <div class="flow">
        <div class="box"><b>1. Valor día / hora</b><span>salario ÷ 30 · salario ÷ horas mes</span></div><div class="arr">→</div>
        <div class="box"><b>2. Devengados</b><span>salario, extras, recargos, auxilio</span></div><div class="arr">→</div>
        <div class="box"><b>3. IBC</b><span>solo pagos salariales, mín. 1 SMMLV</span></div><div class="arr">→</div>
        <div class="box"><b>4. Deducciones</b><span>4 % salud, 4 % pensión, FSP, retención</span></div><div class="arr">→</div>
        <div class="box"><b>5. Neto</b><span>devengado − deducciones</span></div><div class="arr">→</div>
        <div class="box"><b>6. Costo empresa</b><span>aportes + parafiscales + provisiones</span></div>
      </div>
    </div>

    <div class="card"><h2>Valores clave 2026</h2><div class="scroll"><table class="ref">
      <tr><th>Concepto</th><th class="r">Valor</th><th>Norma</th></tr>
      <tr><td>Salario mínimo (SMMLV)</td><td class="r">${money(P.SMMLV)}</td><td>Decreto 1469 de 2025 · Decreto 0159 de 2026</td></tr>
      <tr><td>Auxilio de transporte</td><td class="r">${money(P.AUX)}</td><td>Decreto 1470 de 2025</td></tr>
      <tr><td>Mínimo + auxilio</td><td class="r">${money(P.SMMLV + P.AUX)}</td><td></td></tr>
      <tr><td>Tope auxilio (2 SMMLV)</td><td class="r">${money(2 * P.SMMLV)}</td><td></td></tr>
      <tr><td>Salario integral mínimo (13 SMMLV)</td><td class="r">${money(13 * P.SMMLV)}</td><td>Art. 132 CST</td></tr>
      <tr><td>UVT</td><td class="r">${money(P.UVT)}</td><td>Resolución DIAN 000238 de 2025</td></tr>
      <tr><td>Jornada máxima</td><td class="r">44 h → 42 h</td><td>Ley 2101 de 2021 (42 h desde 15-jul-2026)</td></tr>
      <tr><td>Hora ordinaria con mínimo</td><td class="r">${money(h44)} → ${money(h42)}</td><td>÷ 220 h (44 h) · ÷ 210 h (42 h)</td></tr>
    </table></div></div>

    <div class="card"><h2>Horas extras y recargos 2026</h2>
      <p class="why muted">El factor multiplica el valor de la hora ordinaria. Los recargos sobre horas ordinarias solo pagan el porcentaje adicional, porque la hora ya está incluida en el salario. Los recargos se suman entre sí.</p>
      <div class="scroll"><table class="ref">
      <tr><th>Concepto</th><th class="r">Ene–jun</th><th class="r">Jul–dic</th><th class="r">Valor hora mín. (jul–dic, 42 h)</th></tr>
      ${f1.map((h, k) => `<tr><td>${h.nombre}</td><td class="r">×${n(h.f, 2)}</td><td class="r">×${n(f2[k].f, 2)}</td><td class="r">${money(h42 * f2[k].f)}</td></tr>`).join('')}
      </table></div>
      <p class="hint" style="margin-top:8px">Si el trabajo dominical es ocasional, además del recargo puede pedir un día compensatorio remunerado o el pago; si es habitual (3 o más domingos al mes), tiene derecho a un día de descanso compensatorio.</p>
    </div>

    <div class="card"><h2>Seguridad social, parafiscales y prestaciones</h2><div class="scroll"><table class="ref">
      <tr><th>Concepto</th><th class="r">Trabajador</th><th class="r">Empleador</th><th>Base</th></tr>
      <tr><td>Salud</td><td class="r">4 %</td><td class="r">8,5 % (0 % si exonerado)</td><td>IBC</td></tr>
      <tr><td>Pensión</td><td class="r">4 %</td><td class="r">12 %</td><td>IBC</td></tr>
      <tr><td>Fondo de Solidaridad Pensional</td><td class="r">1 % a 2 %</td><td class="r">—</td><td>IBC ≥ 4 SMMLV</td></tr>
      <tr><td>ARL</td><td class="r">—</td><td class="r">0,522 % a 6,96 %</td><td>IBC</td></tr>
      <tr><td>Caja de compensación</td><td class="r">—</td><td class="r">4 %</td><td>Nómina salarial</td></tr>
      <tr><td>ICBF / SENA</td><td class="r">—</td><td class="r">3 % / 2 % (0 % si exonerado)</td><td>Nómina salarial</td></tr>
      <tr><td>Cesantías</td><td class="r">—</td><td class="r">8,33 %</td><td>Salario + auxilio</td></tr>
      <tr><td>Intereses cesantías</td><td class="r">—</td><td class="r">12 % anual de las cesantías</td><td>Cesantías</td></tr>
      <tr><td>Prima de servicios</td><td class="r">—</td><td class="r">8,33 %</td><td>Salario + auxilio</td></tr>
      <tr><td>Vacaciones</td><td class="r">—</td><td class="r">4,17 %</td><td>Salario sin auxilio ni extras</td></tr>
    </table></div></div>

    <div class="card"><h2>Medio tiempo vs. tiempo completo</h2>
      <table class="ref">
      <tr><th></th><th>Tiempo completo</th><th>Medio tiempo</th></tr>
      <tr><td>Salario mínimo</td><td>${money(P.SMMLV)}</td><td>Proporcional: ${money(P.SMMLV / 2)}</td></tr>
      <tr><td>Auxilio de transporte</td><td>Completo si gana ≤ 2 SMMLV</td><td>Completo si va todos los días (MinTrabajo)</td></tr>
      <tr><td>IBC salud y pensión</td><td>Salario (mín. 1 SMMLV)</td><td>Mínimo 1 SMMLV aunque gane menos</td></tr>
      <tr><td>Prestaciones y vacaciones</td><td colspan="2">Iguales, calculadas sobre lo que realmente gana</td></tr>
      </table></div>

    <div class="card"><h2>Glosario</h2><dl class="glos">
      <dt>Devengado</dt><dd>Todo lo que el trabajador gana en el periodo, antes de descuentos.</dd>
      <dt>IBC</dt><dd>Ingreso Base de Cotización. Sobre él se calculan salud, pensión y ARL.</dd>
      <dt>Pago salarial</dt><dd>Retribuye directamente el servicio: salario, horas extra, recargos, comisiones. Suma para todo.</dd>
      <dt>Pago no salarial</dt><dd>Pagos ocasionales o pactados como no salariales. No suman a prestaciones; a seguridad social solo si superan el 40 %.</dd>
      <dt>Parafiscales</dt><dd>Aportes del empleador a Caja de Compensación, ICBF y SENA.</dd>
      <dt>Exoneración 114-1</dt><dd>Las personas jurídicas (y naturales con 2+ empleados) no pagan salud 8,5 %, ICBF ni SENA por trabajadores que ganen menos de 10 SMMLV.</dd>
      <dt>Provisión</dt><dd>Dinero que la empresa reserva cada mes para pagar después prima, cesantías y vacaciones.</dd>
      <dt>UVT</dt><dd>Unidad de Valor Tributario. La DIAN la usa para expresar topes y la tabla de retención.</dd>
      <dt>Salario integral</dt><dd>Desde 13 SMMLV. Incluye en un solo pago el salario y el 30 % de prestaciones. Cotiza sobre el 70 %.</dd>
      <dt>Recargo</dt><dd>Porcentaje adicional por trabajar de noche, domingo o festivo dentro de la jornada ordinaria.</dd>
      <dt>Hora extra</dt><dd>Hora que supera la jornada pactada o la máxima legal.</dd>
    </dl></div>

    <div class="card quiz"><h2>Pon a prueba lo que aprendiste</h2><div id="quizBox">
      ${quiz.map((x, k) => `<div class="q" data-a="${x.a}"><p>${k + 1}. ${esc(x.q)}</p><div class="opts">${x.o.map((o, j) => `<button type="button" class="btn" data-j="${j}">${esc(o)}</button>`).join('')}</div><div class="fb" hidden>${esc(x.e)}</div></div>`).join('')}
    </div><p class="hint" id="quizScore" style="margin-top:8px"></p></div>

    <div class="card"><h2>Normas para profundizar</h2>
      <p class="muted" style="margin:0">Código Sustantivo del Trabajo (arts. 127–132 salario, 158–179 jornada y recargos, 186–192 vacaciones, 249–306 prestaciones, 64 indemnización) · Ley 100 de 1993 · Ley 1393 de 2010 (regla del 40 %) · Ley 2101 de 2021 (jornada de 42 h) · Ley 2466 de 2025 (reforma laboral: nocturno desde 7 p.m., recargo dominical gradual) · Estatuto Tributario arts. 114-1, 206, 383, 387.</p></div>`;

  let ok = 0, answered = 0;
  $('#quizBox').addEventListener('click', e => {
    const b = e.target.closest('button[data-j]'); if (!b) return;
    const q = b.closest('.q'); if (q.dataset.done) return;
    q.dataset.done = '1'; answered++;
    const right = +q.dataset.a === +b.dataset.j;
    if (right) ok++;
    b.classList.add(right ? 'ok' : 'bad');
    q.querySelector(`button[data-j="${q.dataset.a}"]`).classList.add('ok');
    q.querySelector('.fb').hidden = false;
    $('#quizScore').textContent = `Llevas ${ok} de ${answered} correctas${answered === quiz.length ? (ok === quiz.length ? ' · ¡Perfecto! Ya sabes liquidar nómina.' : ' · Repasa las explicaciones y vuelve a intentarlo (recarga la página).') : ''}.`;
  });
}

// ---------- 11. Arranque ----------
function initTabs() {
  const tabs = [...document.querySelectorAll('nav.tabs button')];
  const show = id => {
    tabs.forEach(t => { const on = t.getAttribute('aria-controls') === id; t.setAttribute('aria-selected', on); document.getElementById(t.getAttribute('aria-controls')).classList.toggle('active', on); });
    try { localStorage.setItem('nomina-tab', id); } catch (e) { /* sin almacenamiento */ }
  };
  tabs.forEach(t => t.addEventListener('click', () => show(t.getAttribute('aria-controls'))));
  try { const s = localStorage.getItem('nomina-tab'); if (s && document.getElementById(s)) show(s); } catch (e) { /* ignore */ }
}
function initTheme() {
  const root = document.documentElement;
  try { const t = localStorage.getItem('nomina-theme'); if (t) root.dataset.theme = t; } catch (e) { /* ignore */ }
  $('#themeBtn').addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('nomina-theme', root.dataset.theme); } catch (e) { /* ignore */ }
  });
}

$('#chips').innerHTML = [
  ['SMMLV', money(P.SMMLV)], ['Auxilio transporte', money(P.AUX)], ['UVT', money(P.UVT)],
  ['Recargo dominical', '80 % → 90 % (1-jul)'], ['Jornada', '44 h → 42 h (15-jul)'], ['Nocturno', '7 p.m. – 6 a.m.'],
].map(([a, b]) => `<span class="chip">${a}: <b>${b}</b></span>`).join('');

initTheme(); initTabs(); initNomina(); initPrest(); initVac(); initLearn();
