import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-premium-accent text-white hover:brightness-110 focus:ring-premium-accent',
    outline: 'border-2 border-premium-accent text-premium-accent hover:bg-premium-accent hover:text-white focus:ring-premium-accent',
    ghost: 'text-premium-accent hover:bg-gray-100 focus:ring-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button 
      
      
      className={classes}
      {...props}>
      {children}
    </button>
  );
};

export default Button;
