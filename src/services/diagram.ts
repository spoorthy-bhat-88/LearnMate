// Import viz dynamically to avoid TypeScript issues
let vizInstance: any = null;

async function getViz() {
  if (!vizInstance) {
    try {
      const vizModule = await import('@viz-js/viz');
      vizInstance = await vizModule.instance();
    } catch (error) {
      console.error('Failed to load Viz:', error);
      throw error;
    }
  }
  return vizInstance;
}

// Simple converter from Mermaid to Graphviz DOT format for common diagrams
export function convertMermaidToGraphviz(mermaidSyntax: string): string {
  const lines = mermaidSyntax.trim().split('\n').slice(1); // Remove diagram type line
  
  // For simple flowcharts, we can convert to DOT format
  let dotSyntax = 'digraph {\n  node [shape=box];\n';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) continue;
    
    // Convert Mermaid arrows to DOT arrows
    if (trimmed.includes('-->')) {
      const [from, to] = trimmed.split('-->').map(s => s.trim());
      const cleanFrom = from.replace(/[A-Z0-9]+\[(.+)\]/, '$1').replace(/[[\]]/g, '');
      const cleanTo = to.replace(/[A-Z0-9]+\[(.+)\]/, '$1').replace(/[[\]]/g, '');
      dotSyntax += `  "${cleanFrom}" -> "${cleanTo}";\n`;
    }
  }
  
  dotSyntax += '}';
  return dotSyntax;
}

export async function renderDiagramWithGraphviz(dotSyntax: string): Promise<string> {
  try {
    const viz = await getViz();
    const svg = await viz.renderSVGElement(dotSyntax);
    return svg.outerHTML;
  } catch (error) {
    console.error('Graphviz render error:', error);
    throw error;
  }
}
