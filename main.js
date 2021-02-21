const dot = require("graphlib-dot");
const depGraphLib = require("@snyk/dep-graph");

window.createFromJSON = createFromJSON;

async function createFromJSON(depGraphData) {
    try {
        if (typeof depGraphData === "string") depGraphData = JSON.parse(depGraphData)
        if (!depGraphData.graph) {
            depGraphData = (await depGraphLib.legacy.depTreeToGraph(depGraphData, 'pkg-manager')).toJSON();
        }
    } catch (e) {
        console.error(e);
        depGraphData = {
            graph: {
                nodes: [{nodeId: `error ` + e.toString(), deps: []}]
            }
        }
    }
    const graph = new graphlib.Graph({
        directed: true,
        multigraph: false,
        compound: false,
    });
    const nodes = {};

    for (const node of depGraphData.graph.nodes) {
        const pkgId = node.pkgId;

        const info = node.info ? `\nInfo=${JSON.stringify(node.info)}` : "";
        nodes[node.nodeId] = `${node.nodeId}\nPkgId=${pkgId}${info}`
        graph.setNode(nodes[node.nodeId]);
    }

    for (const node of depGraphData.graph.nodes) {
        for (const depNodeId of node.deps) {
            graph.setEdge(nodes[node.nodeId], nodes[depNodeId.nodeId]);
        }
    }

    return dot.write(graph);
}
