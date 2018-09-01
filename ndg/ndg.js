let MIN_NODES = 3;
let MAX_NODES = 10;
let MAX_ADDITIONAL_EDGES = 5;
let VALUE_RADIUS = 5;
let WINNABLE_PERCENTAGE = 1;

let network;
let current_data;
let reset_nodes;
let sum;

$(() => {

    $("#maxNodes").val(MAX_NODES);
    $("#minNodes").val(MIN_NODES);
    $("#maxAddEdges").val(MAX_ADDITIONAL_EDGES);
    $("#valueRadius").val(VALUE_RADIUS);
    $("#winnablePercentage").val(WINNABLE_PERCENTAGE);

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
    colorNodes();
    checkIfWin();

    network.on("selectNode", object => {
        if ($("#clickAction").attr("data-value") == 0) {
            giveFromSelection(object);
        } else {
            takeIntoSelection(object);
        }
        network.unselectAll();
        colorNodes();
        checkIfWin();
    });

});

function generateRandomGraph() {
    const nodes = Math.floor(Math.random() * (MAX_NODES - MIN_NODES) + MIN_NODES);
    const additional_edges = Math.floor(Math.random() * (MAX_ADDITIONAL_EDGES + nodes));
    let data_nodes = [];
    let data_edges = [];
    let current_sum = 0;
    for (let i = 0; i < nodes; i++) {
        let adder = -current_sum;
        let val = Math.floor(Math.random() * 2 * VALUE_RADIUS - VALUE_RADIUS + adder);
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
    reset_nodes = data_nodes;
    return {
        nodes: new vis.DataSet(data_nodes),
        edges: new vis.DataSet(data_edges)
    }
}

function newGraph() {
    MAX_NODES = parseInt($("#maxNodes").val());
    MIN_NODES = parseInt($("#minNodes").val());
    MAX_ADDITIONAL_EDGES = parseInt($("#maxAddEdges").val());
    VALUE_RADIUS = parseInt($("#valueRadius").val());
    WINNABLE_PERCENTAGE = parseFloat($("#winnablePercentage").val());

    do {
        current_data = generateRandomGraph();
    } while (current_data.edges.length - current_data.nodes.length + 1 > sum && Math.random() < WINNABLE_PERCENTAGE);
    network.setData(current_data);
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
        current_data.nodes.add({id: 0, label: "WIN!", color: "green", size: 100, shape: "star"});
        console.info("WIN!");
    }
}

function resetGraph() {
    current_data.nodes.clear();
    current_data.nodes.add(reset_nodes);
}

function toggleClickAction() {
    let button = $("#clickAction");
    let curVal = parseInt(button.attr("data-value"));
    let newVal = (curVal + 1) % 2;
    let text = ["Give money to connected node", "Take money from connected node"];
    button.attr("data-value", newVal);
    button.html(text[newVal]);
}

function colorNodes(){
    current_data.nodes.get().forEach(node => {
        if(parseInt(node.label) < 0)
            node.color = "LightCoral";
        else
            node.color = "LightGreen";
        current_data.nodes.update(node);
    })
}