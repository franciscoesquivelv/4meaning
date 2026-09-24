// EL LIENZO ANCHO DEL LECTOR REAL. Hasta hoy, leer en una laptop o un
// monitor era la misma columna de 620px que en el teléfono, con crema liso
// a los lados sin ninguna decisión detrás -- no era una reparación, era un
// vacío de diseño que nunca se tomó (Leo + Julian, 2026-09-23, plan en
// docs/PENDIENTES.md fila P-013).
//
// LA COLUMNA NO SE TOCA. Julian midió caracteres por línea contra el
// tamaño real del bloque `texto` (el que carga el volumen real de lectura,
// no `consigna`): 620px da 67 cpl con margen en los dos extremos del rango
// óptimo 45-75; 680px sube a 74, a un carácter del techo. El ancho se queda
// en 620px -- lo que cambia es lo que rodea esa columna, nunca la columna.
//
// POR QUÉ SOLO DESDE `lg:` (1024px), NUEVO EN TODO EL PORTAL. A 768px el
// margen junto a la columna es de 74px por lado, insuficiente para un blob
// sin tocar el texto. A 1024px es 202px por lado. `md:` ya gobierna
// tipografía y padding en estas pantallas; introducir el lienzo ahí lo
// mezclaría con una decisión que no es suya.
//
// EL CUARTETO YA EXISTÍA, NO SE INVENTÓ NADA. Es el mismo de
// `components/participante/MiRetiro.tsx` (la "aurora" de brand.css), nunca
// antes usado fuera de esa única cabecera. Se recalibra para fondo claro
// (`--paper`, no `--dom-deep`) e invierte el orden de dominancia: en
// PersonaLab manda teal (`--dom`, BRAND.md §4), no vino. Blur 120px, no 60:
// esto ambienta minutos de lectura, no una cabecera de tres segundos.
//
// LOS DOS ESTADOS SON DE SORA, LA FORMA ES DE JULIAN. Su regla: "se revela
// por apertura, no por logro" -- nada aquí puede depender de la posición en
// la secuencia ni de cuánto falta. Lo único que varía es el TIPO de bloque
// que se está leyendo ahora mismo. `consigna` (un gesto que pide algo de
// quien lee, a veces irreversible) dispara `pesoMayor`: el cambio es MENOS
// color, no más -- se retiran wine-2/terra/gold y solo queda teal-2, de 16%
// a 10%. Encender más color en un gesto así repetiría la misma jerarquía
// doble que Julian ya se prohibió tres veces (`consigna` ya carga su propio
// peso tipográfico). `gesto` y `pausa` quedan fuera: ya tienen su propio
// dispositivo.
//
// SIN ANIMACIÓN, A PROPÓSITO -- el estado se decide en el servidor antes de
// pintar, nunca cambia a mitad de lectura, así que no hay nada que animar.
//
// NIVEL DE CONFIANZA DECLARADO POR JULIAN: propuesto, no verificado en
// pantalla real al momento de escribir esto -- opacidades y posiciones
// verificadas visualmente por Claude al implementar, no solo calculadas.
export default function AtmosferaLectura({ pesoMayor = false }: { pesoMayor?: boolean }) {
  return (
    <div className="hidden lg:block fixed inset-[-20%] blur-[120px] pointer-events-none" aria-hidden="true">
      <span
        className="absolute w-[560px] h-[560px] rounded-full top-[10%] left-[4%]"
        style={{ background: 'radial-gradient(circle, var(--teal-2), transparent 70%)', opacity: pesoMayor ? 0.1 : 0.16 }}
      />
      {!pesoMayor && (
        <>
          <span
            className="absolute w-[480px] h-[480px] rounded-full bottom-[14%] right-[5%] opacity-[0.09]"
            style={{ background: 'radial-gradient(circle, var(--wine-2), transparent 70%)' }}
          />
          <span
            className="absolute w-[400px] h-[400px] rounded-full top-[42%] right-[2%] opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, var(--terra), transparent 68%)' }}
          />
          <span
            className="absolute w-[300px] h-[300px] rounded-full bottom-[6%] left-[9%] opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, var(--gold), transparent 72%)' }}
          />
        </>
      )}
    </div>
  )
}
