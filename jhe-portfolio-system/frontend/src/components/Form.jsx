import React from 'react';

const Form = ({ onSubmit, children, className = '' }) => {
  return (
    <form onSubmit={onSubmit} className={`form-container ${className}`}>
      {children}
    </form>
  );
};

export default Form;
