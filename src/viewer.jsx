import * as React from 'react';
import * as d3 from 'd3';
import './style.css';
class Viewer extends React.Component {
  componentDidMount() {
    d3.select('#graff-view').append('div').classed('done-rendering', true);
    this.renderSunburst(data);
  }

  renderSunburst(data) {
    const partition = data => {
      const root = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
      return d3.partition()
        .size([2 * Math.PI, root.height + 1])
      (root);
    };

    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    const format = d3.format(",d");

    const width = 932;

    const radius = width / 6;

    const arc = d3.arc()
          .startAngle(d => d.x0)
          .endAngle(d => d.x1)
          .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
          .padRadius(radius * 1.5)
          .innerRadius(d => d.y0 * radius)
          .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));
    
    const chart = () => {
      const root = partition(data);

      root.each(d => d.current = d);

      const svg = d3.select('#graff-view').append("svg")
            .attr("viewBox", [0, 0, width, width])
            .style("font", "10px sans-serif");

      const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${width / 2})`);

      const path = g.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
            .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("d", d => arc(d.current));

      path.filter(d => d.children)
        .style("cursor", "pointer")
        .on("click", clicked);

      path.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

      const label = g.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none")
            .selectAll("text")
            .data(root.descendants().slice(1))
            .join("text")
            .attr("dy", "0.35em")
            .attr("fill-opacity", d => +labelVisible(d.current))
            .attr("transform", d => labelTransform(d.current))
            .text(d => d.data.name);

      const parent = g.append("circle")
            .datum(root)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked);

      function clicked(event, p) {
        parent.datum(p.parent || root);

        root.each(d => d.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth)
        });

        const t = g.transition().duration(750);

        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        path.transition(t)
          .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
          })
          .filter(function(d) {
            return +this.getAttribute("fill-opacity") || arcVisible(d.target);
          })
          .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
          .attrTween("d", d => () => arc(d.current));

        label.filter(function(d) {
          return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
          .attr("fill-opacity", d => +labelVisible(d.target))
          .attrTween("transform", d => () => labelTransform(d.current));
      }
      
      function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
      }

      function labelVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
      }

      function labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      }

      return svg.node();
    }
    
    chart();
  }
  
  renderElements(data) {
    const elts = [];
    data.forEach(d => {
      elts.push(d);
    });
    return elts;
  }
  render() {
    return (
      <div id='graff-view' />
    );
  }
};



window.gcexports.viewer = {
  Viewer: Viewer
};


const data = {
  "name": "Snowboards",
  "children": [
    {
      "name": "Freeride",
      "children": [
        {
          "name": "A-Frame",
          "children": [
            {
              "name": 154,
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "165MW",
              "value": 1
            },
            {
              "name": "170W",
              "value": 1
            }
          ]
        },
        {
          "name": "Annex",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "163MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Cask",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            }
          ]
        },
        {
          "name": "Clovis",
          "children": [
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        },
        {
          "name": "Cosa Nostra",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Crosscut Camber",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "165MW",
              "value": 1
            },
            {
              "name": "170W",
              "value": 1
            }
          ]
        },
        {
          "name": "Crosscut Rocker",
          "children": [
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "164MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Wasteland Camber",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Wasteland Rocker",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Camel Two",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        },
        {
          "name": "Magic Carpet",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Party Wave",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "Party Wave +",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "Surfer",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Thunder",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "3D Fish",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "154W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            },
            {
              "name": "166W",
              "value": 1
            },
            {
              "name": "170W",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom Flying V",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "154W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            },
            {
              "name": "166W",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom X Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            },
            {
              "name": "166W",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom X Flying V",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Deep Thinker",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "160W",
              "value": 1
            },
            {
              "name": "163W",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - 3D Big Gulp Camber",
          "children": [
            {
              "name": "144",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "164",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - 3D Daily Driver Camber",
          "children": [
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - 3D Deep Daze",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - 3D Double Dog Camber",
          "children": [
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "164",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - Hometown Hero Camber",
          "children": [
            {
              "name": "144",
              "value": 1
            },
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "160W",
              "value": 1
            },
            {
              "name": "165W",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - Pow Wrench",
          "children": [
            {
              "name": "142",
              "value": 1
            },
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - Sensei Camber",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "170",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - Straight Chuter Camber",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Flight Attendant Camber",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "168",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Process Camber",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Process Flying V",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Ripcord Flat Top",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Skeleton Key Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Skeleton Key XX Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Spring Break Powder Racers",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "Spring Break Ultralight Snowcraft",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "166",
              "value": 1
            }
          ]
        },
        {
          "name": "The Black Snowboard Of Death",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            },
            {
              "name": "165W",
              "value": 1
            },
            {
              "name": "169W",
              "value": 1
            }
          ]
        },
        {
          "name": "The Navigator",
          "children": [
            {
              "name": "147",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "164",
              "value": 1
            }
          ]
        },
        {
          "name": "Powder Killer",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            }
          ]
        },
        {
          "name": "Space Echo",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Supernatant",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Powreaper",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Wizard Stick",
          "children": [
            {
              "name": "146",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        }
      ]
    },
    {
      "name": "All-Mountain",
      "children": [
        {
          "name": "Bryan Iguchi Pro Camber",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "163MW",
              "value": 1
            },
            {
              "name": "167W",
              "value": 1
            }
          ]
        },
        {
          "name": "Coda Camber",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "160MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Coda Rocker",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "157MW",
              "value": 1
            },
            {
              "name": "161MW",
              "value": 1
            },
            {
              "name": "163MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Element Camber",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "158MW",
              "value": 1
            },
            {
              "name": "162MW",
              "value": 1
            },
            {
              "name": "166MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Element Camber 25th Year Anniversary",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "158MW",
              "value": 1
            },
            {
              "name": "162MW",
              "value": 1
            },
            {
              "name": "166MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Element Rocker",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "158MW",
              "value": 1
            },
            {
              "name": "162MW",
              "value": 1
            },
            {
              "name": "166MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Formula Camber",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "160MW",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Formula Rocker",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "159MW",
              "value": 1
            },
            {
              "name": "162MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Wasteland Camber",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Wasteland Rocker",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Beyond Medals Goliath",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Chaser",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Evil Twin",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Evil Twin Ltd",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Fun.Kink",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Goliath",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            },
            {
              "name": "164W",
              "value": 1
            }
          ]
        },
        {
          "name": "Jam",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            }
          ]
        },
        {
          "name": "Magic Carpet",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Stallion",
          "children": [
            {
              "name": "164W",
              "value": 1
            },
            {
              "name": "167W",
              "value": 1
            },
            {
              "name": "172W",
              "value": 1
            }
          ]
        },
        {
          "name": "Thunder",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Whatever",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "3D Kilroy Camber",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "154W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            },
            {
              "name": "166W",
              "value": 1
            },
            {
              "name": "170W",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom Flying V",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "154W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            },
            {
              "name": "166W",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom Twin Off-Axis Camber",
          "children": [
            {
              "name": "141",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom X Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            },
            {
              "name": "166W",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom X Flying V",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Deep Thinker",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "160W",
              "value": 1
            },
            {
              "name": "163W",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - 3D Daily Driver Camber",
          "children": [
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Free Thinker Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "160W",
              "value": 1
            }
          ]
        },
        {
          "name": "Instigator Flat Top",
          "children": [
            {
              "name": "140",
              "value": 1
            },
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "150W",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "160W",
              "value": 1
            },
            {
              "name": "165W",
              "value": 1
            }
          ]
        },
        {
          "name": "Kilroy Pow Camber",
          "children": [
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Name Dropper Camber",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Paramount Camber",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Process Camber",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Process Flying V",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Ripcord Flat Top",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Asymulator",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Defenders Of Awesome",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            }
          ]
        },
        {
          "name": "Kazu Kobubo Pro",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            }
          ]
        },
        {
          "name": "Mercury",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        },
        {
          "name": "Outerspace Living",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Spring Break Powder Twin",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Super D.O.A",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            }
          ]
        },
        {
          "name": "Supernova",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "159.5W",
              "value": 1
            },
            {
              "name": "162.5W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            }
          ]
        },
        {
          "name": "The Black Snowboard Of Death",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            },
            {
              "name": "165W",
              "value": 1
            },
            {
              "name": "169W",
              "value": 1
            }
          ]
        },
        {
          "name": "EMB",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154W",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            }
          ]
        },
        {
          "name": "FNS Pbj",
          "children": [
            {
              "name": "144",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Focus",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Ply",
          "children": [
            {
              "name": "147",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            }
          ]
        },
        {
          "name": "Supernatant",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Bilocq",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "Duke",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "Geeves",
          "children": [
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Kwon",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        },
        {
          "name": "MaeT x GoodVibes",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            }
          ]
        },
        {
          "name": "MaeT x Vantage",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Nevernot",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        },
        {
          "name": "Perry",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Rat",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            }
          ]
        },
        {
          "name": "Wizard Stick",
          "children": [
            {
              "name": "146",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        }
      ]
    },
    {
      "name": "Park",
      "children": [
        {
          "name": "Draft",
          "children": [
            {
              "name": "146",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "157MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Relapse by Erik Leon",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "155MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Shiloh Camber",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "160MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Shiloh Rocker",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "157MW",
              "value": 1
            },
            {
              "name": "161MW",
              "value": 1
            },
            {
              "name": "163MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Westmark Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "157MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Westmark Camber Frank April Edition",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Westmark Rocker",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "154MW",
              "value": 1
            },
            {
              "name": "157MW",
              "value": 1
            },
            {
              "name": "160MW",
              "value": 1
            },
            {
              "name": "161MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Beyond Medals Goliath",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Blow",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "154W",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            }
          ]
        },
        {
          "name": "Boss",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Disaster",
          "children": [
            {
              "name": "144",
              "value": 1
            },
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "Evil Twin",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Evil Twin Ltd",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Fun.Kink",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Global Warmer",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Global Warmer Ltd",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Goliath",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            },
            {
              "name": "164W",
              "value": 1
            }
          ]
        },
        {
          "name": "Wallie",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "154W",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "1995 Chill Cruizin",
          "children": [
            {
              "name": "153",
              "value": 1
            }
          ]
        },
        {
          "name": "3D Kilroy Camber",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom Twin Off-Axis Camber",
          "children": [
            {
              "name": "141",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Descendant Camber",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            }
          ]
        },
        {
          "name": "Kilroy Twin Camber",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Asymulator",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Defenders Of Awesome",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            }
          ]
        },
        {
          "name": "Horrorscope",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "147",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "151W",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            }
          ]
        },
        {
          "name": "Indoor Survival",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            }
          ]
        },
        {
          "name": "Party Panda",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "152W",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            }
          ]
        },
        {
          "name": "Scott Stevens Pro",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "The Outsiders",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Ultrafear",
          "children": [
            {
              "name": "147",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            }
          ]
        },
        {
          "name": "The 156 Rokit",
          "children": [
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "The 156",
          "children": [
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Bogart",
          "children": [
            {
              "name": "146",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            }
          ]
        }
      ]
    },
    {
      "name": "Resort",
      "children": [
        {
          "name": "Draft",
          "children": [
            {
              "name": "146",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "157MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Formula Camber",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "160MW",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Formula Rocker",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "159MW",
              "value": 1
            },
            {
              "name": "162MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Foundation",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "159MW",
              "value": 1
            },
            {
              "name": "162MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Relapse by Erik Leon",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "155MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Shiloh Camber",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "160MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Shiloh Rocker",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "157MW",
              "value": 1
            },
            {
              "name": "161MW",
              "value": 1
            },
            {
              "name": "163MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Westmark Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "157MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Westmark Camber Frank April Edition",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Westmark Rocker",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "154MW",
              "value": 1
            },
            {
              "name": "157MW",
              "value": 1
            },
            {
              "name": "160MW",
              "value": 1
            },
            {
              "name": "161MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Instigator Flat Top",
          "children": [
            {
              "name": "140",
              "value": 1
            },
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "150W",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "160W",
              "value": 1
            },
            {
              "name": "165W",
              "value": 1
            }
          ]
        },
        {
          "name": "Kilroy Twin Camber",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Indoor Survival",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            }
          ]
        },
        {
          "name": "Mercury",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        },
        {
          "name": "Outerspace Living",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Party Panda",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "152W",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            }
          ]
        },
        {
          "name": "Scott Stevens Pro",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "Spring Break Slush Slashers",
          "children": [
            {
              "name": "139",
              "value": 1
            },
            {
              "name": "143",
              "value": 1
            },
            {
              "name": "147",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            }
          ]
        },
        {
          "name": "Super D.O.A",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            }
          ]
        },
        {
          "name": "Supernova",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "159.5W",
              "value": 1
            },
            {
              "name": "162.5W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            }
          ]
        },
        {
          "name": "The Outsiders",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Ultrafear",
          "children": [
            {
              "name": "147",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            }
          ]
        },
        {
          "name": "Focus",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Space Echo",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Bogart",
          "children": [
            {
              "name": "146",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            }
          ]
        },
        {
          "name": "Duke",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        }
      ]
    },
    {
      "name": "On Piste",
      "children": [
        {
          "name": "Foundation",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "159MW",
              "value": 1
            },
            {
              "name": "162MW",
              "value": 1
            }
          ]
        },
        {
          "name": "Carver",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            }
          ]
        }
      ]
    },
    {
      "name": "Powder",
      "children": [
        {
          "name": "Terrapin",
          "children": [
            {
              "name": "145",
              "value": 1
            }
          ]
        },
        {
          "name": "Camel Two",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        },
        {
          "name": "Magic Carpet",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Party Wave",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "Party Wave +",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "Surfer",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "3D Fish",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        },
        {
          "name": "Deep Thinker",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "160W",
              "value": 1
            },
            {
              "name": "163W",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - 3D Backseat Driver",
          "children": [
            {
              "name": "140",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - 3D Big Gulp Camber",
          "children": [
            {
              "name": "144",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "164",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - 3D Deep Daze",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - 3D Double Dog Camber",
          "children": [
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "164",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - Hometown Hero Camber",
          "children": [
            {
              "name": "144",
              "value": 1
            },
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "160W",
              "value": 1
            },
            {
              "name": "165W",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - Pow Wrench",
          "children": [
            {
              "name": "142",
              "value": 1
            },
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - Sensei Camber",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "170",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - Straight Chuter Camber",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Flight Attendant Camber",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "168",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Kilroy Pow Camber",
          "children": [
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Skeleton Key Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Skeleton Key XX Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Kazu Kobubo Pro",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            }
          ]
        },
        {
          "name": "Spring Break Powder Racers",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "Spring Break Powder Twin",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Spring Break Slush Slashers",
          "children": [
            {
              "name": "139",
              "value": 1
            },
            {
              "name": "143",
              "value": 1
            },
            {
              "name": "147",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            }
          ]
        },
        {
          "name": "Spring Break Ultralight Snowcraft",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "166",
              "value": 1
            }
          ]
        },
        {
          "name": "The Black Snowboard Of Death",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            },
            {
              "name": "165W",
              "value": 1
            },
            {
              "name": "169W",
              "value": 1
            }
          ]
        },
        {
          "name": "The Navigator",
          "children": [
            {
              "name": "147",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "164",
              "value": 1
            }
          ]
        },
        {
          "name": "Powder Killer",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            }
          ]
        },
        {
          "name": "Powreaper",
          "children": [
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        }
      ]
    },
    {
      "name": "Freestyle",
      "children": [
        {
          "name": "Beyond Medals Goliath",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Blow",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "154W",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            }
          ]
        },
        {
          "name": "Boss",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Disaster",
          "children": [
            {
              "name": "144",
              "value": 1
            },
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "Evil Twin",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Evil Twin Ltd",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Fun.Kink",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "Global Warmer",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Global Warmer Ltd",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Goliath",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            },
            {
              "name": "164W",
              "value": 1
            }
          ]
        },
        {
          "name": "Jam",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            }
          ]
        },
        {
          "name": "Stallion",
          "children": [
            {
              "name": "164W",
              "value": 1
            },
            {
              "name": "167W",
              "value": 1
            },
            {
              "name": "172W",
              "value": 1
            }
          ]
        },
        {
          "name": "Wallie",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "154W",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Whatever",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            }
          ]
        },
        {
          "name": "1995 Chill Cruizin",
          "children": [
            {
              "name": "153",
              "value": 1
            }
          ]
        },
        {
          "name": "3D Kilroy Camber",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "154W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            },
            {
              "name": "166W",
              "value": 1
            },
            {
              "name": "170W",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom Flying V",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "154W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            },
            {
              "name": "166W",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom Twin Off-Axis Camber",
          "children": [
            {
              "name": "141",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom X Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "162W",
              "value": 1
            },
            {
              "name": "166W",
              "value": 1
            }
          ]
        },
        {
          "name": "Custom X Flying V",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Descendant Camber",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            }
          ]
        },
        {
          "name": "Free Thinker Camber",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "160W",
              "value": 1
            }
          ]
        },
        {
          "name": "Name Dropper Camber",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Paramount Camber",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Asymulator",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Defenders Of Awesome",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            }
          ]
        },
        {
          "name": "Horrorscope",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "147",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "151W",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            }
          ]
        },
        {
          "name": "Super D.O.A",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            }
          ]
        },
        {
          "name": "The Outsiders",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Ultrafear",
          "children": [
            {
              "name": "147",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "153W",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            }
          ]
        },
        {
          "name": "EMB",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "154W",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "158W",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            }
          ]
        },
        {
          "name": "FNS Pbj",
          "children": [
            {
              "name": "144",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155W",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "159W",
              "value": 1
            }
          ]
        },
        {
          "name": "Focus",
          "children": [
            {
              "name": "145",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            }
          ]
        },
        {
          "name": "Ply",
          "children": [
            {
              "name": "147",
              "value": 1
            },
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "157W",
              "value": 1
            },
            {
              "name": "159",
              "value": 1
            },
            {
              "name": "161W",
              "value": 1
            }
          ]
        },
        {
          "name": "The 156 Rokit",
          "children": [
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "The 156",
          "children": [
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Bilocq",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            }
          ]
        },
        {
          "name": "Bogart",
          "children": [
            {
              "name": "146",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            }
          ]
        },
        {
          "name": "Geeves",
          "children": [
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "162",
              "value": 1
            }
          ]
        },
        {
          "name": "Kwon",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        },
        {
          "name": "MaeT x GoodVibes",
          "children": [
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            }
          ]
        },
        {
          "name": "MaeT x Vantage",
          "children": [
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Nevernot",
          "children": [
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        },
        {
          "name": "Perry",
          "children": [
            {
              "name": "150",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            }
          ]
        },
        {
          "name": "Rat",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "155",
              "value": 1
            }
          ]
        },
        {
          "name": "Wizard Stick",
          "children": [
            {
              "name": "146",
              "value": 1
            },
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        }
      ]
    },
    {
      "name": "Big Mountain",
      "children": [
        {
          "name": "Camel Two",
          "children": [
            {
              "name": "149",
              "value": 1
            },
            {
              "name": "153",
              "value": 1
            },
            {
              "name": "157",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        }
      ]
    },
    {
      "name": "Carving",
      "children": [
        {
          "name": "Carver",
          "children": [
            {
              "name": "154",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            },
            {
              "name": "160",
              "value": 1
            }
          ]
        }
      ]
    },
    {
      "name": "Fishtail",
      "children": [
        {
          "name": "3D Fish",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - Pow Wrench",
          "children": [
            {
              "name": "142",
              "value": 1
            },
            {
              "name": "148",
              "value": 1
            },
            {
              "name": "152",
              "value": 1
            },
            {
              "name": "158",
              "value": 1
            }
          ]
        },
        {
          "name": "Family Tree - Sensei Camber",
          "children": [
            {
              "name": "151",
              "value": 1
            },
            {
              "name": "156",
              "value": 1
            },
            {
              "name": "161",
              "value": 1
            },
            {
              "name": "170",
              "value": 1
            }
          ]
        }
      ]
    }
  ]
}
