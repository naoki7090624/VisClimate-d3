var months, month;
var year, n, m;

var w = window.innerWidth;
var h = window.innerHeight;
var scale = 100;
var svg, projection, path, ColorScale;

var number;

var params = {
  M: 0,
  Y: 1901
};

function main(){
  
  projection = d3.geoMercator()
    .center([ w/2, h/2 ])
    .translate([w/2, h/2])
    .scale(scale);

  path = d3.geoPath().projection(projection);

  svg = d3.select("#sampleGraph")
        .append("svg")
        .attr("width", w)
        .attr("height", h);
  
  var data = [{"color":"#2c7bb6","value":-3},
              {"color":"#ffff8c","value":0},
              {"color":"#d7191c","value":3}];

  var extent = d3.extent(data, d => d.value);
  
  var padding = 10;
  var padding_top = 20;
  var width = window.innerWidth/2;
  var innerWidth = width - (padding * 2);
  var barHeight = window.innerHeight/20;

  var xScale = d3.scaleLinear()
      .range([0, innerWidth])
      .domain(extent);

  var xTicks = data.map(d => d.value);

  var xAxis = d3.axisBottom(xScale)
      .tickSize(barHeight)
      .tickFormat(function(d) { return d + "°C"; })
      .tickValues(xTicks);
  
  var g = svg.append("g").attr("transform", "translate(" + padding + ", " + padding_top + ")");

  var defs = svg.append("defs");
  var linearGradient = defs.append("linearGradient").attr("id", "myGradient");
  
  linearGradient.selectAll("stop")
      .data(data)
      .enter().append("stop")
      .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
      .attr("stop-color", d => d.color);

  g.append("rect")
      .attr("width", innerWidth)
      .attr("height", barHeight)
      .style("fill", "url(#myGradient)");

  g.append("g")
      .call(xAxis)
      .attr("y",60)
      .select(".domain").remove();
  

  ColorScale = d3.scaleLinear()
    .domain([-3, 0, 3])
    .range(["#2c7bb6", "#ffff8c", "#d7191c"])
    .interpolate(d3.interpolateHcl);
  
  year = params.Y;
  n = "json/" + String(year) + ".json";

  var tooltip = d3.select("body").append("div").attr("class", "tooltip");


  d3.json(n).then(function(json) {
      console.log(json.features);
      svg.selectAll("path")  //draw the map
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "gray")
        .on("mouseover", function(d) { 
          d3.select(this).style("stroke", "black")
          tooltip
          .style("visibility", "visible")
          .html(d.properties.name + " - " + "Temp : " + d3.format(".2f")(d.Temp) + "℃");
        })
        .on("mousemove", function(d) {
          tooltip
            .style("top", (d3.event.pageY - 20) + "px")
            .style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function(d) { 
          d3.select(this).style("stroke", "grey")
          d3.select(this)
          .attr("r", function(d) {
            return Math.sqrt(parseInt(d.Rain));
          })
          tooltip.style("visibility", "hidden");
        })
        .transition()
        //.style("stroke", "gray")
        //.style("stroke-width", 0.25)
        .style("fill", function(d){
          return ColorScale(parseFloat(d.Temp));
        });
      svg.selectAll("circle")  //add precipitation as circle
        .data(json.features)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return projection([d.Longitude, d.Latitude])[0];
        })
        .attr("cy", function(d) {
            return projection([d.Longitude, d.Latitude])[1];
        })
        .attr("r", function(d) {
            return Math.sqrt(parseInt(d.Rain));
        })
        .on("mouseover", function(d) { 
          d3.select(this)
          .attr("r", function(d) {
            return Math.sqrt(parseInt(d.Rain*2));
          })
          tooltip
          .style("visibility", "visible")
          .html(d.properties.name + " - " + "Rain : " + d3.format(".2f")(d.Rain) + "mm");
        })
        .on("mousemove", function(d) {
          tooltip
            .style("top", (d3.event.pageY - 20) + "px")
            .style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function(d) { 
          d3.select(this)
          .attr("r", function(d) {
            return Math.sqrt(parseInt(d.Rain));
          })
          tooltip.style("visibility", "hidden");
        })
        .transition()
        .style("fill", "royalblue")
        .style("opacity", 0.7)
  });
}

main();



d3.select("#updataGraph").on("click",function(){
  year = document.getElementById("number2").value;
  n = "json/" + String(year) + ".json";
  d3.json(n).then(function(json) {
    svg.selectAll("path")  //draw the map
      .data(json.features)
      .attr("d", path)
      .transition()
      .style("stroke", "gray")
      .style("stroke-width", 0.25)
      .style("fill", function(d){
        return ColorScale(parseInt(d.Temp));
      });
    svg.selectAll("circle")  //add precipitation as circle
      .data(json.features)
      .attr("cx", function(d) {
          return projection([d.Longitude, d.Latitude])[0];
      })
      .attr("cy", function(d) {
          return projection([d.Longitude, d.Latitude])[1];
      })
      .attr("r", function(d) {
          return Math.sqrt(parseInt(d.Rain));
      })
      .transition()
      .style("fill", "royalblue")
      .style("opacity", 0.7)
      //.append("title")
  });
});