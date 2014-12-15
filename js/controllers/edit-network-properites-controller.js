ndexApp.controller('editNetworkPropertiesController', 
	['$scope', '$location', '$routeParams', '$route', 'ndexService',
		function($scope, $location, $routeParams, $route, ndexService){
	 //testing

	//              Process the URL to get application state
    //-----------------------------------------------------------------------------------
    var networkExternalId = $routeParams.identifier;

    //              CONTROLLER INTIALIZATIONS
    //------------------------------------------------------------------------------------

	$scope.editor = {};
	var editor = $scope.editor;
    editor.networkExternalId = networkExternalId;
	editor.propertyValuePairs = [];
	editor.errors = [];
    editor.isAdmin = false;
    editor.canEdit = false;
    editor.canRead = false;

	editor.changed = function(index) {
		if(index == (editor.propertyValuePairs.length - 1))
			editor.propertyValuePairs.push({predicatePrefix: 'none', valuePrefix: 'none'});

	}

	editor.save = function() {
        if( $scope.isProcessing )
            return;
        $scope.isProcessing = true;
		editor.propertyValuePairs.splice(editor.propertyValuePairs.length - 1, 1);

		var length = editor.propertyValuePairs.length;
		for(var ii=0; ii<length; ii++){
			var pair = editor.propertyValuePairs[ii];
			if(pair.predicatePrefix != 'none')
				pair.predicateString = pair.predicatePrefix+':'+pair.predicateString

			if(pair.valuePrefix != 'none')
				pair.value = pair.valuePrefix+':'+pair.value;
		}

		ndexService.setNetworkProperties(networkExternalId, editor.propertyValuePairs,
			function(data) {
				//$route.reload();
			},
			function(error) {
				editor.errors.push(error)
			})

        $location.path("network/"+editor.networkExternalId);
        $scope.isProcessing = false;
	}

	editor.removeNamespace = function(index) {
		editor.ontologies.splice(index,1);
		//TODO api call
	}

	editor.addNamespace = function() {
        var namespace = {
            prefix : editor.newPrefix,
            uri : editor.newURI
        }
		ndexService.addNamespaceToNetwork(networkExternalId, namespace,
            function(success) {
                editor.namespaces.push(namespace);
                editor.newPrefix = null;
                editor.newURI = null;
            },
            function(error) {
                editor.errors.push(error.data)
            })
	}

	editor.setURI = function(item, mode, label) {
		editor.newURI = item.uri;
	}

    editor.refresh = $route.reload;

    editor.preloadedOntologies = [
        {
            prefix: 'GO',
            uri: 'http://identifiers.org/go/'
        },
        {
            prefix: 'HGNC',
            uri: 'http://identifiers.org/hgnc/'
        },
        {
            prefix: 'CHEBI',
            uri: 'http://identifiers.org/chebi/'
        },
        {
            prefix: 'InChI',
            uri: 'http://identifiers.org/inchi/'
        },
        {
            prefix: 'BTO',
            uri: 'http://identifiers.org/bto/'
        },
        {
            prefix: 'CCO',
            uri: 'http://identifiers.org/cco/'
        },
        {
            prefix: 'CL',
            uri: 'http://identifiers.org/cl/'
        },
        {
            prefix: 'DOID',
            uri: 'http://identifiers.org/doid/'
        },
        {
            prefix: 'MA',
            uri: 'http://identifiers.org/ma/'
        },
        {
            prefix: 'OBI',
            uri: 'http://identifiers.org/obi/'
        },
        {
            prefix: 'OPB',
            uri: 'http://identifiers.org/opb/'
        },
        {
            prefix: 'PATO',
            uri: 'http://identifiers.org/pato/'
        },
        {
            prefix: 'CCO',
            uri: 'http://identifiers.org/cco/'
        },
        {
            prefix: 'PW',
            uri: 'http://identifiers.org/pw/'
        },
        {
            prefix: 'MOD',
            uri: 'http://identifiers.org/psimod/'
        },
        {
            prefix: 'PR',
            uri: 'http://identifiers.org/pr/'
        },
        {
            prefix: 'OBO_REL',
            uri: 'http://identifiers.org/ro/'
        },
        {
            prefix: 'SO',
            uri: 'http://identifiers.org/so/'
        },
        {
            prefix: 'SBO',
            uri: 'http://identifiers.org/sbo/'
        },
        {
            prefix: 'TTHERM',
            uri: 'http://identifiers.org/tgd/'
        }
    ]

    //				API initializations
    //------------------------------------------------------------------------------------
    ndexService.getNetwork(networkExternalId)
        .success(
            function(network) {
                editor.propertyValuePairs = network.properties;

                ndexService.getNetworkNamespaces(networkExternalId,
                    function(namespaces) {

                        editor.namespaces = namespaces;

                        var namespaceSet = {}
                        for( var i = 0; i < namespaces.length; i++ )
                        {
                            namespace = namespaces[i];
                            namespaceSet[namespace.prefix] = true;
                        }

                        for(var ii=0; ii<editor.propertyValuePairs.length; ii++) {
                            var pair = editor.propertyValuePairs[ii];

                            while (pair.predicateString == null || pair.value == null) {
                                indicesToRemove.push(ii);
                                continue;
                            }

                            var colonIndex = pair.predicateString.indexOf(':');

                            if (colonIndex != -1 && pair.predicateString.substring(0, colonIndex) in namespaceSet) {
                                pair.predicatePrefix = pair.predicateString.substring(0, colonIndex);
                                pair.predicateString = pair.predicateString.substring(colonIndex + 1);
                            }
                            else {
                                pair.predicatePrefix = 'none';
                            }


                            if( pair.value == null )
                            {
                                pair.valuePrefix = "none";
                            }
                            else
                            {
                                colonIndex = pair.value.indexOf(':');

                                if (colonIndex != -1 && pair.value.substring(0, colonIndex) in namespaceSet) {
                                    pair.valuePrefix = pair.value.substring(0, colonIndex);
                                    pair.value = pair.value.substring(colonIndex + 1);
                                }
                                else {
                                    pair.valuePrefix = 'none';
                                }
                            }


                        }

                        editor.propertyValuePairs.push({predicatePrefix: 'none', valuePrefix: 'none'});
                        // todo add local to list
                        editor.networkName = network.name;
                    },
                    function(error) {
                        editor.errors.push(error)
                    });
            }
        )
        .error(
            function(error) {
                editor.errors.push(error)
            }
        );

    ndexService.getMyMembership(networkExternalId, 
        function(membership) {
            if(membership && membership.permissions == 'ADMIN')
                editor.isAdmin = true;
            if(membership && membership.permissions == 'WRITE')
                editor.canEdit = true;
            if(membership && membership.permissions == 'READ')
                editor.canRead = true;
            
        },
        function(error){
            editor.errors.push(error)
        });

}]);