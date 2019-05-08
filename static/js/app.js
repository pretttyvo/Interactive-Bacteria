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
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
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

  const pieData = [{
    values: data.sample_values.slice(0,10),
    labels: data.otu_ids.slice(0,10),
    hovertext: data.otu_labels.slice(0,10),
    type: "pie"
}];

const layout2 = {
    height: 600,
    width: 800
};

Plotly.plot("pie", pieData, layout2);
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
