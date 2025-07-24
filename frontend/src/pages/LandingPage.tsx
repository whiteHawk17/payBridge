import React from 'react';
import MainHeader from './landingPage/MainHeader';
import HeroSection from './landingPage/HeroSection';
import FeaturesSection from './landingPage/FeaturesSection';
import MainFooter from './landingPage/MainFooter';
import LoginSection from './landingPage/LoginSection';
import AboutUsSection from './landingPage/AboutUsSection';

const LandingPage: React.FC = () => {
  return (
    <>
      <MainHeader />
      <HeroSection />
      <FeaturesSection />
      <AboutUsSection/>
      <LoginSection />
      <MainFooter />
     
    </>
  );
};

export default LandingPage; 