import React from "react";

interface ZephyraLogoProps {
  className?: string;
  size?: number;
}

export const ZephyraLogo: React.FC<ZephyraLogoProps> = ({ className, size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="zephyra-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
      
      {/* Stylized Z with waves and arrow */}
      <path
        d="M25 25 C 25 15, 65 15, 75 25 L 75 30 L 35 70 L 75 70 C 85 70, 85 85, 75 85 L 25 85 C 15 85, 15 70, 25 70 L 65 30 L 25 30 C 15 30, 15 15, 25 25 Z"
        fill="url(#zephyra-gradient)"
        opacity="0.2"
      />
      
      {/* Main Z shape with fluid curves - refined to match reference */}
      <path
        d="M25 25 
           C 25 20, 40 15, 55 15 
           C 75 15, 85 25, 85 35 
           C 85 45, 75 50, 65 55 
           L 45 75 
           C 40 80, 50 85, 65 85 
           H 80 
           C 90 85, 90 95, 80 95 
           H 25 
           C 15 95, 10 85, 20 75 
           L 55 35 
           C 60 30, 50 25, 40 25 
           C 30 25, 20 30, 20 40 
           C 20 50, 30 55, 40 55"
        fill="url(#zephyra-gradient)"
      />
      
      {/* Integrated Arrow Head (part of the gradient) */}
      <path
        d="M55 35 L 45 40 L 50 30 Z"
        fill="url(#zephyra-gradient)"
      />
      
      {/* Wave element 1 */}
      <path
        d="M15 45 C 30 35, 50 55, 65 45 C 80 35, 90 45, 95 40"
        stroke="url(#zephyra-gradient)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Wave element 2 */}
      <path
        d="M10 55 C 25 45, 45 65, 60 55 C 75 45, 85 55, 90 50"
        stroke="url(#zephyra-gradient)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
