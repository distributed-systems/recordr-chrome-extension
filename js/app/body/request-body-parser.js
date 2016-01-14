( function() {

	'use strict';

	/**
	* Parses a requestBody recorded through chrome.devtools
	* @param <Object> requestBody		request.postData object created by chrome.devtools, has
	* 									properties mimeType and text
	*/
	var RequestBodyParser = function() {
	};

	RequestBodyParser.prototype.parse = function( requestBody ) {

		if( !requestBody ) {
			console.log( 'RequestBodyParser: no requestBody passed' );
			return {};
		}

		if( !requestBody.mimeType ) {
			console.error( 'RequestBodyParser: mimeType property missing' );
			return {};
		}

		if( requestBody.mimeType.indexOf( 'multipart/form-data' ) !== 0 ) {
			console.log( 'RequestBodyParser: mimeType is not multipart/form-data. Can\'t parse data.' );
			return {};
		}

		// Empty body
		if( !requestBody.text ) {
			return {};
		}

		var boundaryIndex = requestBody.mimeType.indexOf( 'boundary=' );

		if( boundaryIndex === -1 ) {
			console.error( 'RequestBodyParser: boundary missing' );
			return;
		}

		// Boundary
		var boundary = requestBody.mimeType.substr( boundaryIndex + 'boundary='.length );

		var bodyParts = requestBody.text.split( boundary );
		//console.error( bodyParts );

		var nameRegEx = /^Content-Disposition:\s*form-data;\s+name="([^"]*)"/i;
	
		// Return value
		var ret = [];

		// Go through all parts of the requestBody		
		// Discard first entry, is only '--'
		for( var i = 1; i < bodyParts.length; i++ ) {

			var part = bodyParts[ i ];
			var lines = part.split( '\n' );

			//console.error( 'lines %o', lines );

			// Only parse lines if it contains an empty line, then line with name, then empty, then content, then --
			if( lines.length !== 5 ) {
				continue;
			}

			var match = lines[ 1 ].match( nameRegEx );
			
			if( !match ) {
				console.error( 'RequestBodyParser: Could not find name in %o', lines[ 1 ] );
				continue;
			}

			var name = match[ 1 ];

			ret.push( {
				key		: name
				, value	: lines[ 3 ]
			} );

		}

		return ret;

	};

	window.jb = window.jb || {};
	window.jb.RequestBodyParser = RequestBodyParser;

} )();