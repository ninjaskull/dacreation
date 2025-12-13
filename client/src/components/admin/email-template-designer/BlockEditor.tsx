import { useState } from 'react';
import { EmailBlock, blockDefinitions, templateVariables } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2, Plus, Variable, Palette, Settings2 } from 'lucide-react';

interface BlockEditorProps {
  block: EmailBlock;
  onUpdate: (block: EmailBlock) => void;
  onDelete: () => void;
}

export function BlockEditor({ block, onUpdate, onDelete }: BlockEditorProps) {
  const definition = blockDefinitions.find(d => d.type === block.type);
  
  const updateContent = (key: string, value: any) => {
    onUpdate({
      ...block,
      content: { ...block.content, [key]: value },
    });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdate({
      ...block,
      styles: { ...block.styles, [key]: value },
    });
  };

  const insertVariable = (variable: string, targetField: string) => {
    const currentValue = block.content[targetField] || '';
    updateContent(targetField, currentValue + `{{${variable}}}`);
  };

  const VariableButton = ({ targetField }: { targetField: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8" data-testid={`button-insert-variable-${targetField}`}>
          <Variable className="h-3 w-3 mr-1" />
          Insert Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <ScrollArea className="h-60">
          <div className="space-y-1">
            {templateVariables.map((v) => (
              <button
                key={v.key}
                onClick={() => insertVariable(v.key, targetField)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-muted text-sm"
                data-testid={`variable-${v.key}`}
              >
                <span className="font-mono text-xs text-primary">{`{{${v.key}}}`}</span>
                <span className="block text-xs text-muted-foreground">{v.label}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );

  const renderContentEditor = () => {
    switch (block.type) {
      case 'header':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Show Logo</Label>
              <Switch
                checked={block.content.showLogo}
                onCheckedChange={(checked) => updateContent('showLogo', checked)}
                data-testid="switch-show-logo"
              />
            </div>
            {block.content.showLogo && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Logo</Label>
                  <VariableButton targetField="logo" />
                </div>
                <Input
                  value={block.content.logo || ''}
                  onChange={(e) => updateContent('logo', e.target.value)}
                  placeholder="{{company_logo_white}}"
                  data-testid="input-header-logo"
                />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tagline (Optional)</Label>
                <VariableButton targetField="tagline" />
              </div>
              <Input
                value={block.content.tagline || ''}
                onChange={(e) => updateContent('tagline', e.target.value)}
                placeholder="Your company tagline"
                data-testid="input-header-tagline"
              />
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Title</Label>
                <VariableButton targetField="title" />
              </div>
              <Input
                value={block.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Welcome!"
                data-testid="input-hero-title"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Subtitle</Label>
                <VariableButton targetField="subtitle" />
              </div>
              <Input
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent('subtitle', e.target.value)}
                placeholder="We're excited to have you"
                data-testid="input-hero-subtitle"
              />
            </div>
            <div className="space-y-2">
              <Label>Background Image URL (Optional)</Label>
              <Input
                value={block.content.backgroundImage || ''}
                onChange={(e) => updateContent('backgroundImage', e.target.value)}
                placeholder="https://example.com/image.jpg"
                data-testid="input-hero-bg-image"
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Text Content</Label>
                <VariableButton targetField="text" />
              </div>
              <Textarea
                value={block.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Enter your text content here..."
                className="min-h-[150px]"
                data-testid="textarea-block-text"
              />
              <p className="text-xs text-muted-foreground">Use double line breaks for new paragraphs</p>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={block.content.src || ''}
                onChange={(e) => updateContent('src', e.target.value)}
                placeholder="https://example.com/image.jpg"
                data-testid="input-image-src"
              />
            </div>
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                value={block.content.alt || ''}
                onChange={(e) => updateContent('alt', e.target.value)}
                placeholder="Image description"
                data-testid="input-image-alt"
              />
            </div>
            <div className="space-y-2">
              <Label>Link URL (Optional)</Label>
              <Input
                value={block.content.link || ''}
                onChange={(e) => updateContent('link', e.target.value)}
                placeholder="https://example.com"
                data-testid="input-image-link"
              />
            </div>
            <div className="space-y-2">
              <Label>Width</Label>
              <Select
                value={block.content.width || '100%'}
                onValueChange={(value) => updateContent('width', value)}
              >
                <SelectTrigger data-testid="select-image-width">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100%">Full Width</SelectItem>
                  <SelectItem value="75%">75%</SelectItem>
                  <SelectItem value="50%">50%</SelectItem>
                  <SelectItem value="300px">300px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Button Text</Label>
                <VariableButton targetField="text" />
              </div>
              <Input
                value={block.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Click Here"
                data-testid="input-button-text"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Link URL</Label>
                <VariableButton targetField="link" />
              </div>
              <Input
                value={block.content.link || ''}
                onChange={(e) => updateContent('link', e.target.value)}
                placeholder="{{company_website}}"
                data-testid="input-button-link"
              />
            </div>
          </div>
        );

      case 'columns':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Left Column</Label>
                <VariableButton targetField="leftContent" />
              </div>
              <Textarea
                value={block.content.leftContent || ''}
                onChange={(e) => updateContent('leftContent', e.target.value)}
                placeholder="Left column content"
                className="min-h-[100px]"
                data-testid="textarea-left-column"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Right Column</Label>
                <VariableButton targetField="rightContent" />
              </div>
              <Textarea
                value={block.content.rightContent || ''}
                onChange={(e) => updateContent('rightContent', e.target.value)}
                placeholder="Right column content"
                className="min-h-[100px]"
                data-testid="textarea-right-column"
              />
            </div>
          </div>
        );

      case 'divider':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Style</Label>
              <Select
                value={block.content.style || 'solid'}
                onValueChange={(value) => updateContent('style', value)}
              >
                <SelectTrigger data-testid="select-divider-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={block.content.color || '#e4e4e7'}
                onChange={(e) => updateContent('color', e.target.value)}
                className="h-10"
                data-testid="input-divider-color"
              />
            </div>
            <div className="space-y-2">
              <Label>Thickness</Label>
              <Select
                value={block.content.thickness || '1px'}
                onValueChange={(value) => updateContent('thickness', value)}
              >
                <SelectTrigger data-testid="select-divider-thickness">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1px">Thin (1px)</SelectItem>
                  <SelectItem value="2px">Medium (2px)</SelectItem>
                  <SelectItem value="3px">Thick (3px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Height</Label>
              <Select
                value={block.content.height || '32px'}
                onValueChange={(value) => updateContent('height', value)}
              >
                <SelectTrigger data-testid="select-spacer-height">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16px">Small (16px)</SelectItem>
                  <SelectItem value="32px">Medium (32px)</SelectItem>
                  <SelectItem value="48px">Large (48px)</SelectItem>
                  <SelectItem value="64px">Extra Large (64px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'callout':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Icon Type</Label>
              <Select
                value={block.content.icon || 'info'}
                onValueChange={(value) => updateContent('icon', value)}
              >
                <SelectTrigger data-testid="select-callout-icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">ℹ️ Info</SelectItem>
                  <SelectItem value="warning">⚠️ Warning</SelectItem>
                  <SelectItem value="success">✅ Success</SelectItem>
                  <SelectItem value="error">❌ Error</SelectItem>
                  <SelectItem value="tip">💡 Tip</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title (Optional)</Label>
              <Input
                value={block.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Important Notice"
                data-testid="input-callout-title"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Message</Label>
                <VariableButton targetField="message" />
              </div>
              <Textarea
                value={block.content.message || ''}
                onChange={(e) => updateContent('message', e.target.value)}
                placeholder="Your message here..."
                className="min-h-[80px]"
                data-testid="textarea-callout-message"
              />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>List Style</Label>
              <Select
                value={block.content.listStyle || 'bullet'}
                onValueChange={(value) => updateContent('listStyle', value)}
              >
                <SelectTrigger data-testid="select-list-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bullet">Bullet Points</SelectItem>
                  <SelectItem value="number">Numbered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>List Items</Label>
              {(block.content.items || []).map((item: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(block.content.items || [])];
                      newItems[index] = e.target.value;
                      updateContent('items', newItems);
                    }}
                    placeholder={`Item ${index + 1}`}
                    data-testid={`input-list-item-${index}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newItems = (block.content.items || []).filter((_: any, i: number) => i !== index);
                      updateContent('items', newItems);
                    }}
                    data-testid={`button-remove-item-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newItems = [...(block.content.items || []), ''];
                  updateContent('items', newItems);
                }}
                data-testid="button-add-list-item"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        );

      case 'cta-banner':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Title</Label>
                <VariableButton targetField="title" />
              </div>
              <Input
                value={block.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Ready to get started?"
                data-testid="input-cta-title"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Subtitle</Label>
                <VariableButton targetField="subtitle" />
              </div>
              <Input
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent('subtitle', e.target.value)}
                placeholder="Contact us today"
                data-testid="input-cta-subtitle"
              />
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={block.content.buttonText || ''}
                onChange={(e) => updateContent('buttonText', e.target.value)}
                placeholder="Get Started"
                data-testid="input-cta-button-text"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Button Link</Label>
                <VariableButton targetField="buttonLink" />
              </div>
              <Input
                value={block.content.buttonLink || ''}
                onChange={(e) => updateContent('buttonLink', e.target.value)}
                placeholder="{{company_website}}"
                data-testid="input-cta-button-link"
              />
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input
                value={block.content.facebook || ''}
                onChange={(e) => updateContent('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                data-testid="input-social-facebook"
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter/X URL</Label>
              <Input
                value={block.content.twitter || ''}
                onChange={(e) => updateContent('twitter', e.target.value)}
                placeholder="https://twitter.com/yourhandle"
                data-testid="input-social-twitter"
              />
            </div>
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input
                value={block.content.instagram || ''}
                onChange={(e) => updateContent('instagram', e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                data-testid="input-social-instagram"
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input
                value={block.content.linkedin || ''}
                onChange={(e) => updateContent('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
                data-testid="input-social-linkedin"
              />
            </div>
            <div className="space-y-2">
              <Label>YouTube URL</Label>
              <Input
                value={block.content.youtube || ''}
                onChange={(e) => updateContent('youtube', e.target.value)}
                placeholder="https://youtube.com/yourchannel"
                data-testid="input-social-youtube"
              />
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Company Name</Label>
                <VariableButton targetField="companyName" />
              </div>
              <Input
                value={block.content.companyName || ''}
                onChange={(e) => updateContent('companyName', e.target.value)}
                placeholder="{{company_name_text}}"
                data-testid="input-footer-company"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Address</Label>
                <VariableButton targetField="address" />
              </div>
              <Input
                value={block.content.address || ''}
                onChange={(e) => updateContent('address', e.target.value)}
                placeholder="{{company_address}}"
                data-testid="input-footer-address"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Email</Label>
                <VariableButton targetField="email" />
              </div>
              <Input
                value={block.content.email || ''}
                onChange={(e) => updateContent('email', e.target.value)}
                placeholder="{{company_email}}"
                data-testid="input-footer-email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Phone</Label>
                <VariableButton targetField="phone" />
              </div>
              <Input
                value={block.content.phone || ''}
                onChange={(e) => updateContent('phone', e.target.value)}
                placeholder="{{company_phone}}"
                data-testid="input-footer-phone"
              />
            </div>
            <div className="space-y-2">
              <Label>Unsubscribe Link (Optional)</Label>
              <Input
                value={block.content.unsubscribeLink || ''}
                onChange={(e) => updateContent('unsubscribeLink', e.target.value)}
                placeholder="https://yoursite.com/unsubscribe"
                data-testid="input-footer-unsubscribe"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Copyright Text</Label>
                <VariableButton targetField="copyright" />
              </div>
              <Input
                value={block.content.copyright || ''}
                onChange={(e) => updateContent('copyright', e.target.value)}
                placeholder="© {{current_year}} All rights reserved."
                data-testid="input-footer-copyright"
              />
            </div>
          </div>
        );

      default:
        return <p className="text-muted-foreground text-sm">No settings available</p>;
    }
  };

  const renderStyleEditor = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Background Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={block.styles.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            className="w-12 h-10 p-1"
            data-testid="input-style-bg-color"
          />
          <Input
            value={block.styles.backgroundColor || ''}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            placeholder="transparent"
            className="flex-1"
            data-testid="input-style-bg-color-text"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Text Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={block.styles.textColor || '#18181b'}
            onChange={(e) => updateStyle('textColor', e.target.value)}
            className="w-12 h-10 p-1"
            data-testid="input-style-text-color"
          />
          <Input
            value={block.styles.textColor || ''}
            onChange={(e) => updateStyle('textColor', e.target.value)}
            placeholder="#18181b"
            className="flex-1"
            data-testid="input-style-text-color-text"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Padding</Label>
        <Select
          value={block.styles.padding || '16px'}
          onValueChange={(value) => updateStyle('padding', value)}
        >
          <SelectTrigger data-testid="select-style-padding">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">None</SelectItem>
            <SelectItem value="8px">Small (8px)</SelectItem>
            <SelectItem value="16px">Medium (16px)</SelectItem>
            <SelectItem value="24px">Large (24px)</SelectItem>
            <SelectItem value="32px">Extra Large (32px)</SelectItem>
            <SelectItem value="16px 24px">Horizontal (16px 24px)</SelectItem>
            <SelectItem value="24px 32px">Wide (24px 32px)</SelectItem>
            <SelectItem value="48px 24px">Tall (48px 24px)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Text Alignment</Label>
        <Select
          value={block.styles.textAlign || 'left'}
          onValueChange={(value) => updateStyle('textAlign', value as any)}
        >
          <SelectTrigger data-testid="select-style-text-align">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Font Size</Label>
        <Select
          value={block.styles.fontSize || '16px'}
          onValueChange={(value) => updateStyle('fontSize', value)}
        >
          <SelectTrigger data-testid="select-style-font-size">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12px">Small (12px)</SelectItem>
            <SelectItem value="14px">Medium (14px)</SelectItem>
            <SelectItem value="16px">Normal (16px)</SelectItem>
            <SelectItem value="18px">Large (18px)</SelectItem>
            <SelectItem value="20px">Extra Large (20px)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Border Radius</Label>
        <Select
          value={block.styles.borderRadius || '0'}
          onValueChange={(value) => updateStyle('borderRadius', value)}
        >
          <SelectTrigger data-testid="select-style-border-radius">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">None</SelectItem>
            <SelectItem value="4px">Small (4px)</SelectItem>
            <SelectItem value="8px">Medium (8px)</SelectItem>
            <SelectItem value="12px">Large (12px)</SelectItem>
            <SelectItem value="16px">Extra Large (16px)</SelectItem>
            <SelectItem value="9999px">Full (Pill)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{definition?.label || block.type}</h3>
          <Badge variant="outline" className="text-xs">{block.type}</Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
          data-testid="button-delete-block"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="content" className="flex-1" data-testid="tab-block-content">
            <Settings2 className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="style" className="flex-1" data-testid="tab-block-style">
            <Palette className="h-4 w-4 mr-2" />
            Style
          </TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-4">
          <ScrollArea className="h-[350px] pr-4">
            {renderContentEditor()}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="style" className="mt-4">
          <ScrollArea className="h-[350px] pr-4">
            {renderStyleEditor()}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
