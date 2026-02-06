import{_ as p}from"./index-CoL2Us1S.js";let n=null;async function m(){if(!n)try{n=await(await p(()=>import("./viz-D4Omhygy.js"),[])).instance()}catch(r){throw console.error("Failed to load Viz:",r),r}return n}function v(r){const t=r.trim().split(`
`).slice(1);let e=`digraph {
  node [shape=box];
`;for(const i of t){const o=i.trim();if(!(!o||o.startsWith("%%"))&&o.includes("-->")){const[a,c]=o.split("-->").map(d=>d.trim()),s=a.replace(/[A-Z0-9]+\[(.+)\]/,"$1").replace(/[[\]]/g,""),l=c.replace(/[A-Z0-9]+\[(.+)\]/,"$1").replace(/[[\]]/g,"");e+=`  "${s}" -> "${l}";
`}}return e+="}",e}async function h(r){try{return(await(await m()).renderSVGElement(r)).outerHTML}catch(t){throw console.error("Graphviz render error:",t),t}}export{v as convertMermaidToGraphviz,h as renderDiagramWithGraphviz};
