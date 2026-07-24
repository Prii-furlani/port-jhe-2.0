import React from 'react';
import { Link } from 'react-router-dom';

const Menu = () => {
  return (
    <nav style={{ padding: '1rem', backgroundColor: 'var(--primary-color)', color: '#fff' }}>
      <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem' }}>
        <li><Link to="/" style={{ color: '#fff' }}>Home</Link></li>
        <li><Link to="/admin" style={{ color: '#fff' }}>Admin Dashboard</Link></li>
      </ul>
    </nav>
  );
};

export default Menu;
