import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      // Scoped to the one global stylesheet that actually needs Tailwind.
      // A blanket "*.css" rule also swallows *.module.css, and the loader
      // emits a plain stylesheet with no class-name exports — every
      // `styles.foo` in a component then resolves to undefined and the
      // section renders unstyled.
      "./src/app/globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
