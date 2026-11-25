import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import ValuesStrip from '@/components/home/ValuesStrip';
import AboutPreview from '@/components/home/AboutPreview';
import ServiceTimes from '@/components/home/ServiceTimes';
import LeadershipPreview from '@/components/home/LeadershipPreview';
import EventsPreview from '@/components/home/EventsPreview';
import MinistriesPreview from '@/components/home/MinistriesPreview';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel';
import GivingBanner from '@/components/home/GivingBanner';

const HomePage = () => {
  return (
    <Layout>
      <HeroSection />
      <ValuesStrip />
      <AboutPreview />
      <ServiceTimes />
      <LeadershipPreview />
      <EventsPreview />
      <MinistriesPreview />
      <TestimonialsCarousel />
      <GivingBanner />
    </Layout>
  );
};

export default HomePage;
