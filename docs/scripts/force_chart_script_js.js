import define1 from "./scrubber_file_js.js";

function _1(md){return(
md`force-chart`
)}

function _time(Scrubber,times){return(
Scrubber(times, {
  delay: 200, 
  loop: true,
  format: date => date.toLocaleString("en", {
    year: "numeric", 
    month: "long", 
    // day: "numeric"
    // hour: "numeric",
    // minute: "numeric",
    // timeZone: "UTC"
  })
})
)}

function _chart(d3,invalidation,drag)
{
  const width = 740;
  const height = 350;

  const simulation = d3.forceSimulation()
      .force("charge", d3.forceManyBody())
      .force("link", d3.forceLink().id(d => d.id))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .on("tick", ticked);

  const svg = d3.create("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");

  let link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll("line");

  let node = svg.append("g")
      .attr("stroke", "#fff")
      // .attr("fill", "#10e838")
      // .attr("stroke", "#eb4034")
      // .attr("stroke-width", 20)
      // .attr("stroke-width", 1.5)
      .attr("stroke-width", 0.5)
    .selectAll("circle");

  function getNodeFill(node) {
    // return node.id === 1 ? 'blue' : 'gray'
    return node.id === 1467 ? 'blue' : 'gray'
  }

  function getNodeColor(nodes) {
    // return node.id === 1 ? 'blue' : 'gray'
    return nodes.id === "1467" ? 'blue' : 'yellow'
  }

   function getNodeAgency(node) {
    // return node.ag === 1 ? 'blue' : 'gray'
    // return node.ag === 'p' ? '#008ccd' : '#f94144'
    if (node.ag === 'p') return '#008ccd'; // Blue for 'p'
    if (node.ag === 'f') return '#f94144'; // Red for 'f'
    if (node.ag === 'pr') return '#99dfff';    // Blue for 'a'
    if (node.ag === 'fr') return '#fcaeaf';   // Green for 'b'
    return 'gray'; 
  }

  function getNodeLabel(node) {
    // return node.id === 1 ? 'blue' : 'gray'
    return node.ag === 'p' ? "rgba(0, 140, 205, 0.7)" : "rgba(249, 65, 68, 0.7)"
  }

  function getNodeSize(node) {
  // return Math.sqrt(parseInt(node.ct) || 1) * 2;
    return Math.min(Math.max(5, 5 + (Math.sqrt(parseInt(node.ct) || 1) - 1) / (Math.sqrt(10500) - 1) * 10), 15)

}

  function ticked() {
    node.attr("cx", d => d.x)
        .attr("cy", d => d.y);

    link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
  }



  invalidation.then(() => simulation.stop());

  return Object.assign(svg.node(), {
    update({nodes, links}) {

      // Make a shallow copy to protect against mutation, while
      // recycling old nodes to preserve position and velocity.
      const old = new Map(node.data().map(d => [d.id, d]));
      nodes = nodes.map(d => ({...old.get(d.id), ... d}));
      links = links.map(d => ({...d}));

 




 node = node
  .data(nodes, d => d.id)
  .join(
    enter => enter.append("circle")
      .attr("r", getNodeSize) // Set initial radius
      .attr("fill", getNodeAgency)
      .call(drag(simulation))
      .on("mouseover", function (event, d) {
        // Create a group to hold the label and background rect
        const labelGroup = svg.append("g")
          .attr("class", "node-label-group");

        // Add background rectangle
        labelGroup.append("rect")
          .attr("class", "node-label-bg")
          .attr("x", d.x + 10) // Position slightly offset
          .attr("y", d.y - 20) // Adjust for text height
          .attr("rx", 4) // Rounded corners
          .attr("ry", 4)
          .attr("fill", "rgba(235, 239, 242, 0.9)");

        // Add text label
        labelGroup.append("text")
          .attr("class", "node-label")
          .attr("x", d.x + 10)
          .attr("y", d.y - 10)
          .attr("text-anchor", "start")
          .attr("font-size", "12px")
          .attr("fill", "#333")
          .text(d.ct === "" ? `${d.id} ` : `${d.id} (${d.ct} hired employees)`);

        // Dynamically adjust the background size based on text
        const textElement = labelGroup.select("text").node();
        const bbox = textElement.getBBox();
        labelGroup.select("rect")
          .attr("width", bbox.width + 6)
          .attr("height", bbox.height + 4)
          .attr("x", bbox.x - 3)
          .attr("y", bbox.y - 2);
      })
      .on("mouseout", function () {
        // Remove the label group on mouseout
        svg.selectAll(".node-label-group").remove();
      }),
    update => update
      .transition().duration(200) // Smooth transition for radius updates
      .attr("r", getNodeSize) // Update radius when data changes
    // .call(node => node.append("title").text(d => d.id))
    ); // Optional tooltip





      link = link
        .data(links, d => [d.source, d.target])
        .join("line");

      simulation.nodes(nodes);
      simulation.force("link").links(links);
      simulation.alpha(1).restart().tick();
      ticked(); // render now!



    }
  });
}


function _update(data,contains,time,chart)
{
  const nodes = data.nodes.filter(d => contains(d, time));
  const links = data.links.filter(d => contains(d, time));
  chart.update({nodes, links});
}


async function _data(FileAttachment,d3)
{
  const {nodes, links} = await FileAttachment("source_file_json.json").json();
  for (const d of [...nodes, ...links]) {
    d.start = d3.isoParse(d.start);
    d.end = d3.isoParse(d.end);
  };
  return {nodes, links};
}


function _times(d3,data,contains){return(
d3.scaleTime()
  .domain([d3.min(data.nodes, d => d.start), d3.max(data.nodes, d => d.end)])
  .ticks(116)
  .filter(time => data.nodes.some(d => contains(d, time)))
)}

function _contains(){return(
({start, end}, time) => start <= time && time < end
)}

function _drag(d3){return(
simulation => {
  
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["source_file_json.json", {url: new URL("./files/fire_police_nodes_links.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));

  // keeping this for troublshoting
  // main.variable(observer()).define(["md"], _1);
  // main.variable(observer("viewof time")).define("viewof time", ["Scrubber","times"], _time);
  // main.variable(observer("time")).define("time", ["Generators", "viewof time"], (G, _) => G.input(_));
  // main.variable(observer("chart")).define("chart", ["d3","invalidation","drag"], _chart);
  // main.variable(observer("update")).define("update", ["data","contains","time","chart"], _update);
  // main.variable(observer("data")).define("data", ["FileAttachment","d3"], _data);
  // main.variable(observer("times")).define("times", ["d3","data","contains"], _times);
  // main.variable(observer("contains")).define("contains", _contains);
  // main.variable(observer("drag")).define("drag", ["d3"], _drag);

  main.variable().define(["md"], _1);
  main.variable(observer("viewof time")).define("viewof time", ["Scrubber","times"], _time);
  main.variable().define("time", ["Generators", "viewof time"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["d3","invalidation","drag"], _chart);
  main.variable(observer("update")).define("update", ["data","contains","time","chart"], _update);
  main.variable().define("data", ["FileAttachment","d3"], _data);
  main.variable().define("times", ["d3","data","contains"], _times);
  main.variable().define("contains", _contains);
  main.variable().define("drag", ["d3"], _drag);

  const child1 = runtime.module(define1);
  main.import("Scrubber", child1);
  return main;
}
