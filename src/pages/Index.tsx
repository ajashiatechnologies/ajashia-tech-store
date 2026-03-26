import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Categories } from "@/components/home/Categories";
import SeyalBanner from "@/components/home/Seyalbanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main>
        <HeroSection />
        <SeyalBanner />
        <Categories />
        <FeaturedProducts />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
