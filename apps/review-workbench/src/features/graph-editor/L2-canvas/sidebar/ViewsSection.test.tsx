import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReactFlowProvider } from '@xyflow/react';

import { ViewsSection, viewNameFromLabel } from './ViewsSection';

describe('ViewsSection', () => {
  it('renders the store views selector, the store field and the save action', () => {
    // The sidebar lives inside GraphEditor's ReactFlowProvider (the layout hook reads React Flow's store).
    const markup = renderToStaticMarkup(
      <ReactFlowProvider>
        <ViewsSection />
      </ReactFlowProvider>,
    );

    expect(markup).toContain('Saved views');
    expect(markup).toContain('Save current as view');
    expect(markup).toContain('data-testid="view-store-path"');
  });

  it('turns a label into a portable ViewDoc name', () => {
    expect(viewNameFromLabel(' Herencia de Errores ')).toBe('herencia-de-errores');
    expect(viewNameFromLabel('Capas: núcleo')).toBe('capas-nucleo');
    expect(viewNameFromLabel('!!!')).toBe('');
  });
});
