import React from 'react';
import AnimatedHero from '../components/home/AnimatedHero';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CategoriesSection from '../components/home/CategoriesSection';
import ShopByDuration from '../components/home/ShopByDuration';
import SpecialOffers from '../components/home/SpecialOffers';
import TestimonialsSection from '../components/home/TestimonialsSection';
import InstagramSection from '../components/home/InstagramSection';
import NewsletterCTA from '../components/home/NewsletterCTA';

export default function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <AnimatedHero />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Categories */}
      <CategoriesSection />

      {/* Shop by Duration */}
      <ShopByDuration />

      {/* Special Offers */}
      <SpecialOffers />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Instagram Gallery */}
      <InstagramSection />

      {/* Newsletter */}
      <NewsletterCTA />
    </div>
  );
}

