// Set up our chart
// Define the width and the heights of our svg element
// Cargo container (not changed)
var svgWidth = 960;
var svgHeight = 500;

// Define the margin of an svg element
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 50
};

// Capture the width and height of the area that we are going to be putting the line to reflect the data
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an svg wrapper
var svg = d3
  .select("body") // select a body tag from html
  .append("svg") // append our svg
  .attr("width", svgWidth) // set h&w to an attr that = h&w of svg
  .attr("height", svgHeight);

// Append a group tag to svg element
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.right})`);

// DATA TO ANALYZE healthcare -> yAxis, poverty & income ->xAxis

// Initial Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]); //pxls on screen

  return xLinearScale;
}

function yScale(data, chosenYAxis) {
  var yLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]); 

  return yLinearScale;
}

// function used for updating xAxis var upon click on xaxis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis
    .transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Function used for updating yAxis var upon click on yAxis
function renderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis
    .transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Updating circles group with a transition to new circles    ~~~~~~~~~~~~~~ another function render circles for newYaxis or add and attr to this function (parmaeters???)
function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYAxis) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup;
}

// Circles text
function renderCirclestext(circletext, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circletext.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]-0.2))
    .attr("y", d => newYScale(d[chosenYAxis]-0.2))

  return circletext;
}


// Updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  if (chosenXAxis === "poverty") {
    var xlabel = "poverty";
  } else {
    var xlabel = "income";
  }
  if (chosenYAxis === "healthcare") {
    var ylabel = "healthcare";
  } else {
    var ylabel = "age"
  }

  var toolTip = d3
    .tip() //generate tooptTip, hover text on the circle
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", function(dataFunc) {
      toolTip.show(dataFunc, this);
    })
    // onmouseout event
    .on("mouseout", function(dataFunc, index) {
      toolTip.hide(dataFunc, this);
    });

  return circlesGroup;
}

// Import the data
d3.csv("assets/data/data.csv", function(error, data) {
  if (error) throw error;
    // console.log(data);

  // Parse the data, converting all the params (strings) into numbers, overwritig it in the object
  data.forEach(function(dataFunc) {
    dataFunc.healthcare = +dataFunc.healthcare;
    dataFunc.age = +dataFunc.age;
    dataFunc.poverty = +dataFunc.poverty;
    dataFunc.income = +dataFunc.income;
});

  // xLinearScale function above csv import domain and range, xScale is constructing the LinearScale, depends on chosen xAxis
  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);

  // Create y scale function, is not going to change 
  // var yLinearScale = d3
  //   .scaleLinear()
  //   .domain([0, d3.max(data, d => d.healthcare)])
  //   .range([height, 0]);

  // Create initial axis functions (axisBottom is a d3 function that creates the XAXis
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup
    .append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g").call(leftAxis); 

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  var circletext = chartGroup.append("text")
    .selectAll("tspan")
    .data(data)
    .enter()
    .append("tspan")
    .attr("x", d => xLinearScale(d[chosenXAxis]-0.2))
    .attr("y", d => yLinearScale(d[chosenYAxis]-0.2))
    .attr("font-size", "10px")
    // .attr("text-anchor", "middle")
    .attr("fill", "black")
    .text(function(d) {
      return d.abbr;
    });
  
  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty Rate (%)");

  var incomeLabel = labelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income Rate");

  var healthcareLabel = labelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Healthcare Rate");

  var ageLabel = labelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age");

  // append y axis
  chartGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Data");  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~???????????


    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text").on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {
      // replaces chosenXAxis with value
      chosenXAxis = value;

      // updates x scale for new data
      xLinearScale = xScale(data, chosenXAxis);

      // updates x axis with transition
      xAxis = renderAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

      // updates circles text with new x values
      circletext = renderCirclestext(circletext, xLinearScale, chosenXAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "poverty") {
        povertyLabel.classed("active", true).classed("inactive", false);
        incomeLabel.classed("active", false).classed("inactive", true);
      } else {
        povertyLabel.classed("active", false).classed("inactive", true);
        incomeLabel.classed("active", true).classed("inactive", false);
      }
    };
    // y axis labels event listener  
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {
      // replaces chosenXAxis with value
      chosenYAxis = value;

      // updates x scale for new data
      yLinearScale = yScale(data, chosenYAxis);

      // updates x axis with transition
      yAxis = renderAxes(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

      // updates circles text with new x values
      circletext = renderCirclestext(circletext, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "healthcare") {
        healthcareLabel.classed("active", true).classed("inactive", false);
        ageLabel.classed("active", false).classed("inactive", true);
      } else {
        healthcareLabel.classed("active", false).classed("inactive", true);
        ageLabel.classed("active", true).classed("inactive", false);
      }
       
    }
  });
});

