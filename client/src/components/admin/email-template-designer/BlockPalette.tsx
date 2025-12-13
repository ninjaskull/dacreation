import { blockDefinitions, EmailBlockType } from './types';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Image, 
  Type, 
  MousePointerClick, 
  Columns, 
  Minus, 
  MoveVertical, 
  MessageSquare, 
  List, 
  Megaphone, 
  Share2 
} from 'lucide-react';

interface BlockPaletteProps {
  onAddBlock: (type: EmailBlockType) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'layout-dashboard': LayoutDashboard,
  'image': Image,
  'type': Type,
  'mouse-pointer-click': MousePointerClick,
  'columns': Columns,
  'minus': Minus,
  'move-vertical': MoveVertical,
  'message-square': MessageSquare,
  'list': List,
  'megaphone': Megaphone,
  'share-2': Share2,
};

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  const categories = [
    { key: 'structure', label: 'Structure' },
    { key: 'content', label: 'Content' },
    { key: 'media', label: 'Media' },
    { key: 'action', label: 'Actions' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Email Blocks</h3>
      <p className="text-xs text-muted-foreground">Click or drag blocks to add them to your email</p>
      
      <ScrollArea className="h-[500px]">
        <div className="space-y-6 pr-4">
          {categories.map((category) => {
            const categoryBlocks = blockDefinitions.filter(b => b.category === category.key);
            if (categoryBlocks.length === 0) return null;
            
            return (
              <div key={category.key} className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {category.label}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {categoryBlocks.map((block) => {
                    const IconComponent = iconMap[block.icon] || LayoutDashboard;
                    return (
                      <Card
                        key={block.type}
                        className="p-3 cursor-pointer hover:bg-muted transition-colors border-dashed"
                        onClick={() => onAddBlock(block.type)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('blockType', block.type);
                        }}
                        data-testid={`block-palette-${block.type}`}
                      >
                        <div className="flex flex-col items-center gap-2 text-center">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                          <span className="text-xs font-medium">{block.label}</span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
