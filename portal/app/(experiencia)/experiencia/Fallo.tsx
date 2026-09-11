// LA PANTALLA QUE FALTABA EN TODO EL PORTAL.
//
// Durante meses, cuando una consulta fallaba, el portal decía "no hay nada".
// La pantalla de Entregas anunció "no hay familias registradas" sobre un
// evento con cuatro, y la de Equipo le prometió a una pareja unos
// facilitadores que no iban a aparecer nunca. Las dos veces el código
// descartaba el error y el vacío se pintaba como si fuera cierto.
//
// Aquí el fallo tiene pantalla propia desde el primer día. Y sigue la regla
// que Sora firmó como doctrina de tono: al equipo se le da el motivo técnico,
// a la persona no. Quien está atravesando una experiencia no puede hacer nada
// con un mensaje de Postgres, y leerlo solo le confirma que algo se rompió
// del lado de adentro.

export default function Fallo({ motivo }: { motivo: string }) {
  // El motivo no se pinta, se registra. Queda en los registros del servidor,
  // que es donde alguien puede hacer algo con él.
  console.error('[lectura] la consulta falló:', motivo)

  return (
    <main className="max-w-[520px] mx-auto px-6 py-24">
      <div className="cejilla">PersonaLab</div>
      <h1 className="display text-[30px] md:text-[36px] text-dom mt-3">
        No pudimos cargar esto ahora
      </h1>
      <p className="mt-5 text-[16px] leading-[1.6] font-light text-ink/90">
        No es que no haya nada: es que algo falló de nuestro lado al ir a
        buscarlo. No perdiste nada y no tienes que hacer nada.
      </p>
      <p className="mt-4 text-[15px] leading-[1.6] text-gray-ui">
        Vuelve a intentarlo en un rato. Si sigue pasando, escríbenos.
      </p>
    </main>
  )
}
