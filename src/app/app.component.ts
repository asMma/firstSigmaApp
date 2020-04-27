import { Component, OnInit, ViewChild } from '@angular/core';
import { sigma } from 'sigma';
import { neo4jGraph } from './neosigma';
import * as _ from 'lodash';
import { isEmpty } from 'lodash';
import { neoToSigmaConfig } from './neo4j-config';
import "./sigma-custom-render/sigma.canvas.utils.js";
import "./sigma-custom-render/sigma.canvas.hovers.def.js";
import "./sigma-custom-render/sigma.canvas.nodes.def.js";
import "./sigma-custom-render/sigma.canvas.edges.paracurve.js";
import "./sigma-custom-render/sigma.canvas.edgehovers.paracurve.js";
import "./sigma-custom-render/sigma.canvas.edges.labels.paracurve.js";
import "./sigma-custom-render/sigma.extend.graph.js";

declare const sigma: any;

const neo4jConfig = neoToSigmaConfig.neo4jConfig;
const neo4jStyle = neoToSigmaConfig.neo4jStyle;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  oldestEdge: number;
  youngestEdge: number;
  selectedDate: number;
  sigIns: any;
  selectedNode: any;

  initGraph: any;

  isPaused = true;
  isLabelsDisplayed = false;
  interval: any;

  selectedSpeed = 0.05;
  @ViewChild('slider') slider;

  ngOnInit() {
    this.createGraph();
  }


  createGraph() {
    if (this.sigIns) {
      this.sigIns.kill();
    }
    this.sigIns = new sigma(
      {
        renderer: {
          container: document.getElementById('sigma-container'),
          type: 'canvas'
        },
        settings: {
          minEdgeSize: 1,
          maxEdgeSize: 1,
          minNodeSize: 10,
          maxNodeSize: 10,
          edgeLabelSizePowRatio: 0.1,
          edgeHoverPrecision: 10,
          labelHoverColor: 'node',
          defaultHoverLabelBGColor: '#000000',
          drawEdgeLabels: this.isLabelsDisplayed || false,
          drawLabels: this.isLabelsDisplayed || false,
          //scalingMode: 'outside',
          //labelSize: 'proportional'
          // sideMargin: -5
        }
      }
    );
    
    const that = this;
    this.sigIns.bind('overNode', function (e) { that.selectedNode = e.data.node; });

    this.neoToSig(this).then(() => { that.drawGraph(); });
  }

  // Choose which node label to display
  mapNodesName(nodes: any[]) {
    nodes = nodes.map(node => {
      node.label = node.labels.length > 1 ? node.properties.host : node.labels[0];
      return node;
    })
  }


  // Fetch neo data
  neoToSig(that: any) {
    return neo4jGraph(neo4jConfig, neo4jStyle,
      'MATCH (n)-[r]->(m) RETURN n,r,m LIMIT $limit', { limit: 200 })
      .then(function (graph) {
        that.youngestEdge = Math.max(...graph["edges"].map(edge => {
          if (edge.properties && edge.properties.dateTime) {
            return Date.parse(edge.properties.dateTime)
          } else return null
        }));

        that.oldestEdge = Math.min(...graph["edges"].map(edge => {
          if (edge.properties && edge.properties.dateTime) {
            return Date.parse(edge.properties.dateTime)
          } else return null
        }).filter(ed => ed));
        that.slider.value = that.youngestEdge;
        that.initGraph = graph;
      })
  }

  // Draw graph
  drawGraph() {
    this.mapNodesName(this.initGraph['nodes']);
    this.sigIns.graph.read(this.initGraph);
    // Ask sigma to draw it
    this.sigIns.refresh();
    // enable drag'n'drop
    sigma.plugins.dragNodes(this.sigIns, this.sigIns.renderers[0]);
    // // start layout
    this.sigIns.startForceAtlas2();
    setTimeout(() => { this.sigIns.stopForceAtlas2() }, 1000);
  }
  
  // Filter Graph
  selectDate(date: any) {
    this.slider.value = date;
    this.initGraph['edges'].forEach(edge => {
      if (this.slider.value < (Date.parse(edge.properties.dateTime))) {
        if (this.sigIns.graph.edges(edge['id'])) {
          this.sigIns.graph.dropEdge(edge['id']);
        }

      } else {
        if (!this.sigIns.graph.edges(edge['id'])) {
          this.sigIns.graph.addEdge(edge);
        }
      }
    });;
    this.sigIns.refresh();
  }

  playOrPause() {
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.interval = setInterval(() => {
        if (this.oldestEdge <= this.slider.value) {
          this.slider.value = this.slider.value - ((this.youngestEdge - this.oldestEdge) * this.selectedSpeed);
          this.selectDate(this.slider.value);
        } else {   // If minimum is reached
          clearInterval(this.interval);
          this.slider.value = this.youngestEdge;
          this.isPaused = true;
          this.selectDate(this.slider.value);
        }
      }, 100);
    } else {
      if (this.interval) { clearInterval(this.interval) }
    }

  }
}
