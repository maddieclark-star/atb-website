import type { Metadata } from "next";
import CTABanner from "../../../components/CTABanner";

export const metadata: Metadata = {
  title: "CTA banner — ATB",
};

/* The CTA banner on its own, without the nav or neighbouring sections, for
   reviewing it in isolation. Same component as the home page. */
export default function CTABannerPage() {
  return (
    <main className="flex flex-col flex-1 justify-center">
      <CTABanner />
    </main>
  );
}
