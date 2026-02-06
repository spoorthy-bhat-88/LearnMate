import{_ as h}from"./index-BdU5Nicy.js";let s=null;async function v(){if(!s)try{s=await(await h(()=>import("./viz-D4Omhygy.js"),[])).instance()}catch(t){throw console.error("Failed to load Viz:",t),t}return s}function g(t){const e=t.trim().split(`
`).slice(1);let r=`digraph {
  node [shape=box];
`;const a=new Map;for(const l of e){const o=l.trim();if(!o||o.startsWith("%%"))continue;const c=o.match(/^(\w+)\s*\[\s*"([^"]*)".*\]/);if(c){const n=c[1],i=c[2];a.set(n,i);continue}if(o.includes("-->")){const[n,i]=o.split("-->").map(f=>f.trim()),d=a.get(n)||n,p=a.get(i)||i,m=d.replace(/"/g,'\\"'),u=p.replace(/"/g,'\\"');r+=`  "${m}" -> "${u}";
`}}return r+="}",r}async function w(t){try{return(await(await v()).renderSVGElement(t)).outerHTML}catch(e){throw console.error("Graphviz render error:",e),e}}export{g as convertMermaidToGraphviz,w as renderDiagramWithGraphviz};
