var treeDatas_persona = [
    { data: treeData_neutral, label: "Neutral" },
    { data: treeData_asd, label: "ASD" },
    { data: treeData_female, label: "Female" },
    { data: treeData_male, label: "Male" },
    { data: treeData_disable, label: "Physically-disabled" }, 
    { data: treeData_income_low, label: "Low income" }, 
    { data: treeData_income_high, label: "High income" },
    { data: treeData_education_low, label: "Low education" }, 
    { data: treeData_education_high, label: "High education" }
];

var selector2 = d3.select("#treeSelector_persona");
treeDatas_persona.forEach(function(treeData_persona, index2) {
    selector2.append("option")
        .attr("value", index2)
        .text(treeData_persona.label);
});

var width2 = 1400;
var height2 = 430;

var currentIndex_persona = 0;
d3.select("#chart2").selectAll("*").remove();
drawTree_p(treeDatas_persona[currentIndex_persona].data);

selector2.on("change", function() {
    currentIndex_persona = +this.value;
    d3.select("#chart2").selectAll("*").remove();
    drawTree_p(treeDatas_persona[currentIndex_persona].data);
});


function scale(value, minOriginal, maxOriginal, minTarget, maxTarget) {
    return ((value - minOriginal) / (maxOriginal - minOriginal)) * (maxTarget - minTarget) + minTarget;
}

function drawTree_p(graphData_p) {

    var xValues_p = graphData_p.nodes.map(node => node.x);
    var yValues_p = graphData_p.nodes.map(node => node.y);
    var minX_p = Math.min(...xValues_p) - 60;
    var maxX_p = Math.max(...xValues_p) + 60;
    var minY_p = Math.min(...yValues_p) - 60;
    var maxY_p = Math.max(...yValues_p) + 60;

    graphData_p.nodes.forEach(node => {
        node.x = scale(node.x, minX_p, maxX_p, 0, width2);
        node.y = scale(node.y, minY_p, maxY_p, 0, height2);
    });

    var xValues_initial_p = graphData_p.nodes.map(node => node.initialX);
    var yValues_initial_p = graphData_p.nodes.map(node => node.initialY);
    var minX_initial_p = Math.min(...xValues_initial_p) - 300;
    var maxX_initial_p = Math.max(...xValues_initial_p) + 300;
    var minY_initial_p = Math.min(...yValues_initial_p) - 60;
    var maxY_initial_p = Math.max(...yValues_initial_p) + 60;

    graphData_p.nodes.forEach(node => {
        node.initialX = scale(node.initialX, minX_initial_p, maxX_initial_p, 0, width2);
        node.initialY = scale(node.initialY, minY_initial_p, maxY_initial_p, 0, height2);
    });

    var svg_p = d3.select("#chart2").append("svg")
        .attr("width", width2)
        .attr("height", height2);

    /*
    // Center of the SVG
    var centerX = width2 / 2;
    var centerY = height2 / 2;
    var radius = 150; // Radius of the initial circular layout

    // Sort nodes by color for circular arrangement
    graphData_p.nodes.sort((a, b) => a.color.localeCompare(b.color));

    // Calculate the angle increment for arranging nodes in a circle
    var angleIncrement = (2 * Math.PI) / graphData_p.nodes.length;

    // Assign initial circular positions based on sorted colors
    graphData_p.nodes.forEach((node, index1) => {
        var angle = index1 * angleIncrement;
        node.initialX = centerX + radius * Math.cos(angle);
        node.initialY = centerY + radius * Math.sin(angle);
    });
    */

    var link_p = svg_p.selectAll(".link")
        .data(graphData_p.links)
        .enter().append("line")
        .attr("class", "link")
        .style("opacity", 0.5)
        .style("stroke", "#999")
        .style("stroke-width", 1)
        // Start the links from circular positions
        .attr("x1", d => graphData_p.nodes.find(node => node.id === d.source).initialX)
        .attr("y1", d => graphData_p.nodes.find(node => node.id === d.source).initialY)
        .attr("x2", d => graphData_p.nodes.find(node => node.id === d.target).initialX)
        .attr("y2", d => graphData_p.nodes.find(node => node.id === d.target).initialY);

    var node_p = svg_p.selectAll(".node")
        .data(graphData_p.nodes)
        .enter().append("g")
        .attr("class", "node")
        // Start nodes at circular positions
        .attr("transform", d => `translate(${d.initialX}, ${d.initialY})`);

    node_p.append("circle")
        .attr("r", 10)
        .style("opacity", 0.7)
        .style("fill", d => d.color)
        .style("stroke", "none");

    var labels_p = node_p.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("dx", 0)
        .text(d => d.id)
        .style("font-size", "12px")
        .style("fill", "#333")
        .attr("transform", "rotate(-45)")
        .on("click", function(event, d) {
            highlightEdges(d.id);
        });

    // Function to highlight edges connected to a specific node
    function highlightEdges(nodeId_p) {
        link_p.style("stroke", "#999")
            .style("stroke-width", 3)
            .style("opacity", 0.5);

        link_p.filter(d => d.source === nodeId_p || d.target === nodeId_p)
            .style("stroke", "#f00") // Change to a different color (e.g., red)
            .style("stroke-width", 3) // Increase stroke width for visibility
            .style("opacity", 1);
    }

    // Animate the transition to final positions
    function animateGraph() {
        link_p.transition()
            .duration(500)
            .attr("x1", d => graphData_p.nodes.find(node => node.id === d.source).x)
            .attr("y1", d => graphData_p.nodes.find(node => node.id === d.source).y)
            .attr("x2", d => graphData_p.nodes.find(node => node.id === d.target).x)
            .attr("y2", d => graphData_p.nodes.find(node => node.id === d.target).y);

        node_p.transition()
            .duration(500)
            .attr("transform", d => `translate(${d.x}, ${d.y})`);
    }

    setTimeout(animateGraph, 1000);
}


