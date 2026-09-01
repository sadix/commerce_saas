// src/components/admin/PageMenuOrderManager.tsx
'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ShopPage {
  id: string;
  title: string;
  slug: string;
  weight: number;
  published: boolean;
  isHome: boolean;
}

interface PageMenuOrderManagerProps {
  shopId: string;
  initialPages: ShopPage[];
}

function SortablePageRow({ page }: { page: ShopPage }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  const t = useTranslations('admin.shop_pages.manager');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 border rounded-lg p-3 bg-white"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
        aria-label={`Reorder ${page.title}`}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{page.title}</p>
        <p className="text-sm text-gray-500 truncate">/{page.slug}</p>
      </div>

      <span
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
          page.published
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        {page.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        {page.published ? t('published') : t('draft')}
      </span>
    </div>
  );
}

export function PageMenuOrderManager({
  shopId,
  initialPages,
}: PageMenuOrderManagerProps) {
  const [pages, setPages] = useState<ShopPage[]>(
    [...initialPages].sort((a, b) => a.weight - b.weight)
  );
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const t = useTranslations('admin.shop_pages');

  const savingStateMessage = {
    saving: t('manager.saving_order'),
    saved: t('manager.saved'),
    error: t('manager.failed_to_save_order'),
  };

  const persistOrder = async (ordered: ShopPage[], previous: ShopPage[]) => {
    setSaveState('saving');
    try {
      const response = await fetch(`/api/shops/${shopId}/pages/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: ordered.map((p) => ({ id: p.id, weight: p.weight })),
        }),
      });

      if (!response.ok) throw new Error('Failed to save order');

      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1500);
    } catch (error) {
      console.error('Failed to save page order:', error);
      setPages(previous); // roll back optimistic reorder
      setSaveState('error');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const previous = pages;
    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(pages, oldIndex, newIndex).map((p, index) => ({
      ...p,
      weight: index,
    }));

    setPages(reordered);
    persistOrder(reordered, previous);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{t('manager.menu_order')}</h3>
        <div className="text-sm h-5 flex items-center gap-1">
          {saveState === 'saving' && (
            <span className="text-gray-500 flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {savingStateMessage.saving}
            </span>
          )}
          {saveState === 'saved' && (
            <span className="text-green-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {savingStateMessage.saved}
            </span>
          )}
          {saveState === 'error' && (
            <span className="text-red-600">{savingStateMessage.error}</span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        {t('manager.menu_order_description')}
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {pages.map((page) => (
              <SortablePageRow key={page.id} page={page} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {pages.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No pages yet</p>
      )}
    </div>
  );
}