import React from 'react';
import { Link } from 'react-router-dom';

const MainFooter: React.FC = () => (
  <footer className="main-footer-bottom">
    <p>&copy; 2025 PayBridge. All Rights Reserved.</p>
    <ul className="footer-links">
      <li><a href="#">Terms of Service</a></li>
      <li><a href="#">Privacy Policy</a></li>
      <li><Link to="/contact">Contact Us</Link></li>
    </ul>
  </footer>
);

export default MainFooter; 