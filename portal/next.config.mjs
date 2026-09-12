/** @type {import('next').NextConfig} */
const nextConfig = {
  // EL NAVEGADOR NO PUEDE GUARDARSE LO QUE ESTA APP DICE. Next 14.2 guarda
  // en el cliente la respuesta de una ruta dinámica durante 30 segundos y la
  // reusa al navegar hacia atrás. Aquí eso no es una optimización, es una
  // mentira: encontrado y reproducido el 2026-09-12 (hallazgo de Leo,
  // confirmado en el deploy real). Quien abría una bisagra con pausa por
  // primera vez, seguía, y volvía con "Anterior" antes de 30 segundos,
  // encontraba la espera OTRA VEZ sobre algo ya leído. Eso es exactamente lo
  // que Sora llamó cerco: "se vuelve cerco el día que vuelva a correr cuando
  // alguien regresa".
  //
  // El mismo cacheo afecta al índice: volver a él dentro de la ventana podía
  // enseñar el recorrido de hace medio minuto. En un portal donde cada
  // pantalla depende de dónde va esa persona en concreto, servir medio
  // minuto de pasado nunca vale lo que cuesta.
  //
  // El precio, dicho: volver atrás pide al servidor otra vez en vez de
  // pintarse al instante. Con pantallas de este tamaño, es un precio que ni
  // se nota.
  experimental: {
    staleTimes: { dynamic: 0 },
  },
  async redirects() {
    return [
      // /dashboard se llama /hoy. La palabra importa: "dashboard" nombra un
      // formato y no dice cuando mirarlo; "hoy" nombra el momento, que es lo
      // unico que esa pantalla contesta. El destino no cambio, solo el
      // nombre, asi que un enlace viejo tiene que seguir llegando.
      { source: '/dashboard', destination: '/hoy', permanent: false },
    ];
  },
};

export default nextConfig;
