# Neue Haas Unica W1G

The app now loads the brand font from the Typekit kit linked in
`src/app/layout.tsx`, under the family name `neue-haas-unica`. That is what
`--font-heading` / `--font-body` in `../WhyATB.module.css` resolve to, so
**no font files are needed in this directory**.

The `@font-face` rules that used to sit at the top of `../WhyATB.module.css`
pointed at `NeueHaasUnicaW1G-*.woff2` files that were never committed (the
font is licensed). That was harmless in the standalone
`../../../why-atb-demo.html`, where a missing `url()` is just a 404 — but
Turbopack resolves `url()` at compile time, so it broke the Next build
outright. The rules have been removed; the demo HTML still carries its own
copy and still falls back to Manrope.

One thing to re-check now that the real font is loading: the USP sub-copy is
capped at `515px` to keep every entry at exactly two lines, and that cap was
tuned against the Manrope fallback. Line-wrapping is metric-dependent, so the
value may want nudging — the usable window is roughly 440–700px.
