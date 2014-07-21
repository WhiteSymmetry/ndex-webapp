
ndexApp.controller('compareController', function ($scope, $http, sharedProperties) {
    $scope.currentNetworkId = sharedProperties.getCurrentNetworkId();
    if ('none' === $scope.currentNetworkId) $scope.currentNetworkId = "C25R1334";   // hardwired for testing

    var blockSize = 1000;
    var skipBlocks = 0;
    var config = NdexClient.getNetworkQueryByEdgesConfig($scope.currentNetworkId, skipBlocks, blockSize);
    $scope.showDetails = true;

    $scope.addNetwork = function (id, callback) {
        var config = NdexClient.getNetworkQueryByEdgesConfig(id, skipBlocks, blockSize);
        $http(config)
            .success(function (network) {
                NdexClient.addNetwork(network);
                console.log("added network");
                $scope.selectedEdges = network.edges;
                csn = network;
                callback();
                console.log("callback done");
            });
    };

    $scope.linkMatchingNodes = function () {
        // For the first and second networks loaded in NdexClient,
        // Find all shared terms in namespace HGNC
        console.log("calling linkMatchingNodes");

        var network1 = NdexClient.networks[0];
        net1 = network1;
        NdexClient.indexNodesByTerms(network1);
        var network2 = NdexClient.networks[1];
        net2 = network2;
        NdexClient.indexNodesByTerms(network2);
        //var namespacePrefix = "UniProt";
        var namespacePrefix = "HGNC";
        console.log("network1: " + network1.name + " nodes: " + network1.nodeCount + " edges: " + network1.edgeCount);
        console.log("network2: " + network2.name + " nodes: " + network2.nodeCount + " edges: " + network2.edgeCount);
        var sharedTerms = NdexClient.findSharedTerms(network1, network2, namespacePrefix);
        console.log("shared terms: " + sharedTerms.length + " in namespace " + namespacePrefix);

        // Then for each shared term find the nodes in each network that
        // are linked to the term.
        // For each pair of nodes that share a term, add an edge to the D3 graph
        for (index in sharedTerms) {
            var termPair = sharedTerms[index];
            var term1NodeIds = NdexClient.getTermNodes(network1, termPair[0]);
            var term2NodeIds = NdexClient.getTermNodes(network2, termPair[1]);

            for (i in term1NodeIds){
                var node1Id = term1NodeIds[i];
                var node1 = network1.nodes[node1Id];
                var node1Label = NdexClient.getNodeLabel(node1, network1)
                for( j in term2NodeIds){
                    var node2Id = term2NodeIds[j];
                    var node2 = network2.nodes[node2Id];
                    var node2Label = NdexClient.getNodeLabel(node2, network2)
                    console.log("adding edge 'corresponds' between node " + node1Label + " and node " + node2Label);
                    addComparisonEdge(node1Id, node2Id);
                }
            }
        }
    };

    var height = angular.element('#compareCanvas')[0].clientHeight;
    var width = angular.element('#compareCanvas')[0].clientWidth;
    d3Setup(height, width, '#compareCanvas');
    d3Init();
    $scope.addNetwork(
        "C25R1334",
        function(){
            $scope.addNetwork(
                "C25R1333",
                function(){
                    addNetworkToD3(NdexClient.networks[0], {x: (width * .1) , y: height/2});
                    addNetworkToD3(NdexClient.networks[1], {x: (width * .8), y: height/2});
                    //$scope.linkMatchingNodes();
                    d3Go();
                });
        });

});

