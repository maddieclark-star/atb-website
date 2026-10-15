# Neue Haas Unica W1G

The `@font-face` rules at the top of `../WhyATB.module.css` (and in
`../../../why-atb-demo.html`) expect these files in this directory:

| File | Weight | Used by |
| --- | --- | --- |
| `NeueHaasUnicaW1G-Heavy.woff2` | 800 | headline, USP titles, USP numbers |
| `NeueHaasUnicaW1G-Medium.woff2` | 500 | USP sub-copy |

`.woff` fallbacks are also declared and will be picked up if present.

Until the files are added the stack falls back to Manrope (Figma's own
declared fallback) and then the system sans-serif. Layout holds at that
fallback, but line-wrapping is metric-dependent — in particular the USP
sub-copy is capped at `515px` to keep every entry at exactly two lines, and
that cap was tuned against the fallback. Re-check the wrap once the real
font is in: the usable window is roughly 440–700px, so there is headroom,
but the value may want nudging.

The font is licensed, so the files are deliberately not committed.
