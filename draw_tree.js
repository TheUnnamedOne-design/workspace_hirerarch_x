function updateVisualization() {
    document.getElementById("workspaceTree").innerHTML = ""; // Clear existing tree

    const width = 800, height = 600;
    const svg = d3.select("#workspaceTree")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform", "translate(50,50)");

    const hierarchyData = d3.hierarchy({ name: rootName, children: rootWorkspaces }, d => d.children);
    const treeLayout = d3.tree().size([width - 100, height - 200]);
    const treeData = treeLayout(hierarchyData);

    const links = svg.selectAll(".link")
                     .data(treeData.links())
                     .enter()
                     .append("line")
                     .attr("class", "link")
                     .attr("x1", d => d.source.x)
                     .attr("y1", d => d.source.y)
                     .attr("x2", d => d.target.x)
                     .attr("y2", d => d.target.y);

    const nodes = svg.selectAll(".node")
                     .data(treeData.descendants())
                     .enter()
                     .append("g")
                     .attr("transform", d => `translate(${d.x}, ${d.y})`)
                     .on("click", (event, d) => {
                         if (d.data.id) navigateToWorkspace(d.data.id);
                     })
                     .call(d3.drag()
                         .on("start", dragStarted)
                         .on("drag", dragged)
                         .on("end", dragEnded));

    nodes.append("circle")
         .attr("r", 10)
         .attr("fill", "steelblue");

    nodes.append("text")
         .attr("dy", -15)
         .attr("text-anchor", "middle")
         .text(d => d.data.name);
}

function navigateToWorkspace(id) {
    alert(`Navigating to workspace: ${workspaceMap[id].name}`);
    // You can redirect to a different page or update UI
}

function dragStarted(event, d) {
    d3.select(this).raise().attr("stroke", "black");
}

function dragged(event, d) {
    d3.select(this).attr("transform", `translate(${event.x}, ${event.y})`);
}

function dragEnded(event, d) {
    d3.select(this).attr("stroke", null);
}
