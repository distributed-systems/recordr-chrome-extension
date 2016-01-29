( function() {

	'use strict';

	/**
	* Exports the calls recorded by APIRecorder to a standardized JSON structure
	* that can be read by Playr
	*/
	var APICallExporter = function() {

	};

	/**
	* @param <Array> calls			Calls as recorded by the APIRecorder
	*/
	APICallExporter.prototype.export = function( calls ) {

		var now 	= new Date()
			, pad	= function( nr ) {
				return nr < 10 ? '0' + nr : nr;
			};

		var ret = {
			author				: 'chrome-extension'
			, description		: ''
			, created			: now.getFullYear() + '-' + pad( now.getMonth() + 1 ) + '-' + pad( now.getDate() ) + ' ' + pad( now.getHours() ) + ':' + pad( now.getMinutes() ) + ':' + pad( now.getSeconds() )
			, version			: '0.0.1'
			, protocolVersion	: '0.1.x'
			, scenario			: []
		};

		// Go through all calls
		calls.forEach( function( call ) {

			var parsed = this.parseCall( call );

			// Append parsed to array
			[].push.apply( ret.scenario, parsed );
		
		}.bind( this ) );

		// Remove pause at the beginning
		if( ret.scenario.length && ret.scenario[ 0 ].kind === 'pause' ) {
			ret.scenario.splice( 0, 1 );
		}

		return ret;

	};


	/**
	* Parses a single call and returns it, formated in the api request player protocol format
	* @param <Object> call			Call as recorded by APIRecorder
	* @returns <Array>				Array with request player protocol style data. Array is needed
	*								as a call may translate into a request and a pause
	*/
	APICallExporter.prototype.parseCall = function( call ) {

		var ret = [];

		console.error( call.request );

		// Pause
		if( call.request.pauseBefore ) {
			ret.push( {
				kind			: 'pause'
				, duration		: call.request.pauseBefore
			} );
		}


		//
		// SCENARIO
		//
		var scenario = {
			kind			: 'request'
			, id			: call.name
		};



		//
		// SCENARIO.REQUEST
		//
		var request = {
			method		: call.request.method
			, url		: call.request.completeUrl
		};

		// Parse Headers
		if( call.request.headers && call.request.headers.length ) {
			request.headers = {};
			call.request.headers.forEach( function( header ) {
				request.headers[ header.name ] = header.value;
			} );
		}

		// Parse Body
		if( call.request.body && call.request.body.length ) {
			request.content = {};
			call.request.body.forEach( function( bodyPart ) {
				request.content[ bodyPart.key ] = bodyPart.value;
			} );
		}

		// Add request to scenario
		scenario.request = request;





		//
		// SCENARIO.RESPONSE
		//
		var response = {
			status				: call.response.status
		};

		// Time
		if( call.response.responseTime ) {
			response.responseTime = {
				comparator		: call.response.responseTime.comparator
				, type			: 'number'
				, value			: call.response.responseTime.value
				, kind			: 'comparator'
				, optional		: false
			};
		}

		// Response Headers
		if( call.response.headers && call.response.headers.length ) {

			var headers = {};
			call.response.headers.forEach( function( header ) {
				headers[ header.name ] = {
					kind			: 'comparator'
					, type			: header.type
					, optional		: header.optional
					, comparator	: header.comparator
					, value			: header.value
				};
			} );

			response.headers = headers;

		}


		// Response Body
		if( call.response.body ) {

			var content = this._parseResponseBody( call.response.body );
			if( content ) {
				response.content = content;
			}
		
		}


		scenario.response = response;



		// Add request to ret
		ret.push( scenario );

		//console.error( ret );

		return ret;

	};



	APICallExporter.prototype._parseResponseBody = function( body ) {

		if( !body ) {
			return false;
		}

		// Objects that constitute the body all must have an getPlayrJSON method
		console.log( 'APICallExporter: get playr JSON from %o', body );
		return body.getPlayrJSON();

	};


	window.jb = window.jb || {};
	window.jb.APICallExporter = APICallExporter;

} )();

