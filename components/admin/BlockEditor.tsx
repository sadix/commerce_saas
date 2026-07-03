'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import {useTranslations} from 'next-intl';


export interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
}

interface BlockEditorProps {
  initialBlocks: Block[];
  onSave: (blocks: Block[]) => void;
  availableBlocks: Array<{ type: string; label: string; defaultProps: Record<string, any> }>;
  shopId: string;
}

export function BlockEditor({ initialBlocks, onSave, availableBlocks, shopId }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const t = useTranslations('admin.shop_pages.manager.block_editor_modal');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
    activationConstraint: {
      delay: 300, // Hold for 300ms to start drag
      tolerance: 8, // Allow 8px movement during the delay
    },
  }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addBlock = (type: string) => {
    const blockConfig = availableBlocks.find((b) => b.type === type);
    if (!blockConfig) return;

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      props: { ...blockConfig.defaultProps },
    };

    setBlocks([...blocks, newBlock]);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  const updateBlockProps = (id: string, props: Record<string, any>) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, props: { ...block.props, ...props } } : block
      )
    );
  };

  return (
    <div className="flex  gap-4 flex-col md:flex-row">
      {/* Block List */}
      <div className="md:w-2/3 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Page Blocks</h2>
          <button
            onClick={() => onSave(blocks)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
           {t('save_changes')}
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                isSelected={selectedBlock === block.id}
                onSelect={() => setSelectedBlock(block.id)}
                onDelete={() => deleteBlock(block.id)}
              
              />
            ))}
          </SortableContext>
        </DndContext>

        {blocks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {t('no_blocks_yet')} 
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="md:w-1/3 space-y-4">
        {/* Add Block Panel */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3"> {t('add_block')} </h3>
          <div className="space-y-2">
            {availableBlocks.map((blockType) => (
              <button
                key={blockType.type}
                onClick={() => addBlock(blockType.type)}
                className="w-full flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
                {blockType.label}
              </button>
            ))}
          </div>
        </div>

        {/* Block Properties Panel */}
        {selectedBlock && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold mb-3"> {t('block_properties_label')} </h3>
            <BlockPropertiesEditor
              block={blocks.find((b) => b.id === selectedBlock)!}
              onUpdate={(props) => updateBlockProps(selectedBlock, props)}
              shopId={shopId}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
}: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none' 
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 p-4 border-2 rounded ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex-1">
          <div className="font-medium">{block.type}</div>
          <div className="text-sm text-gray-500">
            {Object.keys(block.props).length} properties
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-red-500 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function BlockPropertiesEditor({
  block,
  onUpdate,
  shopId
}: {
  block: Block;
  onUpdate: (props: Record<string, any>) => void;
  shopId:string;
}) {
  
  const handleChange = (key: string, value: any) => {
    if(key === 'backgroundImage' && value instanceof File) {
      const reader = new FileReader(); 
      reader.onload = (e) => {
        onUpdate({ [key]: e.target?.result });
      };
      reader.readAsDataURL(value);
    }
    else {
      onUpdate({ [key]: value });
    }
  };


  const handleArrayChange = (key: string, index: number, field: string, value: any) => {
    const array = [...(block.props[key] || [])];
    array[index] = { ...array[index], [field]: value };
    onUpdate({ [key]: array });
  };

  const addArrayItem = (key: string) => {
    const array = [...(block.props[key] || [])];
    if (key === 'features') {
      array.push({ title: 'New Feature', description: 'Description' });
    }
    onUpdate({ [key]: array });
  };

  const removeArrayItem = (key: string, index: number) => {
    const array = [...(block.props[key] || [])];
    array.splice(index, 1);
    onUpdate({ [key]: array });
  };

  const getShopCollections = async (shopId: string) => {
    try {
      const response = await fetch(`/api/shops/${shopId}/categories`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch collections');
        return [];
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      return [];
    }
  };

  const [collections, setCollections] = useState<any[]>([]);

  // Fetch collections when shopId changes 
  useEffect(() => {
    const fetchCollections = async () => {
      if (shopId) {
        const data = await getShopCollections(shopId);
        setCollections(data);
      }
    };

    fetchCollections();
  }, [shopId]);

  return (
    <div className="space-y-3">
      <>{console.log(block.props)}</> 
      {Object.entries(block.props).map(([key, value]) => (
        
        <div key={key}>
          <label className="block text-sm font-medium mb-1 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          {typeof value === 'boolean' ? (
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(key, e.target.checked)}
              className="rounded"
            />
          ) : typeof value === 'number' ? (
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(key, parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded"
            />
          ) : typeof value === 'object' ? (
            <textarea
              value={JSON.stringify(value, null, 2)}
              onChange={(e) => handleChange(key, JSON.parse(e.target.value))}
              className="w-full px-3 py-2 border rounded"
            />
          ): (typeof value === 'string') && key === 'backgroundImage' ? (
            <div>

              <input type="file"  accept="image/png, image/jpeg" onChange={(e) => handleChange(key, e.target.files?.[0])} />

              {value && (
                <div>
                  <h3>Preview:</h3>
                  {/* Display the image using the Base64 string as the source */}
                  <img src={value} alt="Uploaded preview" style={{ maxWidth: '50px', marginTop: '10px' }} />
                  
                </div>
              )}
            </div>
          ) : 
           key === 'shopId' ? (null)
          : typeof value === 'boolean' ? (
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(key, e.target.checked)}
              className="rounded"
            />
          ) : key === "layout" ? (
            <select
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
          ) : key === 'columns' ? (
            <select
                value={value}
                onChange={(e) => handleChange(key, parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
              </select>
          ) : key === 'collectionId' ? (
            <select
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-3 py-2 border rounded"
              > 
                <option key='all' value="all">
                   All collections
                  </option>

                {collections.map((coll) => (
                  <option key={coll.id} value={coll.id}>
                    {coll.name}
                  </option>
                ))}
                
                
              </select>
          ) : Array.isArray(value) ? (
            <div className="space-y-2">
              <button
                  onClick={() => addArrayItem(key)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  + Add Item
                </button>
              {value.map((item: any, index: number) => (
                <div key={index} className="p-3 border rounded bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-gray-600">Item {index + 1}</span>
                      <button
                        onClick={() => removeArrayItem(key, index)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    {Object.entries(item).map(([field, fieldValue]) => (
                      <div key={field} className="mb-2">
                        <label className="block text-xs text-gray-600 mb-1 capitalize">
                          {field}
                        </label>
                        <input
                          type="text"
                          value={fieldValue as string}
                          onChange={(e) => handleArrayChange(key, index, field, e.target.value)}
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                      </div>
                    ))}
                  </div>
                ))}
                </div>
                
          )
          : (
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          )}
        </div>
      ))}
    </div>
  );
}