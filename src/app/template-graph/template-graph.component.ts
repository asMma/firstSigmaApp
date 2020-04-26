import { Component, OnInit } from '@angular/core';
import { sigma } from 'sigma';
declare const sigma: any;
@Component({
  selector: 'app-template-graph',
  templateUrl: './template-graph.component.html',
  styleUrls: ['./template-graph.component.scss']
})
export class TemplateGraphComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Initialise sigma:
let s = new sigma(
  {
    renderer: {
      container: document.getElementById('template-container'),
      type: 'canvas'
    },
    settings: {
     minEdgeSize: 0.1,
     maxEdgeSize: 2,
     minNodeSize: 1,
     maxNodeSize: 8,
    }
  }
);

// Create a graph object
let graph = {
  nodes: [
    { id: "n0", label: "A node", x: 0, y: 0, size: 3, color: '#008cc2' },
    { id: "n1", label: "Another node", x: 3, y: 1, size: 2, color: '#008cc2' },
    { id: "n2", label: "And a last one", x: 1, y: 3, size: 1, color: '#E57821' }
  ],
  edges: [
    { id: "e0", source: "n0", target: "n1", color: '#282c34', type:'line', size:0.5 },
    { id: "e1", source: "n1", target: "n2", color: '#282c34', type:'curve', size:1},
    { id: "e2", source: "n2", target: "n0", color: '#FF0000', type:'line', size:2}
  ]
}

// Add Node
s.graph.addNode({
  // Main attributes:
  id: 'n3',
  label: 'Hello',
  // Display attributes:
  x: 4,
  y: 1,
  size: 1,
  color: '#f00'
});

// Add Edge after 1s
setTimeout(()=> {s.graph.addEdge({
  id: 'e4',
  // Reference extremities:
  source: 'n1',
  target: 'n3'
});s.refresh();}, 1000);

// Drop Node after 2s
setTimeout(()=> {s.graph.dropNode('n3');s.refresh();}, 3000)

// Load the graph in sigma
s.graph.read(graph);

// Check edge existence
console.log("checking : ", s.graph.edges('e2'))
// Ask sigma to draw it
s.refresh();
  }

}
