let MIN_NODES = 3;
let MAX_NODES = 10;
let MAX_ADDITIONAL_EDGES = 5;
let VALUE_RADIUS = 5;
let WINNABLE_PERCENTAGE = 1;

let network;
let current_data;
let reset_nodes;
let sum;

let menuShown = false;

let currentTutorialProgress = 0;

let currentLevelWon = false;

let tutorialGraphs = [
    {
        name: "Introduction",
        nodes: new vis.DataSet([{id: 1, label: "Welcome to the\nNumberphile Dollar Game!", shape: "box", x: 0, y: 0}, {
            id: 2,
            label: "If you don't know anything about it,\ncheck out the video at the bottom of the page,\nor click the 'Numberphile Dollar Game Video' link on the top.",
            shape: "box", x: 200, y: 0
        }, {
            id: 3,
            label: "To get to the next stage, get\nevery node to a value of greater or equal to 0\nand press 'new Graph' when you're finished.",
            shape: "box",
            y: 100
        }, {
            id: 4,
            label: "You can click on nodes to perform the action\nstated on the button to the top right of this.\nYou can toggle the option\nby clicking on the button.",
            shape: "box",
            y: 150
        }, {
            id: 5,
            label: "Now click on a random node to start the game!\n(Note: you will still have to click 'new Graph' to get to the next level')",
            shape: "box",
            y: 200
        }]),
        edges: new vis.DataSet([{from: 1, to: 2, arrows: 'to'}, {from: 2, to: 3, arrows: 'to'}, {
            from: 3,
            to: 4,
            arrows: 'to'
        }, {
            from: 4,
            to: 5,
            arrows: 'to'
        }]),
    },
    {
        name: "Your first network",
        nodes: new vis.DataSet([{id: 1, label: "-1"}, {id: 2, label: "1"}]),
        edges: new vis.DataSet([{from: 1, to: 2}]),
    },
    {
        name: "Higher values are also possible",
        nodes: new vis.DataSet([{id: 1, label: "-4"}, {id: 2, label: "4"}]),
        edges: new vis.DataSet([{from: 1, to: 2}]),
    },
    {
        name: "The sum must not always be 0, it can be higher",
        nodes: new vis.DataSet([{id: 1, label: "-4"}, {id: 2, label: "6"}]),
        edges: new vis.DataSet([{from: 1, to: 2}]),
    },
    {
        name: "The network can be larger than just two nodes",
        nodes: new vis.DataSet([{id: 1, label: "2"}, {id: 2, label: "-4"}, {id: 3, label: "2"}]),
        edges: new vis.DataSet([{from: 1, to: 2}, {from: 2, to: 3}]),
    },
    {
        name: "It can even contain circles",
        nodes: new vis.DataSet([{id: 1, label: "-4"}, {id: 2, label: "4"}, {id: 3, label: "3"}, {id: 4, label: "-1"}]),
        edges: new vis.DataSet([{from: 1, to: 2}, {from: 2, to: 3}, {from: 3, to: 4}, {from: 4, to: 1}]),
    },
    {
        name: "And bigger, uneven circles",
        nodes: new vis.DataSet([{id: 1, label: "-4"}, {id: 2, label: "4"}, {id: 3, label: "3"}, {
            id: 4,
            label: "-1"
        }, {id: 5, label: "0"}]),
        edges: new vis.DataSet([{from: 1, to: 2}, {from: 2, to: 3}, {from: 3, to: 4}, {from: 4, to: 5}, {
            from: 5,
            to: 1
        }]),
    },
    {
        name: "There can be combined structures",
        nodes: new vis.DataSet([{id: 1, label: "-4"}, {id: 2, label: "4"}, {id: 3, label: "3"}, {
            id: 4,
            label: "-1"
        }, {id: 5, label: "0"}, {id: 6, label: "1"}]),
        edges: new vis.DataSet([{from: 1, to: 2}, {from: 2, to: 3}, {from: 3, to: 4}, {from: 4, to: 5}, {
            from: 5,
            to: 1
        }, {from: 4, to: 6}]),
    },
    {
        name: "With lots of sub structures",
        nodes: new vis.DataSet([{id: 1, label: "-4"}, {id: 2, label: "4"}, {id: 3, label: "3"}, {
            id: 4,
            label: "-1"
        }, {id: 5, label: "0"}, {id: 6, label: "1"}, {id: 7, label: "-1"}]),
        edges: new vis.DataSet([{from: 1, to: 2}, {from: 2, to: 3}, {from: 3, to: 4}, {from: 4, to: 5}, {
            from: 5,
            to: 1
        }, {from: 4, to: 6}, {from: 1, to: 7}]),
    },
    {
        name: "Sometimes, there are big chains",
        nodes: new vis.DataSet([{id: 1, label: "2"}, {id: 2, label: "1"}, {id: 3, label: "1"}, {
            id: 4,
            label: "-9"
        }, {id: 5, label: "4"}, {id: 6, label: "4"}]),
        edges: new vis.DataSet([{id: 2, from: 1, to: 2}, {id: 3, from: 1, to: 3}, {id: 4, from: 2, to: 4}, {
            id: 5,
            from: 3,
            to: 5
        }, {id: 6, from: 2, to: 6}])
    }
];

generationMethod = () => {
    if (currentTutorialProgress < tutorialGraphs.length) {
        if (reset_nodes && current_data)
            resetGraph();
        reset_nodes = tutorialGraphs[currentTutorialProgress].nodes.get();
        return tutorialGraphs[currentTutorialProgress];
    }
    else
        return generateRandomGraph();
};

$(() => {

    currentTutorialProgress = parseInt(Cookies.get("tutorial_progress"));
    if (isNaN(currentTutorialProgress))
        currentTutorialProgress = 0;
    adjustParameters();
    $("#tutorialProgess").val(currentTutorialProgress);

    let container = $('#content')[0];

    // let data = generateRandomGraph();
    let data = generationMethod();
    let options = {
        autoResize: true,
        interaction: {
            navigationButtons: true,
            dragNodes: false,
        },
        "physics": {
            "barnesHut": {
                "centralGravity": 2,
                "springLength": 10,
                "springConstant": 0,
                "damping": 0.18,
                "avoidOverlap": 1
            },
            "maxVelocity": 10,
            "minVelocity": 0.12,
            "timestep": 0.7
        },
        edges: {
            smooth: {
                enabled: true,
                type: "discrete"
            }
        },
    };

// initialize your network!
    network = new vis.Network(container, data, options);
    newGraph();
    colorNodes();

    network.on("selectNode", object => {
        let label = current_data.nodes.get(object.nodes[0]).label;
        if (!isNaN(parseInt(label)))
            if ($("#clickAction").attr("data-value") == 0) {
                giveFromSelection(object);
            } else {
                takeIntoSelection(object);
            }
        network.unselectAll();
        colorNodes();
        checkIfWin();
    });

    $("#menu").click(() => {
        let settings = $("#settings");
        if (menuShown)
            settings.hide();
        else
            settings.show();
        menuShown = !menuShown;
    });

    $("#settings").hide();

    let dd = $("#progressDropdown");
    tutorialGraphs.forEach((graph, index) => {
        dd.append("<a class=\"dropdown-item\" href=\"#\" onclick=\"changeCurrentLevel(this)\" data-value=\"" + index + "\">" + index + ": " + graph.name + "</a>\n");
    })
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
            data_edges.push({from: Math.floor(Math.random() * i + 1), to: i + 1})
    }
    for (let i = nodes; i < nodes + additional_edges; i++) {
        let from = Math.floor(Math.random() * nodes + 1);
        let to = Math.floor(Math.random() * nodes + 1);
        if (!data_edges.find((edge) => {
            return edge.from === from && edge.to === to || edge.to === from && edge.from === to;
        }) && from !== to) {
            data_edges.push({from: from, to: to});
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
    adjustParameters();
    MAX_NODES = parseInt($("#maxNodes").val());
    MIN_NODES = parseInt($("#minNodes").val());
    MAX_ADDITIONAL_EDGES = parseInt($("#maxAddEdges").val());
    VALUE_RADIUS = parseInt($("#valueRadius").val());
    WINNABLE_PERCENTAGE = parseFloat($("#winnablePercentage").val());
    currentTutorialProgress = parseInt($("#tutorialProgess").val());
    Cookies.set("tutorial_progress", currentTutorialProgress);

    do {
        // current_data = generateRandomGraph();
        current_data = generationMethod();
    } while (current_data.edges.length - current_data.nodes.length + 1 > sum && Math.random() < WINNABLE_PERCENTAGE);
    network.setData(current_data);
    colorNodes();
    currentLevelWon = false;
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

function adjustParameters() {
    $("#maxNodes").val(Math.floor(currentTutorialProgress * 0.2 + 10));
    $("#minNodes").val(Math.floor(currentTutorialProgress * 0.15 + 3));
    $("#maxAddEdges").val(Math.floor(currentTutorialProgress * 0.175 + 5));
    $("#valueRadius").val(Math.floor(3 + currentTutorialProgress / 5));
    $("#winnablePercentage").val((10 / Math.sqrt(currentTutorialProgress)));
}

function checkIfWin() {
    let t = current_data.nodes.get({
        filter: node => {
            return parseInt(node.label) < 0
        }
    });
    if (t.length === 0 && !currentLevelWon) {
        current_data.nodes.add({id: 0, label: "WIN!", color: "green", size: 100, shape: "star"});
        console.info("WIN!");
        currentTutorialProgress++;
        adjustParameters();
        $("#tutorialProgess").val(currentTutorialProgress);
        Cookies.set("tutorial_progress", currentTutorialProgress);
        currentLevelWon = true;
    }
}

function resetGraph() {
    current_data.nodes.clear();
    current_data.nodes.add(reset_nodes);
    colorNodes();
    currentLevelWon = false;
}

function toggleClickAction() {
    let button = $("#clickAction");
    let curVal = parseInt(button.attr("data-value"));
    let newVal = (curVal + 1) % 2;
    let text = ["Give money to connected nodes  ", "Take money from connected nodes"];
    button.attr("data-value", newVal);
    button.html(text[newVal]);
}

function colorNodes() {
    current_data.nodes.get().forEach(node => {
        if (parseInt(node.label) !== NaN) {
            if (parseInt(node.label) < 0)
                node.color = "LightCoral";
            else
                node.color = "LightGreen";
            current_data.nodes.update(node);
        }
    })
}

function changeMenuIcon(x) {
    x.classList.toggle("change");
}

function changeCurrentLevel(button) {
    console.dir(button);
    $("#tutorialProgess").val(button.getAttribute("data-value"));
}
