import Nav from '@/components/home/Nav';
import Hero from '@/components/home/Hero';
import MarqueeBand from '@/components/home/MarqueeBand';
import HowItWorks from '@/components/home/HowItWorks';
import Factors from '@/components/home/Factors';
import TypeGallery from '@/components/home/TypeGallery';
import Stats from '@/components/home/Stats';
import CtaBottom from '@/components/home/CtaBottom';
import Footer from '@/components/home/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <MarqueeBand />
      <HowItWorks />
      <Factors />
      <TypeGallery />
      <Stats />
      <CtaBottom />
      <Footer />
    </>
  );
}
