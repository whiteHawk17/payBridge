import React, { useEffect } from 'react';

const AboutUsSection: React.FC = () => {
  useEffect(() => {
    const animatedItems = document.querySelectorAll('.team-member');
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
    <section id="about-us" className="about-us">
      <h2>Meet the Team</h2>
      <p className="section-subtitle">The minds behind PayBridge, dedicated to making your transactions secure.</p>
      <div className="team-container">
        <div className="team-member">
          <h3 className="member-name">Aaditya Mathur</h3>
          <div className="member-contact">
            <p><i className="fas fa-envelope"></i><a href="mailto:aadityamathur1077@gmail.com">aadityamathur1077@gmail.com</a></p>
            <p><i className="fas fa-phone"></i><a href="tel:+918826019356">+91 8826019356</a></p>
          </div>
        </div>
        <div className="team-member">
          <h3 className="member-name">Vinay</h3>
          <div className="member-contact">
            <p><i className="fas fa-envelope"></i><a href="mailto:vini17102005@gmail.com">vini17102005@gmail.com</a></p>
            <p><i className="fas fa-phone"></i><a href="tel:+918949716631">+91 8949716631</a></p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection; 