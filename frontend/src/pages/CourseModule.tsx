import React from 'react';
import { useParams } from 'react-router-dom';

export const CourseModule: React.FC = () => {
  const { moduleId } = useParams();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Course Module {moduleId}</h1>
      <p>This module is under construction.</p>
    </div>
  );
};
