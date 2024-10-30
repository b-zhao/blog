/*//////////////////////////////////////////////////////////
////////////////// Set up the Data /////////////////////////
//////////////////////////////////////////////////////////*/
var matrices = [
    { data: matrix_neutral, label: "Neutral" },
    { data: matrix_female, label: "Female" },
    { data: matrix_male, label: "Male" },
    { data: matrix_asian, label: "Asian" },
    { data: matrix_american, label: "American" },
    { data: matrix_disable, label: "Physically-disabled" }, 
    { data: matrix_income_low, label: "Low income" }, 
    { data: matrix_income_high, label: "High income" },
    { data: matrix_education_low, label: "Low education" }, 
    { data: matrix_education_high, label: "High education" }
];

/*Initiate the color scale*/
var fill = d3.scale.ordinal()
    .domain(d3.range(NameProvider.length))
    .range(colors);


var selector1 = d3.select("#matrixSelector");
matrices.forEach(function(matrixData, index) {
    selector1.append("option")
        .attr("value", index)
        .text(matrixData.label);
});

var currentIndex = 0;
d3.select("#chart1").selectAll("*").remove();
drawChordDiagram(matrices[currentIndex].data, matrices[currentIndex].label, 1);

selector1.on("change", function() {
    currentIndex = +this.value;
    d3.select("#chart1").selectAll("*").remove();
    drawChordDiagram(matrices[currentIndex].data, matrices[currentIndex].label, 1);
});
/*
matrices.forEach(function(matrixData, index) {
    var containerId = index;
    var matrix = matrices[index].data
    var label = matrices[index].label
    drawChordDiagram(matrix, label, containerId);
});
*/

/*//////////////////////////////////////////////////////////
/////////////// Initiate Chord Diagram /////////////////////
//////////////////////////////////////////////////////////*/
var counter = 1,
    opacityValueBase = 0.7,
    opacityValue = 0.3;

function drawChordDiagram(matrix, label, containerId) {

    var margin = {top: 100, right: 70, bottom: 80, left: 70},
        width = 730 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom,
        innerRadius = Math.min(width, height) * .42,
        outerRadius = innerRadius * 1.04;

    /*Initiate the SVG*/
    var svg = d3.select("#chart1").append("svg:svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    	.append("svg:g")
        .attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top + height/2) + ")");
    
    var chord = d3.layout.chord()
        .padding(.025)
        .sortSubgroups(d3.descending) /*sort the chords inside an arc from high to low*/
        .sortChords(d3.descending) /*which chord should be shown on top when chords cross. Now the biggest chord is at the bottom*/
    	.matrix(matrix);
    
    /*//////////////////////////////////////////////////////////
    ////////////////// Draw outer Arcs /////////////////////////
    //////////////////////////////////////////////////////////*/
    var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
    	
    var g = svg.selectAll("g.group")
    	.data(chord.groups)
    	.enter().append("svg:g")
    	.attr("class", function(d) {return "group " + NameProvider[d.index];});
    	
    g.append("svg:path")
    	  .attr("class", "arc")
    	  .style("stroke", function(d) { return fill(d.index); })
    	  .style("fill", function(d) { return fill(d.index); })
    	  .attr("d", arc)
    	  .style("opacity", 0)
    	  .transition().duration(100)
    	  .style("opacity", 0.4);
    
    /*//////////////////////////////////////////////////////////
    ////////////////// Initiate Ticks //////////////////////////
    //////////////////////////////////////////////////////////*/
    var ticks = svg.selectAll("g.group").append("svg:g")
    	.attr("class", function(d) {return "ticks " + NameProvider[d.index];})
    	.selectAll("g.ticks")
    	.attr("class", "ticks")
        .data(groupTicks)
    	.enter().append("svg:g")
        .attr("transform", function(d) {
          return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
              + "translate(" + outerRadius+35 + ",0)";
        });
    
    /*Append the tick around the arcs*/
    ticks.append("svg:line")
    	.attr("x1", 1)
    	.attr("y1", 0)
    	.attr("x2", 5)
    	.attr("y2", 0)
    	.attr("class", "ticks")
    	.style("stroke", "#FFF");
    	
    /*Add the labels for the %'s*/
    ticks.append("svg:text")
    	.attr("x", 8)
    	.attr("dy", ".1em")
    	.attr("class", "tickLabels")
    	.attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
    	.style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .style("font-size", "7px")
    	.text(function(d) { return d.label; })
    	.attr('opacity', 0);
    	
    /*//////////////////////////////////////////////////////////
    ////////////////// Initiate Names //////////////////////////
    //////////////////////////////////////////////////////////*/
    g.append("svg:text")
       .each(function(d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
            d.fontSize = Math.max(7, Math.min(16, Math.abs(d.startAngle - d.endAngle) * 50)); // Adjust scaling factors as needed
          })
      .attr("dy", ".3em")
      .style("font-size", function(d) { return d.fontSize + "px"; })
      .attr("class", "titles")
      .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .attr("transform", function(d) {
    		return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
    		+ "translate(" + (innerRadius + 45) + ")"
    		+ (d.angle > Math.PI ? "rotate(180)" : "");
      })
      .attr('opacity', 0)
      .text(function(d,i) { return NameProvider[i]; });  
    
    /*//////////////////////////////////////////////////////////
    //////////////// Initiate inner chords /////////////////////
    //////////////////////////////////////////////////////////*/
    var chords = svg.selectAll("path.chord")
    	.data(chord.chords)
    	.enter().append("svg:path")
    	.attr("class", "chord")
    	/*.style("stroke", function(d) { return d3.rgb(fill(d.source.index)).darker(); })*/
    	.style("stroke", function(d) { return fill(d.source.index); })
            .style("stroke-width", "0.3px")
    	.style("fill", function(d) { return fill(d.source.index); })
    	.attr("d", d3.svg.chord().radius(innerRadius))
    	.attr('opacity', 0);
    
    
    /*//////////////////////////////////////////////////////////	
    /////////// Initiate the Center Texts //////////////////////
    //////////////////////////////////////////////////////////*/
    /*Create wrapper for center text*/
    var textCenter = svg.append("g").attr("class", "explanationWrapper");
    
    /*Starting text middle top*/
    var middleTextTop = textCenter.append("text")
    	.attr("class", "explanation")
    	.attr("text-anchor", "middle")
    	.attr("x", 0 + "px")
    	.attr("y", 0 + "px")
    	.attr("dy", "1em")
    	.attr("opacity", 1)
    	.text(label)
    	.call(wrap, 350);

    setTimeout(function() {
        finalChord(svg, chords);
    }, 20);
};


function finalChord(svg, chords) {

	/*changeTopText(newText = "",
		loc = 0, delayDisappear = 0, delayAppear = 1);*/

	/*Remove button*/
	/*d3.select("#clicker" + containerId)
		.style("visibility", "hidden");
	d3.select("#skip")
		.style("visibility", "hidden");
	d3.select("#progress")
		.style("visibility", "hidden");*/
	
	/*Create arcs or show them, depending on the point in the visual*/
	svg.selectAll("g.group").select("path")
		.transition().duration(100)
		.style("opacity", 1);
	
	/*Make mouse over and out possible*/
	/*d3.selectAll(".group")
		.on("mouseover", fade(.02, svg))
		.on("mouseout", fade(.80, svg));*/
    
        d3.select("#chart1").selectAll(".group")
            .on("mouseover", function(d, i) {
                fade(.02, svg)(d, i);
            })
            .on("mouseout", function(d, i) {
                fade(.80, svg)(d, i);
            });
		
	/*Show all chords*/
	chords.transition().duration(100)
		.style("opacity", opacityValueBase);

	/*Show all the text*/
	d3.selectAll("g.group").selectAll("line")
		.transition().duration(100)
		.style("stroke","#000");
	/*Same for the %'s*/
	svg.selectAll("g.group")
		.transition().duration(100)
		.selectAll(".tickLabels").style("opacity",1);
	/*And the Names of each Arc*/	
	svg.selectAll("g.group")
		.transition().duration(100)
		.selectAll(".titles").style("opacity",1);
};/*finalChord*/


/*//////////////////////////////////////////////////////////
////////////////// Extra Functions /////////////////////////
//////////////////////////////////////////////////////////*/
function endall(transition, callback) { 
    var n = 0; 
    transition 
        .each(function() { ++n; }) 
        .each("end", function() { if (!--n) callback.apply(this, arguments); }); 
};/*endall*/ 

/*Returns an event handler for fading a given chord group*/
function fade(opacity, svg) {
  return function(d, i) {
    svg.selectAll("path.chord")
        .filter(function(d) { return d.source.index != i && d.target.index != i; })
		.transition()
        .style("stroke-opacity", opacity)
        .style("fill-opacity", opacity);
  };
};/*fade*/

/*Returns an array of tick angles and labels, given a group*/
function groupTicks(d) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, 1).map(function(v, i) {
    return {
      angle: v * k + d.startAngle,
      label: i % 2 ? null : v + "%" 
    };
  });
};/*groupTicks*/

/*Taken from http://bl.ocks.org/mbostock/7555321
//Wraps SVG text*/
function wrap(text, width) {
    var text = d3.select(this)[0][0],
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.4, 
        y = text.attr("y"),
		x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
		
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      };
    };  
};

