import { useState, useCallback, useEffect, useRef } from 'react';
import { EmailBlock, EmailBlockType, GlobalStyles, defaultGlobalStyles, blockDefinitions } from './types';
import { renderTemplateToHtml, generateId } from './utils';
import { BlockPalette } from './BlockPalette';
import { BlockEditor } from './BlockEditor';
import { PreviewPanel } from './PreviewPanel';
import { GlobalStylesEditor } from './GlobalStylesEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  ChevronUp, 
  ChevronDown,
  Palette,
  Layers,
  Eye,
  Settings,
  FileText
} from 'lucide-react';

interface EmailTemplateDesignerProps {
  initialTemplate?: {
    name: string;
    templateKey: string;
    subject: string;
    htmlContent: string;
    textContent: string | null;
    designerData?: string | null;
    type: string;
    variables: string[];
    isActive: boolean;
    blocks?: EmailBlock[];
    globalStyles?: GlobalStyles;
  } | null;
  onSave: (data: {
    name: string;
    templateKey: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    type: string;
    variables: string[];
    isActive: boolean;
    designerData: string;
  }) => void;
  isPending: boolean;
  isEditing: boolean;
}

export function EmailTemplateDesigner({ initialTemplate, onSave, isPending, isEditing }: EmailTemplateDesignerProps) {
  const initializedRef = useRef(false);
  const [name, setName] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('notification');
  const [isActive, setIsActive] = useState(true);
  const [blocks, setBlocks] = useState<EmailBlock[]>(getDefaultBlocks);
  const [globalStyles, setGlobalStyles] = useState<GlobalStyles>(defaultGlobalStyles);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'blocks' | 'style' | 'settings'>('blocks');

  useEffect(() => {
    if (!initializedRef.current && initialTemplate) {
      initializedRef.current = true;
      
      setName(initialTemplate.name || '');
      setTemplateKey(initialTemplate.templateKey || '');
      setSubject(initialTemplate.subject || '');
      setType(initialTemplate.type || 'notification');
      setIsActive(initialTemplate.isActive ?? true);
      setSelectedBlockId(null);
      
      if (initialTemplate.blocks && initialTemplate.blocks.length > 0) {
        setBlocks(initialTemplate.blocks);
        setGlobalStyles(initialTemplate.globalStyles || defaultGlobalStyles);
      } else if (initialTemplate.designerData) {
        const parsed = parseDesignerData(initialTemplate.designerData);
        setBlocks(parsed.blocks);
        setGlobalStyles(parsed.globalStyles || defaultGlobalStyles);
      } else {
        setBlocks(getDefaultBlocks());
        setGlobalStyles(defaultGlobalStyles);
      }
    }
  }, [initialTemplate]);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const addBlock = useCallback((type: EmailBlockType) => {
    const definition = blockDefinitions.find(d => d.type === type);
    if (!definition) return;

    const newBlock: EmailBlock = {
      id: generateId(),
      type,
      content: { ...definition.defaultContent },
      styles: { ...definition.defaultStyles },
    };

    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  }, []);

  const updateBlock = useCallback((updatedBlock: EmailBlock) => {
    setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId]);

  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const newBlocks = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      return newBlocks;
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('blockType') as EmailBlockType;
    const draggedId = e.dataTransfer.getData('blockId');

    if (blockType) {
      const definition = blockDefinitions.find(d => d.type === blockType);
      if (!definition) return;

      const newBlock: EmailBlock = {
        id: generateId(),
        type: blockType,
        content: { ...definition.defaultContent },
        styles: { ...definition.defaultStyles },
      };

      setBlocks(prev => {
        const newBlocks = [...prev];
        newBlocks.splice(targetIndex, 0, newBlock);
        return newBlocks;
      });
      setSelectedBlockId(newBlock.id);
    } else if (draggedId) {
      setBlocks(prev => {
        const currentIndex = prev.findIndex(b => b.id === draggedId);
        if (currentIndex === -1) return prev;

        const newBlocks = [...prev];
        const [removed] = newBlocks.splice(currentIndex, 1);
        const adjustedIndex = currentIndex < targetIndex ? targetIndex - 1 : targetIndex;
        newBlocks.splice(adjustedIndex, 0, removed);
        return newBlocks;
      });
    }
  }, []);

  const extractVariables = (html: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    let match;
    while ((match = regex.exec(html)) !== null) {
      variables.add(match[1].trim());
    }
    return Array.from(variables);
  };

  const handleSave = () => {
    const htmlContent = renderTemplateToHtml(blocks, globalStyles);
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const variables = extractVariables(htmlContent);
    const designerData = JSON.stringify({ blocks, globalStyles });

    onSave({
      name,
      templateKey,
      subject,
      htmlContent,
      textContent,
      type,
      variables,
      isActive,
      designerData,
    });
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Template Name"
              className="text-lg font-semibold h-10"
              data-testid="input-designer-name"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              data-testid="switch-designer-active"
            />
            <Label className="text-sm">Active</Label>
          </div>
          <Button onClick={handleSave} disabled={isPending || !name || !templateKey || !subject} data-testid="button-save-design">
            {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isEditing ? 'Update Template' : 'Save Template'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        <div className="col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-2">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="w-full">
                  <TabsTrigger value="blocks" className="flex-1" data-testid="tab-designer-blocks">
                    <Layers className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="style" className="flex-1" data-testid="tab-designer-style">
                    <Palette className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex-1" data-testid="tab-designer-settings">
                    <Settings className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-4 pt-0 h-[calc(100%-60px)] overflow-hidden">
              {activeTab === 'blocks' && <BlockPalette onAddBlock={addBlock} />}
              {activeTab === 'style' && (
                <GlobalStylesEditor styles={globalStyles} onChange={setGlobalStyles} />
              )}
              {activeTab === 'settings' && (
                <ScrollArea className="h-full">
                  <div className="space-y-4 pr-4">
                    <div className="space-y-2">
                      <Label>Template Key</Label>
                      <Input
                        value={templateKey}
                        onChange={(e) => setTemplateKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        placeholder="welcome_email"
                        disabled={isEditing}
                        data-testid="input-designer-key"
                      />
                      <p className="text-xs text-muted-foreground">Unique identifier for this template</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Subject Line</Label>
                      <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Welcome to {{company_name_text}}"
                        data-testid="input-designer-subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger data-testid="select-designer-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notification">Notification</SelectItem>
                          <SelectItem value="transactional">Transactional</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Layers
              </CardTitle>
              <CardDescription className="text-xs">Click to edit, drag to reorder</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-380px)]">
                <div className="p-2 space-y-1">
                  {blocks.length === 0 ? (
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, 0)}
                    >
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Drop blocks here</p>
                    </div>
                  ) : (
                    blocks.map((block, index) => {
                      const definition = blockDefinitions.find(d => d.type === block.type);
                      return (
                        <div
                          key={block.id}
                          className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedBlockId === block.id
                              ? 'bg-primary/10 border border-primary'
                              : 'hover:bg-muted border border-transparent'
                          }`}
                          onClick={() => setSelectedBlockId(block.id)}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('blockId', block.id);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, index)}
                          data-testid={`layer-block-${block.id}`}
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{definition?.label || block.type}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(block.id, 'up');
                              }}
                              disabled={index === 0}
                              data-testid={`button-move-up-${block.id}`}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(block.id, 'down');
                              }}
                              disabled={index === blocks.length - 1}
                              data-testid={`button-move-down-${block.id}`}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBlock(block.id);
                              }}
                              data-testid={`button-delete-layer-${block.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {selectedBlock && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <BlockEditor
                  block={selectedBlock}
                  onUpdate={updateBlock}
                  onDelete={() => deleteBlock(selectedBlock.id)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="col-span-6 min-h-0">
          <Card className="h-full overflow-hidden">
            <CardContent className="p-4 h-full">
              <PreviewPanel blocks={blocks} globalStyles={globalStyles} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function parseDesignerData(designerDataJson: string): { blocks: EmailBlock[]; globalStyles?: GlobalStyles } {
  if (!designerDataJson || typeof designerDataJson !== 'string') {
    return { blocks: getDefaultBlocks() };
  }
  
  try {
    const parsed = JSON.parse(designerDataJson);
    
    if (parsed && typeof parsed === 'object') {
      const blocks = Array.isArray(parsed.blocks) && parsed.blocks.length > 0 
        ? parsed.blocks 
        : getDefaultBlocks();
      
      const globalStyles = parsed.globalStyles && typeof parsed.globalStyles === 'object'
        ? parsed.globalStyles
        : undefined;
      
      return { blocks, globalStyles };
    }
  } catch (error) {
    console.warn('Failed to parse designer data:', error);
  }
  
  return { blocks: getDefaultBlocks() };
}

function getDefaultBlocks(): EmailBlock[] {
  return [
    {
      id: generateId(),
      type: 'header',
      content: {
        logo: '{{company_name}}',
        showLogo: true,
        tagline: 'Events & Decors',
      },
      styles: {
        backgroundColor: '#7c3aed',
        textColor: '#ffffff',
        padding: '24px',
        textAlign: 'center',
      },
    },
    {
      id: generateId(),
      type: 'text',
      content: {
        text: 'Hello {{recipient_name}},\n\nThank you for reaching out to us. We are excited to help you create your dream event.\n\nOur team will get back to you shortly with more information.',
      },
      styles: {
        backgroundColor: 'transparent',
        textColor: '#18181b',
        padding: '24px',
        textAlign: 'left',
        fontSize: '16px',
      },
    },
    {
      id: generateId(),
      type: 'button',
      content: {
        text: 'Visit Our Website',
        link: '{{company_website}}',
      },
      styles: {
        backgroundColor: '#7c3aed',
        textColor: '#ffffff',
        padding: '24px',
        textAlign: 'center',
        borderRadius: '8px',
      },
    },
    {
      id: generateId(),
      type: 'footer',
      content: {
        companyName: '{{company_name_text}}',
        address: '{{company_address}}',
        email: '{{company_email}}',
        phone: '{{company_phone}}',
        copyright: '© {{current_year}} All rights reserved.',
      },
      styles: {
        backgroundColor: '#27272a',
        textColor: '#a1a1aa',
        padding: '32px 24px',
        textAlign: 'center',
        fontSize: '12px',
      },
    },
  ];
}
