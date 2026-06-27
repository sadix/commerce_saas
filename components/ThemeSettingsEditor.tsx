// src/components/ThemeSettingsEditor.tsx
// Render this in the shop admin dashboard.
// It reads the current resolved settings, shows editable controls,
// and calls onSave(overrides) with only the changed values.

'use client';

import React, { useState, useCallback } from 'react';
import type { ThemeOverrides, ButtonStyle, HeroLayout } from '../types/theme-settings';
import { resolveThemeSettings } from '../lib/theme-utils';
import { getThemeDefaults } from '../types/theme-defaults';

interface ThemeSettingsEditorProps {
  themeId: string;
  /** The tenant's currently saved overrides (from DB) */
  savedOverrides: ThemeOverrides;
  /** Called with the new overrides when the tenant saves */
  onSave: (overrides: ThemeOverrides) => Promise<void>;
  /** Show a live preview pane alongside the editor */
  showPreview?: boolean;
}

// ─── Small reusable controls ─────────────────────────────────────────────────

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-1">
      <span className="block text-sm font-medium text-gray-800">{label}</span>
      {hint && <span className="block text-xs text-gray-500">{hint}</span>}
    </div>
  );
}

function ColorInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-14 cursor-pointer rounded border border-gray-300 bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function SelectInput({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
      />
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-gray-200 pb-3 mb-5">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
  );
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export function ThemeSettingsEditor({
  themeId,
  savedOverrides,
  onSave,
  showPreview = false,
}: ThemeSettingsEditorProps) {
  const themeDefaults = getThemeDefaults(themeId);
  // Start from the fully resolved settings so inputs always show a real value
  const resolved = resolveThemeSettings(themeDefaults, savedOverrides);

  // Local editable state — starts from resolved, user changes flow here
  const [draft, setDraft] = useState(resolved);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ─── Patch helpers ────────────────────────────────────────────────────────
  const setColor = useCallback((key: keyof typeof draft.colors, val: string) => {
    setDraft((d) => ({ ...d, colors: { ...d.colors, [key]: val } }));
  }, []);

  const setTypography = useCallback((key: keyof typeof draft.typography, val: string | number) => {
    setDraft((d) => ({ ...d, typography: { ...d.typography, [key]: val } }));
  }, []);

  const setShape = useCallback((key: keyof typeof draft.shape, val: string) => {
    setDraft((d) => ({ ...d, shape: { ...d.shape, [key]: val } }));
  }, []);

  const setComponents = useCallback((key: keyof typeof draft.components, val: string | boolean) => {
    setDraft((d) => ({ ...d, components: { ...d.components, [key]: val } }));
  }, []);

  // ─── Compute minimal diff to save (only changed keys) ────────────────────
  function computeOverrides(): ThemeOverrides {
    const base = resolveThemeSettings(themeDefaults);
    const overrides: ThemeOverrides = {};

    // Colors
    for (const k in draft.colors) {
      const key = k as keyof typeof draft.colors;
      if (draft.colors[key] !== base.colors[key]) {
        overrides.colors = overrides.colors ?? {};
        (overrides.colors as any)[key] = draft.colors[key];
      }
    }

    // Typography
    for (const k in draft.typography) {
      const key = k as keyof typeof draft.typography;
      if (draft.typography[key] !== base.typography[key]) {
        overrides.typography = overrides.typography ?? {};
        (overrides.typography as any)[key] = draft.typography[key];
      }
    }

    // Shape
    for (const k in draft.shape) {
      const key = k as keyof typeof draft.shape;
      if (draft.shape[key] !== base.shape[key]) {
        overrides.shape = overrides.shape ?? {};
        (overrides.shape as any)[key] = draft.shape[key];
      }
    }

    // Components
    for (const k in draft.components) {
      const key = k as keyof typeof draft.components;
      if (draft.components[key] !== base.components[key]) {
        overrides.components = overrides.components ?? {};
        (overrides.components as any)[key] = draft.components[key];
      }
    }

    return overrides;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(computeOverrides());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraft(resolveThemeSettings(themeDefaults, {}));
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={`flex gap-8 ${showPreview ? 'flex-row' : 'flex-col'}`}>
      {/* Editor panel */}
      <div className="flex-1 min-w-0 space-y-8">

        {/* Colors */}
        <section>
          <SectionHeader
            title="Colors"
            description="Core palette used across all components"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorInput label="Primary" hint="Buttons, links" value={draft.colors.primary} onChange={(v) => setColor('primary', v)} />
            <ColorInput label="Primary Text" hint="Text on primary bg" value={draft.colors.primaryForeground} onChange={(v) => setColor('primaryForeground', v)} />
            <ColorInput label="Secondary" hint="Badges, accents" value={draft.colors.secondary} onChange={(v) => setColor('secondary', v)} />
            <ColorInput label="Accent" hint="Sale tags, alerts" value={draft.colors.accent} onChange={(v) => setColor('accent', v)} />
            <ColorInput label="Background" value={draft.colors.background} onChange={(v) => setColor('background', v)} />
            <ColorInput label="Surface" hint="Cards, sidebars" value={draft.colors.surface} onChange={(v) => setColor('surface', v)} />
            <ColorInput label="Text" value={draft.colors.text} onChange={(v) => setColor('text', v)} />
            <ColorInput label="Muted Text" hint="Captions, placeholders" value={draft.colors.textMuted} onChange={(v) => setColor('textMuted', v)} />
            <ColorInput label="Border" value={draft.colors.border} onChange={(v) => setColor('border', v)} />
          </div>
        </section>

        {/* Typography */}
        <section>
          <SectionHeader
            title="Typography"
            description="Use any Google Fonts name, or a system font stack"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextInput
              label="Display Font"
              hint="Headings and hero text"
              value={draft.typography.fontDisplay}
              onChange={(v) => setTypography('fontDisplay', v)}
              placeholder="'Playfair Display', Georgia, serif"
            />
            <TextInput
              label="Body Font"
              hint="Paragraphs, labels, nav"
              value={draft.typography.fontBody}
              onChange={(v) => setTypography('fontBody', v)}
              placeholder="'Inter', system-ui, sans-serif"
            />
            <SelectInput
              label="Display Weight"
              value={String(draft.typography.fontWeightDisplay)}
              options={[
                { value: '300', label: 'Light (300)' },
                { value: '400', label: 'Regular (400)' },
                { value: '500', label: 'Medium (500)' },
                { value: '600', label: 'Semibold (600)' },
                { value: '700', label: 'Bold (700)' },
                { value: '800', label: 'Extrabold (800)' },
                { value: '900', label: 'Black (900)' },
              ]}
              onChange={(v) => setTypography('fontWeightDisplay', Number(v))}
            />
            <TextInput
              label="Letter Spacing (Headings)"
              hint="e.g. -0.02em, 0.1em"
              value={draft.typography.letterSpacingDisplay}
              onChange={(v) => setTypography('letterSpacingDisplay', v)}
              placeholder="-0.02em"
            />
          </div>
        </section>

        {/* Shape */}
        <section>
          <SectionHeader
            title="Shape"
            description="Border radius scale — 0 for sharp, larger values for rounded"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <TextInput label="Small" hint="Tags, chips" value={draft.shape.radiusSmall} onChange={(v) => setShape('radiusSmall', v)} placeholder="0.25rem" />
            <TextInput label="Medium" hint="Cards, buttons" value={draft.shape.radiusMedium} onChange={(v) => setShape('radiusMedium', v)} placeholder="0.5rem" />
            <TextInput label="Large" hint="Modals" value={draft.shape.radiusLarge} onChange={(v) => setShape('radiusLarge', v)} placeholder="1rem" />
            <TextInput label="Full" hint="Pills" value={draft.shape.radiusFull} onChange={(v) => setShape('radiusFull', v)} placeholder="9999px" />
          </div>
        </section>

        {/* Components */}
        <section>
          <SectionHeader
            title="Style"
            description="Layout and component style preferences"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SelectInput
              label="Button Style"
              value={draft.components.buttonStyle}
              options={[
                { value: 'filled', label: 'Filled — solid background' },
                { value: 'outline', label: 'Outline — border only' },
                { value: 'ghost', label: 'Ghost — no border or fill' },
              ]}
              onChange={(v) => setComponents('buttonStyle', v as ButtonStyle)}
            />
            <SelectInput
              label="Hero Layout"
              value={draft.components.heroLayout}
              options={[
                { value: 'centered', label: 'Centered — text in the middle' },
                { value: 'split', label: 'Split — text left, image right' },
                { value: 'fullbleed', label: 'Full bleed — text over image' },
              ]}
              onChange={(v) => setComponents('heroLayout', v as HeroLayout)}
            />
            <div className="sm:col-span-2">
              <TextInput
                label="Announcement Bar Text"
                hint="Leave empty to use the theme default"
                value={draft.components.announcementText}
                onChange={(v) => setComponents('announcementText', v)}
                placeholder="e.g. Free shipping on orders over $50"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showAnnouncement"
                checked={draft.components.showAnnouncementBar}
                onChange={(e) => setComponents('showAnnouncementBar', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <label htmlFor="showAnnouncement" className="text-sm text-gray-800">
                Show announcement bar
              </label>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Reset to Theme Defaults
          </button>
        </div>
      </div>

      {/* Live preview pane (optional) */}
      {showPreview && (
        <aside className="w-80 flex-shrink-0">
          <div className="sticky top-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Live Preview</p>
            <div
              className="border rounded-xl overflow-hidden shadow-lg"
              style={{
                background: draft.colors.background,
                color: draft.colors.text,
                fontFamily: draft.typography.fontBody,
                borderColor: draft.colors.border,
              }}
            >
              {/* Mini header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b text-sm font-medium"
                style={{ borderColor: draft.colors.border }}
              >
                <span style={{ fontFamily: draft.typography.fontDisplay, fontWeight: draft.typography.fontWeightDisplay }}>
                  Your Store
                </span>
                <span className="text-xs" style={{ color: draft.colors.textMuted }}>Cart (0)</span>
              </div>

              {/* Mini hero */}
              <div
                className="px-4 py-6"
                style={{ background: draft.colors.surface }}
              >
                <p className="text-xs mb-1" style={{ color: draft.colors.secondary }}>New Arrivals</p>
                <h2
                  className="text-xl mb-2"
                  style={{
                    fontFamily: draft.typography.fontDisplay,
                    fontWeight: draft.typography.fontWeightDisplay,
                    letterSpacing: draft.typography.letterSpacingDisplay,
                    color: draft.colors.text,
                  }}
                >
                  Welcome to the Store
                </h2>
                <p className="text-xs mb-4" style={{ color: draft.colors.textMuted }}>
                  Browse our latest collection.
                </p>
                <button
                  className="px-4 py-2 text-xs font-semibold transition"
                  style={{
                    background: draft.components.buttonStyle === 'filled' ? draft.colors.primary : 'transparent',
                    color: draft.components.buttonStyle === 'filled' ? draft.colors.primaryForeground : draft.colors.primary,
                    border: draft.components.buttonStyle !== 'ghost' ? `2px solid ${draft.colors.primary}` : 'none',
                    borderRadius: draft.shape.radiusMedium,
                  }}
                >
                  Shop Now
                </button>
              </div>

              {/* Mini product card */}
              <div className="px-4 py-4">
                <div
                  className="rounded overflow-hidden border"
                  style={{ borderColor: draft.colors.border, borderRadius: draft.shape.radiusMedium }}
                >
                  <div
                    className="h-20 flex items-center justify-center text-2xl"
                    style={{ background: draft.colors.surface }}
                  >
                    🛍️
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold mb-1" style={{ color: draft.colors.text }}>Sample Product</p>
                    <p className="text-xs mb-2" style={{ color: draft.colors.textMuted }}>$49.00</p>
                    <button
                      className="w-full py-1.5 text-xs font-semibold"
                      style={{
                        background: draft.components.buttonStyle === 'filled' ? draft.colors.primary : 'transparent',
                        color: draft.components.buttonStyle === 'filled' ? draft.colors.primaryForeground : draft.colors.primary,
                        border: draft.components.buttonStyle !== 'ghost' ? `1.5px solid ${draft.colors.primary}` : 'none',
                        borderRadius: draft.shape.radiusMedium,
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Accent badge example */}
              <div className="px-4 pb-4 flex gap-2">
                <span
                  className="inline-block px-2 py-0.5 text-xs font-bold text-white"
                  style={{ background: draft.colors.accent, borderRadius: draft.shape.radiusSmall }}
                >
                  SALE
                </span>
                <span
                  className="inline-block px-2 py-0.5 text-xs font-bold text-white"
                  style={{ background: draft.colors.secondary, borderRadius: draft.shape.radiusSmall }}
                >
                  NEW
                </span>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}