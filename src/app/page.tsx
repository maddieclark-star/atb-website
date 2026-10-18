import PrimaryNav from "../../components/Navigation";
import Hero from "../../components/Hero";
import USPSection from "../../components/USPSection";
import WhyATB from "../../components/WhyATB";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <PrimaryNav />
      <main className="flex flex-col flex-1">
        <Hero />
        <USPSection />
        <WhyATB />
      </main>
    </div>
  );
}
