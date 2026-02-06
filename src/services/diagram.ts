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
  const nodeMap = new Map<string, string>(); // Map ID to label
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) continue;
    
    // First, extract node definitions (e.g., A["Label"])
    const nodeDefMatch = trimmed.match(/^(\w+)\s*\[\s*"([^"]*)".*\]/);
    if (nodeDefMatch) {
      const nodeId = nodeDefMatch[1];
      const label = nodeDefMatch[2];
      nodeMap.set(nodeId, label);
      continue;
    }
    
    // Convert Mermaid arrows to DOT arrows
    if (trimmed.includes('-->')) {
      const [from, to] = trimmed.split('-->').map(s => s.trim());
      
      // Get label or use ID
      const fromLabel = nodeMap.get(from) || from;
      const toLabel = nodeMap.get(to) || to;
      
      // Escape quotes in labels
      const escapedFrom = fromLabel.replace(/"/g, '\\"');
      const escapedTo = toLabel.replace(/"/g, '\\"');
      
      dotSyntax += `  "${escapedFrom}" -> "${escapedTo}";\n`;
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
