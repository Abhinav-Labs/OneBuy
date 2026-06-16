import React from 'react';

export const Heading = ({ children, level = 1, className = '', ...props }) => {
  const Tag = `h${level}`;
  
  const sizes = {
    1: 'text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight',
    2: 'text-3xl sm:text-4xl font-bold tracking-tight',
    3: 'text-2xl sm:text-3xl font-semibold',
    4: 'text-xl sm:text-2xl font-semibold',
    5: 'text-lg sm:text-xl font-medium',
    6: 'text-base sm:text-lg font-medium',
  };

  return (
    <Tag className={`text-premium-dark ${sizes[level]} ${className}`} {...props}>
      {children}
    </Tag>
  );
};

export const Text = ({ children, variant = 'body', className = '', ...props }) => {
  const variants = {
    body: 'text-base text-gray-700 leading-relaxed',
    lead: 'text-lg sm:text-xl text-gray-600 leading-relaxed',
    small: 'text-sm text-gray-500',
    muted: 'text-base text-gray-500',
  };

  return (
    <p className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};
