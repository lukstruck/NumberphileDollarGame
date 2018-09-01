let network;
let current_data;
let sum;

$(() => {
    let container = $('#content')[0];

    let data = generateRandomGraph();
    let options = {
        autoResize: true,
        interaction: {
            navigationButtons: true,
            dragNodes: false
        }
    };

// initialize your network!
    network = new vis.Network(container, data, options);
    newGraph();

    network.on("selectNode", object => {
        if ($("#clickAction option:checked").attr("id") == 0) {
            giveFromSelection(object);
        } else {
            takeIntoSelection(object);
        }
        network.unselectAll();
        checkIfWin();
    });
});

const MIN_NODES = 3;
const MAX_NODES = 20 - MIN_NODES;
const MAX_ADDITIONAL_EDGES = 10;
const MAX_VALUE_RADIUS = 5;

function generateRandomGraph() {
    const nodes = Math.floor(Math.random() * MAX_NODES + MIN_NODES);
    const additional_edges = Math.floor(Math.random() * (MAX_ADDITIONAL_EDGES + nodes));
    let data_nodes = [];
    let data_edges = [];
    let current_sum = 0;
    for (let i = 0; i < nodes; i++) {
        let adder = -current_sum + 1;
        let val = Math.floor(Math.random() * 2 * MAX_VALUE_RADIUS - MAX_VALUE_RADIUS + adder);
        current_sum += val;
        data_nodes.push({id: i + 1, label: "" + val});
        if (i !== 0)
            data_edges.push({id: i + 1, from: Math.floor(Math.random() * i + 1), to: i + 1})
    }
    for (let i = nodes; i < nodes + additional_edges; i++) {
        let from = Math.floor(Math.random() * nodes + 1);
        let to = Math.floor(Math.random() * nodes + 1);
        if (!data_edges.find((edge) => {
            return edge.from === from && edge.to === to || edge.to === from && edge.from === to;
        }) && from !== to) {
            data_edges.push({id: i + 1, from: from, to: to});
        }
    }
    sum = current_sum;
    return {
        nodes: new vis.DataSet(data_nodes),
        edges: new vis.DataSet(data_edges)
    }
}

function newGraph() {
    do {
        current_data = generateRandomGraph();
    } while (current_data.edges.length - current_data.nodes.length + 1 > sum && Math.random() * 10 < 8);
    network.setData(current_data);
    console.info("current sum: ", sum);
    console.info("current nodes: ", current_data.nodes.length);
    console.info("current edges: ", current_data.nodes.length);
}

function takeIntoSelection(data) {
    let selected_node = current_data.nodes.get(data.nodes[0]);
    let connected_edges = data.edges.map(edge => current_data.edges.get(edge));

    selected_node.label = parseInt(selected_node.label) + connected_edges.length + "";
    current_data.nodes.update(selected_node);
    connected_edges.forEach(edge => {
        let otherId = edge.from === selected_node.id ? edge.to : edge.from;
        let otherNode = current_data.nodes.get(otherId);
        otherNode.label = parseInt(otherNode.label) - 1 + "";
        current_data.nodes.update(otherNode);
    });
}

function giveFromSelection(data) {
    let selected_node = current_data.nodes.get(data.nodes[0]);
    let connected_edges = data.edges.map(edge => current_data.edges.get(edge));

    selected_node.label = parseInt(selected_node.label) - connected_edges.length + "";
    current_data.nodes.update(selected_node);
    connected_edges.forEach(edge => {
        let otherId = edge.from === selected_node.id ? edge.to : edge.from;
        let otherNode = current_data.nodes.get(otherId);
        otherNode.label = parseInt(otherNode.label) + 1 + "";
        current_data.nodes.update(otherNode);
    });
}

function checkIfWin() {
    let t = current_data.nodes.get({
        filter: node => {
            return parseInt(node.label) < 0
        }
    });
    if (t.length === 0) {
        current_data.nodes.add({id: 0, label: "WIN!"});
        console.info("WIN!");
    }
}