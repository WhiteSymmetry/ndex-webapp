ndexApp.controller('editNetworkPropertiesController',
	['$scope', '$location', '$routeParams', '$route', 'ndexService', '$modal',
		function($scope, $location, $routeParams, $route, ndexService, $modal){
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

    editor.reference = null;

	editor.changed = function(index) {
		if(index == (editor.propertyValuePairs.length - 1))
			editor.propertyValuePairs.push({predicatePrefix: 'none', valuePrefix: 'none'});

	};

    /*
     * checkPredicateString() function checks if user entered "Reference" (case-insensitive)
     * in the predicate field.  If yes, the warning is shown.
     */
    checkPredicateString = function(obj) {
        var prefixString = obj.value;

        if ("reference" === prefixString.trim().toLowerCase()) {

            var title = "Cannot Use NDEx Internal Reserved Words";
            var message = "Case-insensitive " + "'" + prefixString + "'" + " is NDEx internal reserved word. It cannot be used " +
                " as predicate. It will not be saved. If you need to edit Reference property " +
                "of the current network, please select Edit Network Profile button from the Network page.";

            var modalInstance = $modal.open({
                templateUrl: 'generic-info-modal.html',
                scope: $scope,

                controller: function ($scope, $modalInstance) {

                    $scope.title = title;
                    $scope.message = message;

                    $scope.close = function () {
                        $modalInstance.dismiss();
                    };
                }
            });
        }
    }

	editor.save = function() {
        if( $scope.isProcessing )
            return;
        $scope.isProcessing = true;

        if ((editor.propertyValuePairs[editor.propertyValuePairs.length - 1].predicatePrefix.toLowerCase()==='none') &&
            (editor.propertyValuePairs[editor.propertyValuePairs.length - 1].valuePrefix.toLowerCase()==='none')) {
            editor.propertyValuePairs.splice(editor.propertyValuePairs.length - 1, 1);
        }

		var length = editor.propertyValuePairs.length;
        var i = 0;

        // remove all "Reference" attributes
        while (i < length){

            if((typeof editor.propertyValuePairs[i].predicateString !== 'undefined') &&
                (editor.propertyValuePairs[i].predicateString.trim().toLowerCase() === 'reference') ) {

                // here, we just found "Reference" element entered by user; remove it
                editor.propertyValuePairs.splice(i,1);
                length = length - 1;

                // here, DO NOT increment the loop counter i since array has shrunk
                // after splicing and we have a new element at editor.propertyValuePairs[i] after splicing
                continue;
            }
            i = i + 1;
        }

        length = editor.propertyValuePairs.length;

		for(var ii=0; ii<length; ii++){
			var pair = editor.propertyValuePairs[ii];
			if((typeof pair.predicatePrefix !== 'undefined') && (pair.predicatePrefix != 'none') )
				pair.predicateString = pair.predicatePrefix+':'+pair.predicateString

            if((typeof pair.valuePrefix !== 'undefined') && (pair.valuePrefix != 'none') )
				pair.value = pair.valuePrefix+':'+pair.value;
		}


        if (typeof editor.propertyValuePairs !== 'undefined') {
            editor.propertyValuePairs[editor.propertyValuePairs.length] =
            {   "predicateString" : "Reference",
                "value"           : editor.reference,
                "dataType"        : "string",
                "subNetworkId"    : null
            }
        } else {
            editor.propertyValuePairs =
            {   "predicateString" : "Reference",
                "value"           : editor.reference,
                "dataType"        : "string",
                "subNetworkId"    : null
            };
        }


		ndexService.setNetworkProperties(networkExternalId, editor.propertyValuePairs,
			function(data) {
				//$route.reload();
                $location.path("network/"+editor.networkExternalId);
                $scope.isProcessing = false;
			},
			function(error) {
				editor.errors.push(error);
                $scope.isProcessing = false;
			});

        //$location.path("network/"+editor.networkExternalId);
        //$scope.isProcessing = false;
	};

	editor.removeNamespace = function(index) {
		editor.ontologies.splice(index,1);
		//TODO api call
	};

	editor.addNamespace = function() {
        var namespace = {
            prefix : editor.newPrefix,
            uri : editor.newURI
        };
		ndexService.addNamespaceToNetwork(networkExternalId, namespace,
            function(success) {
                editor.namespaces.push(namespace);
                editor.newPrefix = null;
                editor.newURI = null;
            },
            function(error) {
                editor.errors.push(error.data)
            })
	};

	editor.setURI = function(item, mode, label) {
		editor.newURI = item.uri;
	};

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
    ];

    //				API initializations
    //------------------------------------------------------------------------------------
    ndexService.getNetwork(networkExternalId)
        .success(
            function(network) {
                editor.propertyValuePairs = network.properties;

                var arrayLength = editor.propertyValuePairs.length;
                var i = 0;

                // we need to remove all "sourceformat" objects.  There should always be only one
                // "sourceformat" element sent by the  server; we want to make sure we remove them
                // all in case server by mistake sends multiple "sourceformat" elements.
                while ( i < arrayLength ) {
                    if ((editor.propertyValuePairs[i].predicateString.toLowerCase() === "sourceformat") ||
                        (editor.propertyValuePairs[i].predicateString.toLowerCase() === "reference")) {

                        if( editor.propertyValuePairs[i].predicateString.toLowerCase() === "reference") {
                            editor.reference = editor.propertyValuePairs[i].value;
                        }
                        editor.propertyValuePairs.splice(i,1);
                        arrayLength = arrayLength - 1;
                        // here, DO NOT increment the loop counter i since array has shrunk
                        // after splicing and we have a new element at editor.propertyValuePairs[i] after splicing
                        continue;
                    }
                    i = i + 1;
                }

                ndexService.getNetworkNamespaces(networkExternalId,
                    function(namespaces) {

                        editor.namespaces = namespaces;

                        var namespaceSet = {};
                        for( var i = 0; i < namespaces.length; i++ )
                        {
                            namespace = namespaces[i];
                            namespaceSet[namespace.prefix] = true;
                        }

                        var length = editor.propertyValuePairs.length;
                        for(var ii=0; ii<length; ii++) {
                            var pair = editor.propertyValuePairs[ii];

                            var colonIndex = pair.predicateString.indexOf(':');

                            if (colonIndex != -1 && pair.predicateString.substring(0, colonIndex) in namespaceSet) {
                                pair.predicatePrefix = pair.predicateString.substring(0, colonIndex);
                                pair.predicateString = pair.predicateString.substring(colonIndex + 1);
                            }
                            else {
                                pair.predicatePrefix = 'none';
                            }


                            if (pair.value == null)
                            {
                                pair.valuePrefix = 'none';
                            }
                            else
                            {
                                colonIndex = pair.value.indexOf(':');

                                if (colonIndex != -1 && pair.value.substring(0, colonIndex) in namespaceSet)
                                {
                                    pair.valuePrefix = pair.value.substring(0, colonIndex);
                                    pair.value = pair.value.substring(colonIndex + 1);
                                }
                                else
                                {
                                    pair.valuePrefix = 'none';
                                }
                            }
                        }

                        editor.propertyValuePairs.push({predicatePrefix: 'none', valuePrefix: 'none'});
                        // todo add local to list
                        editor.networkName = network.name;
                    },
                    function(error) {
                        editor.propertyValuePairs.push({predicatePrefix: 'none', valuePrefix: 'none'});
                        editor.networkName = network.name;

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