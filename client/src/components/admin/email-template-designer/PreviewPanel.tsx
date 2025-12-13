import { useState } from 'react';
import { EmailBlock, GlobalStyles } from './types';
import { renderTemplateToHtml } from './utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Code, Copy, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PreviewPanelProps {
  blocks: EmailBlock[];
  globalStyles: GlobalStyles;
}

export function PreviewPanel({ blocks, globalStyles }: PreviewPanelProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile' | 'code'>('desktop');
  const [copied, setCopied] = useState(false);

  const html = renderTemplateToHtml(blocks, globalStyles);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b">
        <h3 className="font-semibold text-sm">Preview</h3>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="desktop" className="h-7 px-2" data-testid="preview-desktop">
                <Monitor className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="mobile" className="h-7 px-2" data-testid="preview-mobile">
                <Smartphone className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="code" className="h-7 px-2" data-testid="preview-code">
                <Code className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {viewMode === 'code' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8"
              data-testid="button-copy-html"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 mt-4 overflow-hidden">
        {viewMode === 'code' ? (
          <ScrollArea className="h-full">
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{html}</code>
            </pre>
          </ScrollArea>
        ) : (
          <div
            className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden transition-all ${
              viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
            }`}
            style={{ height: 'calc(100vh - 300px)' }}
          >
            <iframe
              srcDoc={html}
              className="w-full h-full border-0"
              title="Email Preview"
              sandbox="allow-same-origin"
              data-testid="preview-iframe"
            />
          </div>
        )}
      </div>
    </div>
  );
}
