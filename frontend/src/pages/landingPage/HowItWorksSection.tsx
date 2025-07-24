import React, { useEffect } from 'react';

const HowItWorksSection: React.FC = () => {
  useEffect(() => {
    const animatedItems = document.querySelectorAll('.step');
    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.1 });
    animatedItems.forEach(item => observer.observe(item));
    return () => {
      animatedItems.forEach(item => observer.unobserve(item));
    };
  }, []);

  return (
    <section id="how-it-works" className="how-it-works">
      <h2>How PayBridge Works</h2>
      <div className="steps-container">
        <div className="step">
          <i className="fas fa-file-signature fa-2x step-icon"></i>
          <h3>1. Agree & Deposit</h3>
          <p>Buyer and Seller agree on terms. The Buyer securely deposits the funds with PayBridge.</p>
        </div>
        <div className="step">
          <i className="fas fa-box-open fa-2x step-icon"></i>
          <h3>2. Transaction & Verification</h3>
          <p>The Seller completes the agreed-upon work. The Buyer verifies and confirms satisfaction.</p>
        </div>
        <div className="step">
          <i className="fas fa-circle-check fa-2x step-icon"></i>
          <h3>3. Funds Released</h3>
          <p>Upon Buyer's confirmation, PayBridge promptly releases the funds to the Seller.</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 