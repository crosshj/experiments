// TODO: https://stackoverflow.com/questions/35248007/vscode-editor-restart-nodejs-server-when-file-is-changed

var D3Node = require('d3-node');
const express = require('express');
const app = express();
const port = 2123;

var d3n = new D3Node();
const d3 = d3n.d3;

function getSVG() {
  var data = getData();
  var fileName = "chart.svg";

  const margin = {
    left: 50,
    top: 20,
    right: 50,
    bottom: 50
  };
  const _width = 800;
  const _height = 500;
  const width = _width - margin.left - margin.right - 100;
  const height = _height - margin.top - margin.bottom - 100;

  const x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .range([height, 0]);

  const svg = d3n.createSVG(_width, _height)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  x.domain(data.map((d) => d.x));
  y.domain([0, d3.max(data, (d) => d.y)]);

  // append the rectangles for the bar chart
  svg.selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => x(d.x))
    .attr('width', x.bandwidth())
    .attr('y', (d) => y(d.y))
    .attr('height', (d) => height - y(d.y));

  // add the x Axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(
    d3.axisBottom(x)
      .tickValues(x.domain().filter((d, i) => !(i % 25) && i !== 0))
    );

  // add the y Axis
  svg.append('g').call(
    d3.axisLeft(y)
      .ticks(10)
      .tickSizeOuter(1)
  );

  // render to svg string
  var svgString = d3n.svgString();
  return svgString;
}

function getData() {
  let data = new Array(50).fill().map((_, i) =>({
    "x": i,
    "y": Math.floor(Math.random() * 10000)
  }));

  return data;
}

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(getSVG.call());
});

app.listen(port, () => {
  console.log(`SVG app listening on port ${port}`);
});


