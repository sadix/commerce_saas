import React from 'react';

interface FooterProps {
  shopData: { name: string };
  copyrightText?: string;
}

export default function Footer({ shopData, copyrightText }: FooterProps) {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p>{copyrightText || `© ${year} ${shopData.name}. All rights reserved.`}</p>
      </div>
    </footer>
  );
}