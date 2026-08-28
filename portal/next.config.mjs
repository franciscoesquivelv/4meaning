/** @type {import('next').NextConfig} */
const nextConfig = {
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
