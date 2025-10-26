
import React from 'react';

interface CardProps {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200">
          <h3 className="text-xl font-display font-semibold leading-6 text-brand-dark">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;