import React from 'react';
import {useThemeSettings} from '@/theme-settings';

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
  const { colors , shape, components, typography} = useThemeSettings ();
  return (
    <section className="py-16 bg-gray-50"  style={{backgroundColor:colors.surface}}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color:colors.primary, fontFamily:typography.fontDisplay, fontWeight:typography.fontWeightDisplay}}>{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow text-center" style={{borderRadius:shape.radiusSmall, borderColor:colors.border}}>
              <h3 className="text-xl font-semibold mb-2" style={{ color:colors.primary, fontFamily:typography.fontDisplay, fontWeight:typography.fontWeightDisplay}}>{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}