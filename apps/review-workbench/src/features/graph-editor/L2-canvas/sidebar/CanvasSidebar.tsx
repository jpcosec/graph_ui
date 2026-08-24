import type { ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PanelRightClose, PanelRightOpen, Sparkles } from 'lucide-react';

import { useUIStore } from '@/stores/ui-store';

import { ActionsSection } from './ActionsSection';
import { CreationSection } from './CreationSection';
import { EncodingSection } from './EncodingSection';
import { FiltersSection } from './FiltersSection';
import { ViewsSection } from './ViewsSection';
import { ViewSection } from './ViewSection';

const accordionClassName = 'px-4 font-mono text-[10px] uppercase tracking-[0.24em]';

interface CanvasSidebarProps {
  onSave: () => void;
  variant?: 'default' | 'compact';
  topPanel?: ReactNode;
}

function AccordionPanel({
  value,
  title,
  children,
}: {
  value: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <AccordionItem value={value} className="section-card overflow-hidden rounded-[1.25rem] border-none px-0">
      <AccordionTrigger className={accordionClassName}>{title}</AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

export function CanvasSidebar({ onSave, variant = 'default', topPanel }: CanvasSidebarProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  if (!sidebarOpen) {
    return (
      <aside className="ml-4 flex h-full w-14 items-start justify-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="glass-panel mt-6 h-11 w-11 rounded-2xl border-white/10 bg-surface/80"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className={`ml-4 h-full overflow-y-auto rounded-[2rem] ${variant === 'compact' ? 'w-[280px]' : 'w-[320px]'}`}>
      <div className="glass-panel h-full rounded-[2rem]">
        <div className={`border-b border-white/8 ${variant === 'compact' ? 'px-4 py-4' : 'px-5 py-5'}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="font-mono text-[10px] uppercase tracking-[0.24em]">Editor Deck</span>
              </div>
              <h2 className={`font-headline font-bold text-on-surface ${variant === 'compact' ? 'mt-2 text-[1.35rem]' : 'mt-3 text-2xl'}`}>Control surface</h2>
              <p className={`text-muted-foreground ${variant === 'compact' ? 'mt-1 text-[12px] leading-relaxed' : 'mt-1 text-sm'}`}>Build, filter, and save without overpowering the graph.</p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-2xl border border-white/8 bg-white/[0.03]"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={`space-y-4 ${variant === 'compact' ? 'p-3' : 'p-4'}`}>
          {topPanel ? <div className="rounded-[1.5rem]">{topPanel}</div> : null}

          <div className="section-card rounded-[1.5rem] px-4 py-3 opacity-80">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Flow</p>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className={`${variant === 'compact' ? 'text-lg' : 'text-xl'} font-semibold text-on-surface`}>Live</p>
                <p className="text-xs text-muted-foreground">Interactive graph session</p>
              </div>
              <div>
                <p className={`${variant === 'compact' ? 'text-lg' : 'text-xl'} font-semibold text-on-surface`}>Studio</p>
                <p className="text-xs text-muted-foreground">Panels tuned for editing speed</p>
              </div>
            </div>
          </div>

          <Accordion type="multiple" defaultValue={variant === 'compact' ? ['actions', 'creation', 'view', 'encoding', 'views'] : ['actions', 'filters', 'creation', 'view', 'encoding', 'views']} className="space-y-3 px-1 pb-4">
            <AccordionPanel value="actions" title="Actions">
              <ActionsSection onSave={onSave} />
            </AccordionPanel>

            <AccordionPanel value="filters" title="Filters">
              <FiltersSection />
            </AccordionPanel>

            <AccordionPanel value="creation" title="Creation">
              <CreationSection />
            </AccordionPanel>

            <AccordionPanel value="view" title="View">
              <ViewSection />
            </AccordionPanel>

            <AccordionPanel value="encoding" title="Encoding">
              <EncodingSection />
            </AccordionPanel>

            <AccordionPanel value="views" title="Views">
              <ViewsSection />
            </AccordionPanel>
          </Accordion>
        </div>
      </div>
    </aside>
  );
}
