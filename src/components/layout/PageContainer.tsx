
import React from 'react';

interface PageContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  title, 
  description,
  children 
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-2 text-gray-600">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};

export default PageContainer;
