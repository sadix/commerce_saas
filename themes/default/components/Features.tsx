import React from 'react';

interface FeaturesProps {
  title?: string;
  features?: Array<{ title: string; description: string; icon?: string }>;
}

export default function Features({
  title = 'Why Choose Us',
  features = [
    { title: 'Fast Shipping', description: 'Get your orders quickly' },
    { title: 'Quality Products', description: 'Premium quality guaranteed' },
    { title: 'Great Support', description: '24/7 customer service' },
  ],
}: FeaturesProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}