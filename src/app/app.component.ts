import { Component, OnInit, ViewChild } from '@angular/core';
import { sigma } from 'sigma';
import { neo4jGraph } from './neosigma';
import * as _ from 'lodash';
import { isEmpty } from 'lodash';
import { environment } from '../environments/environment';
import "./sigma-custom-render/sigma.canvas.utils.js";
import "./sigma-custom-render/sigma.canvas.hovers.def.js";
import "./sigma-custom-render/sigma.canvas.nodes.def.js";
import "./sigma-custom-render/sigma.canvas.edges.paracurve.js";
import "./sigma-custom-render/sigma.canvas.edgehovers.paracurve.js";
import "./sigma-custom-render/sigma.canvas.edges.labels.paracurve.js";
import "./sigma-custom-render/sigma.extend.graph.js";

declare const sigma: any;

const neo4jConfig = environment.neo4jConfig;
const neo4jStyle = environment.neo4jStyle;

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

  isLabelsDisplayed = false;
  @ViewChild('slider') slider;

  ngOnInit() {
    this.createGraph(true);
  }

  selectDate(date: any) {
    this.slider.value = date.value;
    this.createGraph();

  }

  createGraph(init?: boolean) {
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
    let that = this;
    this.sigIns.bind('overNode', function (e) {
      that.selectedNode = e.data.node;
    });



    neo4jGraph(neo4jConfig, neo4jStyle, 'MATCH (n)-[r]->(m) RETURN n,r,m LIMIT $limit', { limit: 200 }).then(function (graph) {
      if (init) {

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
      } else {
        graph['edges'] = graph['edges'].filter(edge => (Date.parse(edge.properties.dateTime) <= that.slider.value) || isEmpty(edge.properties));

      }
      that.mapNodesName(graph['nodes']);
      that.sigIns.graph.read(graph);
      // Ask sigma to draw it
      that.sigIns.refresh();
      // enable drag'n'drop
      sigma.plugins.dragNodes(that.sigIns, that.sigIns.renderers[0]);
      // // start layout
      that.sigIns.startForceAtlas2();
      setTimeout(() => { that.sigIns.stopForceAtlas2() }, 2000);
    });
  }
  mapNodesName(nodes: any[]) {
    nodes = nodes.map(node => {
      node.label = node.labels.length > 1 ? node.properties.host : node.labels[0];
      return node;
    })
  }
}
