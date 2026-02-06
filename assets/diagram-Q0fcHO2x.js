import{_ as p}from"./index-CVm3r191.js";let o=null;async function u(){if(!o){const r=await p(()=>import("./viz-D4Omhygy.js"),[]);o=r.default||r.Viz||r}return new o}function f(r){const t=r.trim().split(`
`).slice(1);let e=`digraph {
  node [shape=box];
`;for(const i of t){const n=i.trim();if(!(!n||n.startsWith("%%"))&&n.includes("-->")){const[a,c]=n.split("-->").map(m=>m.trim()),s=a.replace(/[A-Z0-9]+\[(.+)\]/,"$1").replace(/[[\]]/g,""),l=c.replace(/[A-Z0-9]+\[(.+)\]/,"$1").replace(/[[\]]/g,"");e+=`  "${s}" -> "${l}";
`}}return e+="}",e}async function v(r){try{return(await(await u()).renderSVGElement(r)).outerHTML}catch(t){throw console.error("Graphviz render error:",t),t}}export{f as convertMermaidToGraphviz,v as renderDiagramWithGraphviz};
