async function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel
  // Populate data in the Sample MetaData
  // Use `d3.json` to fetch the metadata for a sample
  let sample_x = d3.select("#selDataset").node().value;
    // Use d3 to select the panel with id of `#sample-metadata`
  let url = `/metadata/${sample_x}`;
    // Use `.html("") to clear any existing metadata
  d3.select("#sample-metadata").html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
  let data = await d3.json(url);
  console.log(data);

  const metadata = d3.select("#sample-metadata");
  const tbody = metadata.append("tbody");
  
  for (key in data){
      row = tbody.append("tr");
      const cell = tbody.append("td");
      cell.text(`${key}: ${data[key]}`);
  }
  // ----------------------------------------



  // BONUS: Build the Gauge Chart
  // buildGauge(data.WFREQ);
  var washings = data.WFREQ
  console.log(washings)
  
// Enter a speed between 0 and 180
let level = washings*20;

// Trig to calc meter point
var degrees = 180 - level,
     radius = .5;
var radians = degrees * Math.PI / 180;
var x = radius * Math.cos(radians);
var y = radius * Math.sin(radians);

// Path: may have to change to create a better triangle
var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
     pathX = String(x),
     space = ' ',
     pathY = String(y),
     pathEnd = ' Z';
var path = mainPath.concat(pathX,space,pathY,pathEnd);

var data3 = [{ type: 'scatter',
   x: [0], y:[0],
    marker: {size: 28, color:'850000'},
    showlegend: false,
    name: 'Meter',
    text: washings,
    hoverinfo: 'text+name'},
  { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9,50/9, 50/9, 50/9, 50],
  rotation: 90,
  text: ['8-9', '7-8', '6-7', '5-6',
            '4-5', '3-4', '2-3', '1-2', '0-1', ''],
  textinfo: 'text',
  textposition:'inside',
  marker: {colors:['rgba(8, 107, 0, .5)', 'rgba(10, 117, 0, .5)','rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                         'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                         'rgba(210, 206, 145, .5)', 'rgba(222, 216, 160, .5)','rgba(232, 226, 202, .5)',
                         'rgba(255, 255, 255, 0)']},
  labels: ['Spotless!', 'Super Clean', 'Fairly Clean', 'Getting Cleaner', 'Half way There', 'Pretty Dirty', 'Dirty', 'Still Filthy', 'Filthy'],
  hoverinfo: 'label',
  hole: .5,
  type: 'pie',
  showlegend: false
}];

var layout = {
  shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
  title: '<b>Belly Button Washing Frequency</b> <br> Scrubs Per Week',
  height: 500,
  width: 500,
  xaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]},
  yaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]}
};

Plotly.newPlot('gauge', data3, layout);



// ------------------------------------------
}

async function buildCharts(sample) {

  // Use `d3.json` to fetch the sample data for the plots
  let sample_x = d3.select("#selDataset").node().value;
  let url = `/samples/${sample_x}`;
  let data = await d3.json(url);
  console.log(data);
  // Build a Bubble Chart using the sample data

  // create trace with the ids and values
  const maxVal = data.sample_values.slice(0,1)
  const trace1 = {
    x: data.otu_ids,
    y: data.sample_values,
    text: data.otu_labels,
    mode: 'markers',
    marker: {
      size: data.sample_values,
      sizeref: 2*(maxVal)/(90**2),
      sizemin: 4,
      sizemode: 'area',
      color: data.otu_ids,
      colorscale: 'Viridis'
    }
  }

  const data_sample = [trace1]

  const layout = {
    title: `Bacteria for Sample ${sample_x}`,
    xaxis: { title: "OTU ID" }
  };

  Plotly.newPlot("bubble", data_sample, layout);
  
  
  // Build a Pie Chart  
  // d3.select(".legend").selectAll(".groups").html("")
  

  const trace2 = {
    values: data.sample_values.slice(0,10),
    labels: data.otu_ids.slice(0,10),
    hovertext: data.otu_labels.slice(0,10),
    text: "",
    type: "pie"
  };

  const pieData = [trace2]

  const layout2 = {
      height: 500,
      width: 500
  };

  Plotly.newPlot("pie", pieData, layout2);

  }

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
