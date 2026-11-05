import type { Metadata } from "next";
import CTABanner from "../../../components/CTABanner";

export const metadata: Metadata = {
  title: "CTA banner — ATB",
};

/* The CTA banner on its own, without the nav or neighbouring sections, for
   reviewing it in isolation. Same component as the home page.

   Pinned to the top of the viewport. #111 sits behind the rounded top
   corners (the banner's top colour, so the corners disappear), and the rest
   of the page is light grey (grey-100) so it's obvious where the section
   ends. */
export default function CTABannerPage() {
  return (
    <main
      className="flex flex-col flex-1"
      style={{
        background:
          "linear-gradient(#111111, #111111) top / 100% 64px no-repeat, var(--colour-grey-100)",
      }}
    >
      <CTABanner />
    </main>
  );
}
