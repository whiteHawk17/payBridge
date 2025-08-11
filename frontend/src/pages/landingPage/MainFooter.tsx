import React from 'react';
import { Link } from 'react-router-dom';

const MainFooter: React.FC = () => (
  <footer className="main-footer-bottom">
    <p>&copy; 2025 PayBridge. All Rights Reserved.</p>
    <ul className="footer-links">
      <li><Link to="/terms">Terms of Service</Link></li>
      <li><Link to="/privacy">Privacy Policy</Link></li>
      <li><Link to="/refund-policy">Refund Policy</Link></li>
      <li><Link to="/contact">Contact Us</Link></li>
    </ul>
  </footer>
);

export default MainFooter; 