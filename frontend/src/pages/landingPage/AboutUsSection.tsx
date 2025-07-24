import React, { useEffect, useMemo } from 'react';

const teamMembers = [
  {
    name: "Aaditya Mathur",
    email: "aadityamathur1077@gmail.com",
    phone: "+918826019356"
  },
  {
    name: "Vinay Jangra",
    email: "vini17102005@gmail.com",
    phone: "+918949716631"
  }
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

  // Shuffle only once per mount
  const shuffledTeam = useMemo(() => shuffleArray(teamMembers), []);

  return (
    <section id="about-us" className="about-us">
      <h2>Meet the Team</h2>
      <p className="section-subtitle">The minds behind PayBridge, dedicated to making your transactions secure.</p>
      <div className="team-container">
        {shuffledTeam.map(member => (
          <div className="team-member" key={member.email}>
            <h3 className="member-name">{member.name}</h3>
            <div className="member-contact">
              <p><i className="fas fa-envelope"></i><a href={`mailto:${member.email}`}>{member.email}</a></p>
              <p><i className="fas fa-phone"></i><a href={`tel:${member.phone}`}>+91 {member.phone.slice(-10)}</a></p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutUsSection; 