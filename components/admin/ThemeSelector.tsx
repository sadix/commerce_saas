'use client';

import { useState } from 'react';
import { Theme } from '@prisma/client';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
  shopId: string;
  themes: Theme[];
  currentThemeId?: string | null;
}

export function ThemeSelector({ shopId, themes, currentThemeId }: ThemeSelectorProps) {
  const [selectedThemeId, setSelectedThemeId] = useState(currentThemeId);
  const [loading, setLoading] = useState(false);

  const handleThemeChange = async (themeId: string) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/shops/${shopId}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId }),
      });

      if (response.ok) {
        setSelectedThemeId(themeId);
        alert('Theme updated successfully!');
      } else {
        alert('Failed to update theme');
      }
    } catch (error) {
      console.error('Theme update error:', error);
      alert('Failed to update theme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Select Theme</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => {
          const isSelected = theme.id === selectedThemeId;
          
          return (
            <div
              key={theme.id}
              className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => !loading && handleThemeChange(theme.id)}
            >
              {/* Theme Preview */}
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {theme.thumbnail ? (
                  <img
                    src={theme.thumbnail}
                    alt={theme.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">Preview</div>
                )}
              </div>

              {/* Theme Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{theme.name}</h3>
                    {theme.description && (
                      <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
                    )}
                  </div>
                  
                  {isSelected && (
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Loading Overlay */}
              {loading && theme.id === selectedThemeId && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <div className="text-gray-600">Applying...</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {themes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No themes available yet.
        </div>
      )}
    </div>
  );
}