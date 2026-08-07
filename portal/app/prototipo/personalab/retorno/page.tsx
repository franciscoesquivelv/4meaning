import Link from 'next/link'
import { CORRIDAS, experiencia, capitulo, fecha } from '../dominio'
import { Titulo, Tabla, Explicativo, Vacio, Etiqueta, Panel } from '../ui'
import { TD } from '../tokens'

export default function RetornoPage() {
  const enCurso = CORRIDAS
    .filter(c => c.estado === 'corrida' && (c.mesDeRetorno ?? 0) < 6)
    .sort((a, b) => (b.mesDeRetorno ?? 0) - (a.mesDeRetorno ?? 0))
  const personas = enCurso.reduce((s, c) => s + c.personasEnElForo, 0)

  return (
    <>
      <Titulo sub="Lo que sostiene después de la corrida. Es donde el software es indispensable y no cómodo, y donde hoy PersonaLab no tiene nada construido.">
        Retorno
      </Titulo>

      <Explicativo titulo="Reglas de forma que este módulo no puede romper">
        Un solo puntero al mes, nunca una racha, nunca un recordatorio de deuda. Lo escrito a mano no se
        sube ni se transcribe. Lo que se entrega se recibe, no se descarga. Y no hay pantalla de
        estadísticas, ni de racha, ni de compartir: esas tres no se construyen.
      </Explicativo>

      <Etiqueta>Acompañamientos en curso · {personas} personas</Etiqueta>
      {enCurso.length === 0 ? (
        <Vacio>Nada en retorno ahora mismo.</Vacio>
      ) : (
        <Tabla cabeceras={['Experiencia', 'Capítulo', 'Corrió', 'Personas', 'Mes']}>
          {enCurso.map(c => (
            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
              <td className={TD}>
                <Link
                  href={`/prototipo/personalab/corridas/${c.id}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {experiencia(c.experienciaId)!.nombre}
                </Link>
              </td>
              <td className={`${TD} text-slate-500`}>{capitulo(c.capituloId)!.nombre}</td>
              <td className={`${TD} whitespace-nowrap`}>{fecha(c.fecha)}</td>
              <td className={`${TD} tabular-nums`}>{c.personasEnElForo}</td>
              <td className={`${TD} tabular-nums`}>{c.mesDeRetorno} de 6</td>
            </tr>
          ))}
        </Tabla>
      )}

      <div className="mt-8">
        <Etiqueta>Lo que falta construir</Etiqueta>
        <Panel>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Metamorfosis tiene sus tres bisagras de retorno sin diseñar. El Presente como Regalo corre hoy
            con dos, pero la capa mensual se está mandando a mano por correo.
          </p>
          <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
            <li>El gesto mínimo: capturar la frase de cada quien, en sus palabras.</li>
            <li>Capa mensual: un puntero al mes, con techo de frecuencia como regla del sistema.</li>
            <li>Cierre a seis meses: ver la raíz completa. El testimonio lo entrega una persona, no el sistema.</li>
          </ul>
        </Panel>
      </div>
    </>
  )
}
