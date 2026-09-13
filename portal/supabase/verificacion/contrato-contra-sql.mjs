// ============================================================
// EL CONTRATO DE BLOQUE CONTRA EL SQL QUE LO GOBIERNA
//
// NO CAMBIA NADA. Lee `lib/personalab/bloques.ts` y las migraciones, y dice
// si discrepan. Se corre con:
//
//     node supabase/verificacion/contrato-contra-sql.mjs
//
// POR QUÉ EXISTE. El contrato de bloque dice ser la fuente única de qué es un
// bloque, y no lo es del todo: el enum `pl_tipo_bloque` y el constraint
// `blocks_contenido_por_tipo` siguen escritos a mano en SQL, y son los únicos
// que rechazan datos malos en tiempo de ejecución. TypeScript no rechaza nada
// en producción. Daniel lo señaló así: hay dos contratos y el autoritativo es
// el otro.
//
// La prueba de que la discrepancia no es hipotética es `audio`: se agregó al
// enum y al constraint el 11 de septiembre de 2026, y el código no se enteró
// durante dos días. Un bloque de audio publicado se pintaba como nada.
//
// POR QUÉ ASÍ Y NO GENERANDO EL SQL. Generar el constraint desde el contrato
// invierte la autoridad: dejaría que una edición de TypeScript afloje lo que
// protege la base en vivo. El SQL manda; esto solo comprueba que el código
// sepa lo que el SQL dice. Decisión de Hugo.
//
// LO QUE NO ALCANZA A VER, dicho sin maquillar: compara el contrato contra el
// TEXTO de las migraciones, no contra la base desplegada. Si alguien tocó el
// esquema a mano en el editor de Supabase, esto no se entera. Esa mitad la
// cubre `enum-y-constraint-de-bloques.sql`, que se pega en el editor de SQL.

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from 'sucrase'

const AQUI = dirname(fileURLToPath(import.meta.url))
const PORTAL = join(AQUI, '..', '..')
const MIGRACIONES = join(PORTAL, 'supabase', 'migrations')

// ── El contrato, cargado de verdad y no leído con expresiones regulares ──
const ts = readFileSync(join(PORTAL, 'lib', 'personalab', 'bloques.ts'), 'utf8')
const js = transform(ts, { transforms: ['typescript', 'imports'] }).code
const modulo = {}
new Function('exports', 'module', 'require', js)(modulo, { exports: modulo }, () => {
  throw new Error('El contrato no debería importar nada.')
})
const CONTRATO = modulo.CONTRATO

// ── El SQL, en orden de archivo, que es el orden en que corre ──
const sql = readdirSync(MIGRACIONES)
  .filter(f => f.endsWith('.sql'))
  .sort()
  .map(f => readFileSync(join(MIGRACIONES, f), 'utf8'))
  .join('\n')

// Los valores del enum: la declaración inicial más cada `add value`.
const decl = sql.match(/create type (?:public\.)?pl_tipo_bloque as enum\s*\(([\s\S]*?)\)/i)
if (!decl) fallar('No encontré la declaración de `pl_tipo_bloque` en las migraciones.')
const enumSql = new Set([...decl[1].matchAll(/'([a-z_]+)'/g)].map(m => m[1]))
for (const m of sql.matchAll(/alter type (?:public\.)?pl_tipo_bloque add value(?: if not exists)? '([a-z_]+)'/gi)) {
  enumSql.add(m[1])
}

// La ÚLTIMA definición del constraint es la que queda en pie.
const defs = [...sql.matchAll(/add constraint blocks_contenido_por_tipo check \(([\s\S]*?)\n\);/g)]
if (!defs.length) fallar('No encontré `blocks_contenido_por_tipo` en las migraciones.')
const cuerpo = defs[defs.length - 1][1]

// Cada rama del `case`, con los tipos que cubre y lo que exige.
//
// Se parte por `when` en vez de resolverlo con una sola expresión regular, y
// no es preferencia de estilo: la rama de video y audio ocupa dos líneas, y
// una expresión que cruzara saltos de línea se tragaba los `when` siguientes
// y le atribuía a `pausa` lo que exigía `archivo`. La primera versión de este
// comprobador reportó once discrepancias falsas por eso. Un verificador que
// miente es peor que no tenerlo.
const hastaElse = cuerpo.split(/\belse\b/)[0]
const expresionElse = (cuerpo.split(/\belse\b/)[1] ?? '').split(/\bend\b/)[0].trim()

const ramas = hastaElse
  .split(/\bwhen\b/)
  .slice(1)
  .map(trozo => {
    const [condicion, ...resto] = trozo.split(/\bthen\b/)
    return {
      tipos: [...condicion.matchAll(/'([a-z_]+)'/g)].map(x => x[1]),
      exige: resto.join('then').trim(),
    }
  })
  .filter(r => r.tipos.length > 0)

const ramaDe = t => ramas.find(r => r.tipos.includes(t))

// ── La comparación ──
const problemas = []

for (const t of enumSql) {
  if (!(t in CONTRATO)) problemas.push(`'${t}' está en el enum de la base y no en el contrato.`)
}
for (const t of Object.keys(CONTRATO)) {
  if (!enumSql.has(t)) problemas.push(`'${t}' está en el contrato y no en el enum de la base.`)
}

for (const t of Object.keys(CONTRATO)) {
  if (!enumSql.has(t)) continue
  const rama = ramaDe(t)
  // Sin rama propia cae en el `else`, leído del SQL y no supuesto.
  const exige = rama ? rama.exige : expresionElse
  const pideMedio = /media_id is not null/.test(exige)
  const admiteUrl = /coalesce\(contenido->>'url'/.test(exige)

  const def = CONTRATO[t]
  if (pideMedio && !def.medio) {
    problemas.push(`'${t}': el constraint exige media_id y el contrato no declara \`medio\`.`)
  }
  if (!pideMedio && def.medio) {
    problemas.push(`'${t}': el contrato declara \`medio\` y el constraint no pide media_id.`)
  }
  if (def.medio && def.medio.admiteUrl !== admiteUrl) {
    problemas.push(
      `'${t}': contrato admiteUrl=${def.medio.admiteUrl}, constraint admite url=${admiteUrl}.`
    )
  }
  if (!pideMedio && !admiteUrl) {
    // Cae en el `else` o en una rama de texto: el contrato tiene que tener un
    // campo `texto` que impida publicar vacío, o la base rechazará el insert.
    const exigeTexto = /contenido->>'texto'/.test(exige)
    const campoTexto = def.campos && def.campos.texto
    if (exigeTexto && (!campoTexto || campoTexto.exigencia !== 'impide')) {
      problemas.push(
        `'${t}': el constraint exige texto no vacío y el contrato no lo declara como 'impide'.`
      )
    }
  }
}

function fallar(msg) {
  console.error('FALLO: ' + msg)
  process.exit(2)
}

if (problemas.length) {
  console.error(`El contrato y el SQL discrepan en ${problemas.length}:`)
  for (const p of problemas) console.error('  - ' + p)
  process.exit(1)
}

console.log(`OK: contrato y SQL coinciden. ${enumSql.size} tipos de bloque.`)
