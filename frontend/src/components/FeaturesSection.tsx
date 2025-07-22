import React, { useEffect } from 'react';

const FeaturesSection: React.FC = () => {
  useEffect(() => {
    const animatedItems = document.querySelectorAll('.feature-item');
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
    <section id="features" className="features">
      <h2>A Foundation of Trust</h2>
      <div className="feature-grid">
        <div className="feature-item">
          <i className="fas fa-lock feature-icon"></i>
          <h4>Secure Transactions</h4>
          <p>Your funds are protected using advanced encryption.</p>
        </div>
        <div className="feature-item">
          <i className="fas fa-balance-scale feature-icon"></i>
          <h4>Fair Dispute Resolution</h4>
          <p>We offer a fair and impartial process for resolving any disputes.</p>
        </div>
        <div className="feature-item">
          <i className="fas fa-headset feature-icon"></i>
          <h4>Dedicated Support</h4>
          <p>Our support team is always ready to assist you.</p>
        </div>
        <div className="feature-item">
          <i className="fas fa-shield-alt feature-icon"></i>
          <h4>Verified Users</h4>
          <p>Enhancing trust through user verification processes.</p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 