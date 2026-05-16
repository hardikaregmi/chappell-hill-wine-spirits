import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import HeroSection from "../components/HeroSection";
import HomeSelection from "../components/HomeSelection";
import PhotoGallery from "../components/PhotoGallery";
import ContactSection from "../components/ContactSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <SiteHeader />

      <main>
        <HeroSection />

        <section id="selection" className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <HomeSelection />
          </div>
        </section>

        <section
          id="photos"
          className="border-t border-[color:var(--border)] py-8 md:py-10"
        >
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <PhotoGallery />
          </div>
        </section>

        <ContactSection />
      </main>

      <SiteFooter />
    </div>
  );
}
