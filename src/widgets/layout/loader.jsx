import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;

// Simple inline loader for buttons
export const ButtonLoader = ({ color = '#039155', size = 20, thickness = 3 }) => {
  const dimension = `${size}px`;
  const borderWidth = `${thickness}px`;
  return (
    <span
      className="inline-block align-middle animate-spin rounded-full"
      style={{
        width: dimension,
        height: dimension,
        borderTopColor: color,
        borderRightColor: 'transparent',
        borderBottomColor: color,
        borderLeftColor: 'transparent',
        borderStyle: 'solid',
        borderWidth: borderWidth,
      }}
      aria-label="loading"
    />
  );
};
