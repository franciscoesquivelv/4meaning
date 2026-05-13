'use client'

import { useState } from 'react'

const FAQ: Record<string, { q: string; a: string }[]> = {
  'mi-retiro': [
    { q: '¿Por qué no veo la información completa?', a: 'Algunos detalles se activan progresivamente durante el retiro. Si falta algo urgente, contacta a tu coordinadora.' },
    { q: '¿Cómo contacto al equipo?', a: 'En la sección "Equipo" encontrarás los datos de contacto de tu coordinadora.' },
    { q: '¿Dónde veo mis acuerdos?', a: 'Toca el ícono de acuerdos en el menú inferior. Ahí podrás firmarlos y ver su estado.' },
  ],
  'programa': [
    { q: '¿Por qué no veo el programa completo?', a: 'El programa completo se publica aproximadamente 7 días antes del retiro. Por ahora verás la estructura general.' },
    { q: '¿Puedo compartir el programa?', a: 'El programa es confidencial y solo para participantes registrados. Por favor no lo compartas.' },
    { q: '¿Qué pasa si llego tarde a una sesión?', a: 'Informa a tu coordinadora con anticipación. El equipo hará lo posible para integrarte sin interrumpir al grupo.' },
  ],
  'acuerdos': [
    { q: '¿Es obligatorio firmar?', a: 'Sí, todos los acuerdos deben firmarse antes del inicio del retiro para que tu lugar quede confirmado.' },
    { q: '¿Qué pasa después de firmar?', a: 'El acuerdo pasa a revisión del coordinador. Cuando lo apruebe, verás el estado como "Aprobado".' },
    { q: '¿Puedo firmar desde mi celular?', a: 'Sí, el proceso de firma está optimizado para celular. Solo toca el botón "Firmar acuerdo".' },
  ],
  'formulario': [
    { q: '¿Pueden ver mis respuestas otras familias?', a: 'No. Tus respuestas son completamente privadas y solo las ve el facilitador del retiro.' },
    { q: '¿Qué pasa si no termino ahora?', a: 'Puedes guardar y continuar después. Tu progreso se guarda automáticamente al pasar de sección.' },
    { q: '¿Es obligatorio llenar todo?', a: 'Te recomendamos contestar todo — entre más información tenga el facilitador, más personalizado será tu retiro.' },
  ],
  'equipo': [
    { q: '¿Cómo contacto a mi coordinadora?', a: 'Encuentra su número de WhatsApp o email en su tarjeta. También puedes escribir al número de emergencias del evento.' },
    { q: '¿Quién es el facilitador?', a: 'El facilitador principal es quien guía todas las sesiones del retiro. Su perfil incluye su formación y experiencia.' },
  ],
  'compromisos': [
    { q: '¿Cuándo puedo ver esta sección?', a: 'Los compromisos se activan al terminar el retiro. Durante los 90 días siguientes pueden registrar su avance aquí.' },
    { q: '¿Los dos podemos marcar compromisos?', a: 'Sí, cualquiera de los dos con acceso a la cuenta puede actualizar el estado de los compromisos.' },
    { q: '¿Qué pasa si no cumplimos un compromiso?', a: 'No hay consecuencias — los compromisos son un regalo que se hacen a ustedes mismos. Lo importante es la intención.' },
  ],
  'default': [
    { q: '¿Cómo contacto al equipo Trascendencia?', a: 'Escribe a tu coordinadora directamente o revisa la sección "Equipo" para sus datos de contacto.' },
    { q: '¿Cómo cierro sesión?', a: 'En la pantalla principal (Mi Retiro) hay un botón de "Cerrar sesión" arriba a la derecha.' },
  ],
}

interface HelpButtonProps {
  pageId: string
}

export default function HelpButton({ pageId }: HelpButtonProps) {
  const [open, setOpen] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const items = FAQ[pageId] ?? FAQ['default']

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Ayuda"
        className="fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#C9A96E]/40 text-[#C9A96E] text-sm font-bold flex items-center justify-center shadow-lg hover:border-[#C9A96E]/70 transition-colors"
      >
        ?
      </button>

      {/* Backdrop + bottom sheet */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#111] rounded-t-2xl border-t border-[#C9A96E]/20 px-5 pt-5 pb-10 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#C9A96E]">
                Preguntas frecuentes
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#F5F0E8] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Accordion items */}
            <div className="space-y-2">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="border border-white/10 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                    className="w-full text-left px-4 py-4 flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-[#F5F0E8] font-medium leading-snug">{item.q}</span>
                    <span className={`text-[#C9A96E] transition-transform duration-200 shrink-0 ${expandedIndex === i ? 'rotate-180' : ''}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>
                  {expandedIndex === i && (
                    <div className="px-4 pb-4 text-sm text-[#B0A898] leading-relaxed border-t border-white/5 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
