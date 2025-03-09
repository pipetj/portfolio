/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/portfolio', // Chemin local que votre frontend utilisera
        destination: 'https://portfolio-spring-boot-backend.onrender.com/portfolio', // URL de votre backend
      },
    ];
  },
};

export default nextConfig;