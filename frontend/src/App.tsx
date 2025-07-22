import React from 'react';
import './App.css';
import MainHeader from './components/MainHeader';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import FeaturesSection from './components/FeaturesSection';
import AboutUsSection from './components/AboutUsSection';
import LoginSection from './components/LoginSection';
import MainFooter from './components/MainFooter';

function App() {
  return (
    <div className="main-container">
      <MainHeader />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <AboutUsSection />
      <LoginSection />
      <MainFooter />
    </div>
  );
}

export default App;
