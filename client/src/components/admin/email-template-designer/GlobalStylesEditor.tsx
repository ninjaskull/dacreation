import { GlobalStyles } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GlobalStylesEditorProps {
  styles: GlobalStyles;
  onChange: (styles: GlobalStyles) => void;
}

export function GlobalStylesEditor({ styles, onChange }: GlobalStylesEditorProps) {
  const updateStyle = (key: keyof GlobalStyles, value: string) => {
    onChange({ ...styles, [key]: value });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Global Styles</CardTitle>
        <CardDescription className="text-xs">Customize the overall look of your email</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={styles.backgroundColor}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-10 h-8 p-1"
                  data-testid="input-global-bg-color"
                />
                <Input
                  value={styles.backgroundColor}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="flex-1 h-8 text-xs"
                  data-testid="input-global-bg-color-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Content Background</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={styles.contentBackgroundColor}
                  onChange={(e) => updateStyle('contentBackgroundColor', e.target.value)}
                  className="w-10 h-8 p-1"
                  data-testid="input-global-content-bg-color"
                />
                <Input
                  value={styles.contentBackgroundColor}
                  onChange={(e) => updateStyle('contentBackgroundColor', e.target.value)}
                  className="flex-1 h-8 text-xs"
                  data-testid="input-global-content-bg-color-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={styles.primaryColor}
                  onChange={(e) => updateStyle('primaryColor', e.target.value)}
                  className="w-10 h-8 p-1"
                  data-testid="input-global-primary-color"
                />
                <Input
                  value={styles.primaryColor}
                  onChange={(e) => updateStyle('primaryColor', e.target.value)}
                  className="flex-1 h-8 text-xs"
                  data-testid="input-global-primary-color-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={styles.secondaryColor}
                  onChange={(e) => updateStyle('secondaryColor', e.target.value)}
                  className="w-10 h-8 p-1"
                  data-testid="input-global-secondary-color"
                />
                <Input
                  value={styles.secondaryColor}
                  onChange={(e) => updateStyle('secondaryColor', e.target.value)}
                  className="flex-1 h-8 text-xs"
                  data-testid="input-global-secondary-color-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={styles.textColor}
                  onChange={(e) => updateStyle('textColor', e.target.value)}
                  className="w-10 h-8 p-1"
                  data-testid="input-global-text-color"
                />
                <Input
                  value={styles.textColor}
                  onChange={(e) => updateStyle('textColor', e.target.value)}
                  className="flex-1 h-8 text-xs"
                  data-testid="input-global-text-color-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Muted Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={styles.mutedTextColor}
                  onChange={(e) => updateStyle('mutedTextColor', e.target.value)}
                  className="w-10 h-8 p-1"
                  data-testid="input-global-muted-text-color"
                />
                <Input
                  value={styles.mutedTextColor}
                  onChange={(e) => updateStyle('mutedTextColor', e.target.value)}
                  className="flex-1 h-8 text-xs"
                  data-testid="input-global-muted-text-color-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Font Family</Label>
              <Select
                value={styles.fontFamily}
                onValueChange={(value) => updateStyle('fontFamily', value)}
              >
                <SelectTrigger className="h-8 text-xs" data-testid="select-global-font-family">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                  <SelectItem value="Helvetica, Arial, sans-serif">Helvetica</SelectItem>
                  <SelectItem value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Segoe UI</SelectItem>
                  <SelectItem value="Georgia, serif">Georgia</SelectItem>
                  <SelectItem value="'Times New Roman', Times, serif">Times New Roman</SelectItem>
                  <SelectItem value="'Courier New', Courier, monospace">Courier New</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Content Width</Label>
              <Select
                value={styles.contentWidth}
                onValueChange={(value) => updateStyle('contentWidth', value)}
              >
                <SelectTrigger className="h-8 text-xs" data-testid="select-global-content-width">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500px">Narrow (500px)</SelectItem>
                  <SelectItem value="600px">Standard (600px)</SelectItem>
                  <SelectItem value="700px">Wide (700px)</SelectItem>
                  <SelectItem value="800px">Extra Wide (800px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
