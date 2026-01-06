import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',              // <-- statik export
  images: { unoptimized: true }, // next/image optimizer olmadan çalışsın
  // basePath veya assetPrefix kullanmıyorsan bunlara gerek yok
};

export default nextConfig;
