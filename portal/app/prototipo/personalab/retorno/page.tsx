import Link from 'next/link'
import { CORRIDAS, experiencia, capitulo, moderador, fecha } from '../dominio'
import { Titulo, Panel, Etiqueta, Vacio, th, td } from '../ui'

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

      <div
        style={{
          padding: '16px 18px',
          background: 'rgba(185,115,90,.07)',
          border: '1px solid rgba(185,115,90,.26)',
          borderRadius: 6,
          fontSize: 12.5,
          color: '#6F7777',
          lineHeight: 1.65,
          maxWidth: '72ch',
          marginBottom: 26,
        }}
      >
        Reglas de forma que este módulo no puede romper: un solo puntero al mes, nunca una racha,
        nunca un recordatorio de deuda. Lo escrito a mano no se sube ni se transcribe. Lo que se
        entrega se recibe, no se descarga. Y no hay pantalla de estadísticas, ni de racha, ni de
        compartir: esas tres no se construyen.
      </div>

      <Etiqueta>Acompañamientos en curso · {personas} personas</Etiqueta>
      {enCurso.length === 0 ? (
        <Vacio>Nada en retorno ahora mismo.</Vacio>
      ) : (
        <Panel pad={0}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...th, paddingLeft: 20 }}>Experiencia</th>
                  <th style={th}>Capítulo</th>
                  <th style={th}>Corrió</th>
                  <th style={th}>Personas</th>
                  <th style={{ ...th, paddingRight: 20 }}>Mes</th>
                </tr>
              </thead>
              <tbody>
                {enCurso.map(c => {
                  const e = experiencia(c.experienciaId)!
                  const cap = capitulo(c.capituloId)!
                  return (
                    <tr key={c.id}>
                      <td style={{ ...td, paddingLeft: 20 }}>
                        <Link
                          href={`/prototipo/personalab/corridas/${c.id}`}
                          style={{ color: '#002B34', textDecoration: 'none', fontWeight: 500 }}
                        >
                          {e.nombre}
                        </Link>
                      </td>
                      <td style={{ ...td, color: '#6F7777' }}>{cap.nombre}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{fecha(c.fecha)}</td>
                      <td style={{ ...td, fontVariantNumeric: 'tabular-nums' }}>{c.personasEnElForo}</td>
                      <td style={{ ...td, paddingRight: 20, fontVariantNumeric: 'tabular-nums' }}>
                        {c.mesDeRetorno} de 6
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <div style={{ marginTop: 30 }}>
        <Etiqueta>Lo que falta construir</Etiqueta>
        <Panel>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6F7777', lineHeight: 1.65 }}>
            Metamorfosis tiene sus tres bisagras de retorno sin diseñar. El Presente como Regalo
            corre hoy con dos, pero la capa mensual se está mandando a mano por correo.
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#14181B' }}>
            <li style={{ marginBottom: 6 }}>El gesto mínimo: capturar la frase de cada quien, en sus palabras.</li>
            <li style={{ marginBottom: 6 }}>Capa mensual: un puntero al mes, con techo de frecuencia como regla del sistema.</li>
            <li>Cierre a seis meses: ver la raíz completa. El testimonio lo entrega una persona, no el sistema.</li>
          </ul>
        </Panel>
      </div>
    </>
  )
}
