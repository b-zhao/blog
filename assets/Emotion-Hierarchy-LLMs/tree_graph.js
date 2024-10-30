var treeDatas = [
    { data: treeData_llama405, label: "Llama-405B"},
    { data: treeData_llama70, label: "Llama-70B"},
    { data: treeData_llama8, label: "Llama-8B"},
    { data: treeData_gpt2, label: "GPT2"},
];

var selector0 = d3.select("#treeSelector");
treeDatas.forEach(function(treeData, index0) {
    selector0.append("option")
        .attr("value", index0)
        .text(treeData.label);
});

var width0 = 1200;
var height0 = 430;

var currentIndex = 0;
d3.select("#chart0").selectAll("*").remove();
drawTree(treeDatas[currentIndex].data);

selector0.on("change", function() {
    currentIndex = +this.value;
    d3.select("#chart0").selectAll("*").remove();
    drawTree(treeDatas[currentIndex].data);
});


function scale(value, minOriginal, maxOriginal, minTarget, maxTarget) {
    return ((value - minOriginal) / (maxOriginal - minOriginal)) * (maxTarget - minTarget) + minTarget;
}

function drawTree(graphData) {
    var xValues = graphData.nodes.map(node => node.x);
    var yValues = graphData.nodes.map(node => node.y);

    var minX = Math.min(...xValues) - 60;
    var maxX = Math.max(...xValues) + 60;
    var minY = Math.min(...yValues) - 60;
    var maxY = Math.max(...yValues) + 60;


    graphData.nodes.forEach(node => {
        node.x = scale(node.x, minX, maxX, 0, width0);
        node.y = scale(node.y, minY, maxY, 0, height0);
    });

    var xValues_initial_p = graphData.nodes.map(node => node.initialX);
    var yValues_initial_p = graphData.nodes.map(node => node.initialY);
    var minX_initial_p = Math.min(...xValues_initial_p) - 300;
    var maxX_initial_p = Math.max(...xValues_initial_p) + 300;
    var minY_initial_p = Math.min(...yValues_initial_p) - 60;
    var maxY_initial_p = Math.max(...yValues_initial_p) + 60;

    graphData.nodes.forEach(node => {
        node.initialX = scale(node.initialX, minX_initial_p, maxX_initial_p, 0, width0);
        node.initialY = scale(node.initialY, minY_initial_p, maxY_initial_p, 0, height0);
    });

    var svg = d3.select("#chart0").append("svg")
        .attr("width", width0)
        .attr("height", height0);

    /*
    // Center of the SVG
    var centerX = width0 / 2;
    var centerY = height0 / 2;
    var radius = 150; // Radius of the initial circular layout

    // Sort nodes by color for circular arrangement
    graphData.nodes.sort((a, b) => a.color.localeCompare(b.color));

    // Calculate the angle increment for arranging nodes in a circle
    var angleIncrement = (2 * Math.PI) / graphData.nodes.length;

    // Assign initial circular positions based on sorted colors
    graphData.nodes.forEach((node, index1) => {
        var angle = index1 * angleIncrement;
        node.initialX = centerX + radius * Math.cos(angle);
        node.initialY = centerY + radius * Math.sin(angle);
    });
    */

    var link = svg.selectAll(".link")
        .data(graphData.links)
        .enter().append("line")
        .attr("class", "link")
        .style("opacity", 0.5)
        .style("stroke", "#999")
        .style("stroke-width", 1)
        // Start the links from circular positions
        .attr("x1", d => graphData.nodes.find(node => node.id === d.source).initialX)
        .attr("y1", d => graphData.nodes.find(node => node.id === d.source).initialY)
        .attr("x2", d => graphData.nodes.find(node => node.id === d.target).initialX)
        .attr("y2", d => graphData.nodes.find(node => node.id === d.target).initialY);

    var node = svg.selectAll(".node")
        .data(graphData.nodes)
        .enter().append("g")
        .attr("class", "node")
        // Start nodes at circular positions
        .attr("transform", d => `translate(${d.initialX}, ${d.initialY})`);

    node.append("circle")
        .attr("r", 10)
        .style("opacity", 0.7)
        .style("fill", d => d.color)
        .style("stroke", "none");

    var labels = node.append("text")
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
    function highlightEdges(nodeId) {
        // Reset all edges to default styling
        link.style("stroke", "#999")
            .style("stroke-width", 3)
            .style("opacity", 0.5);

        // Highlight the edges connected to the clicked node
        link.filter(d => d.source === nodeId || d.target === nodeId)
            .style("stroke", "#f00") // Change to a different color (e.g., red)
            .style("stroke-width", 3) // Increase stroke width for visibility
            .style("opacity", 1);
    }

    // Animate the transition to final positions
    function animateGraph() {
        link.transition()
            .duration(500)
            .attr("x1", d => graphData.nodes.find(node => node.id === d.source).x)
            .attr("y1", d => graphData.nodes.find(node => node.id === d.source).y)
            .attr("x2", d => graphData.nodes.find(node => node.id === d.target).x)
            .attr("y2", d => graphData.nodes.find(node => node.id === d.target).y);

        node.transition()
            .duration(500)
            .attr("transform", d => `translate(${d.x}, ${d.y})`);
    }

    setTimeout(animateGraph, 1000);
}


