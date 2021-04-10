import * as React from 'react';
import * as d3 from 'd3';
//import {Viewer as BasisViewer} from '@graffiticode/basis/src/viewer.jsx';
import {Viewer as BasisViewer} from '../../../../work/graffiticode/basis/src/viewer.jsx';
import './style.css';
class Viewer extends BasisViewer {
  componentDidMount() {
    d3.select('#graff-view').append('div').classed('done-rendering', true);
  }
  renderElements(data) {
    const elts = [];
    data.forEach(d => {
      elts.push(d);
    });
    return elts;
  }
  render() {
    const props = this.props;
    const data = props.obj && [].concat(props.obj) || [];
    const elts = this.renderElements(data);
    return (
      <div>{elts}</div>
    );
  }
};



window.gcexports.viewer = {
  Viewer: Viewer
};
