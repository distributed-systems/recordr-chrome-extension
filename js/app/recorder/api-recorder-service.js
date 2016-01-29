/**
* Records calls that Chrome makes (through chrome.devtools.network) and parses those calls.
*/
/* global jb, chrome */
( function() {

	angular
	.module( 'jb.apiRecorder.recorderService', [ 'jb.apiRecorder.settingsService', 'jb.apiBody.parser', 'jb.apiBody.helper' ] )
	.factory( 'APIRecorderService', [ '$rootScope', '$q', 'SettingsService', 'BodyParserService', function( $rootScope, $q, SettingsService, BodyParserService ) {
		

			// Contains Calls in the order they were recorded
		var _calls 		= []
			, _self

			// Time stamp of the latest call's end
			, _latestCallEnd;

		var APIRecorder = function() {
			_self = this;
		};



		/**
		* Exports calls (by invoking APICallExporter)
		*/
		APIRecorder.prototype.exportCalls = function() {

			var data = new window.jb.APICallExporter().export( _calls );
			return data;

		};


		/**
		* Removes the calls (clears recordings)
		*/
		APIRecorder.prototype.clearCalls = function() {
			_calls.splice( 0, _calls.length );
		};



		/**
		* Returns calls
		*/
		APIRecorder.prototype.getCalls = function() {
			return _calls;
		};



		/**
		* Starts recording calls
		*/
		APIRecorder.prototype.record = function() {

			console.log( 'APIRecorder: Record' );
			// Don't use bind(this), as binding the function to a scope won't allow us to stop recording!
			chrome.devtools.network.onRequestFinished.addListener( this.requestHandler );

		};


		/**
		* Handler for calls
		*/
		APIRecorder.prototype.requestHandler = function( request ) {

			console.log( 'APIRecorder: Request to %o (%o) finished: %o.', request.request.url, request.request.method, request );
			$rootScope.$apply( function() {
				//console.group( '%o %o', request.request.method, request.request.url );
				_self.processRequest( request );
				//console.groupEnd();
			} );

		};


		/**
		* Stops recording calls
		*/
		APIRecorder.prototype.pause = function() {

			console.log( 'APIRecorder: Pause' );
			chrome.devtools.network.onRequestFinished.removeListener( this.requestHandler );

		};



		/**
		* Removes a call from the list of _calls
		*/
		APIRecorder.prototype.removeCall = function( call ) {

			var index = _calls.indexOf( call );

			if( index === -1 ) {
				throw new Error( 'APIRecorder: Call not found in calls, cannot be removed.' );
			}

			_calls.splice( index, 1 );

		};



		/**
		* Returns false if response's content-type is in settings.requestHeadersToDiscard
		* and should therefore not be processed; else true.
		*/
		APIRecorder.prototype.checkRequestContentType = function( request ) {

			return SettingsService.getSettings()
				.then( function( settings ) {
			
					var contentTypesToRecord = settings.contentTypesToRecord;

					// Settings not set: Process all requests
					if( !contentTypesToRecord ) {
						return true;
					}

					contentTypesToRecord = contentTypesToRecord.toLowerCase().split( ' ' );
					
					var contentType;

					// header contains a long string like text/css; charset=UTF-8
					// Removing the charset part gives us the content type we're looking for.
					request.response.headers.forEach( function( header ) {
						if( header.name === 'content-type' || header.name === 'Content-Type' ) {

							var hasCharset = header.value.indexOf( ' ' ) > -1;

							if( hasCharset ) {
								contentType = header.value.substring( 0, header.value.indexOf( ';' ) );
							}
							else {
								contentType = header.value;
							}

						}
					} );


					// Content type is missing
					if( !contentType ) {
						return true;
					}

					if( contentTypesToRecord.indexOf( contentType.toLowerCase() ) > -1 ) {
						return true;
					}

					return false;

				} );

		};


		APIRecorder.prototype.getContent = function( request ) {

			var deferred = $q.defer();

			request.getContent( function( content, encoding ) {
				deferred.resolve( content );
			} );

			return deferred.promise;

		};




		APIRecorder.prototype.processRequest = function( req ) {

			var self = this;

			var stop = false

				// Store return values of promises
				, content
				, settings;

			// content-type of response belongs to settings.requestHeadersToDiscard:
			// Don't process response
			this.checkRequestContentType( req )


				// Get request's response
				.then( function( process ) {

					stop = !process;

					if( stop ) {
						return false;
					}

					return self.getContent( req );

				} )

				// Get Settings
				.then( function( cont ) {

					if( stop ) {
						return false;
					}

					content = cont;
					return SettingsService.getSettings();

				} )

				// Process stuff
				.then( function( set ) {

					if( stop ) {
						return false;
					}

					settings = set;
					
					var call = new Call( self );
					
					var shortUrl = req.request.url.substr( req.request.url.lastIndexOf( '/' ) + 1 );

					call.name = req.request.method.toLowerCase() + '-' + shortUrl;


					// REQUEST
					var request 		= new Request();
					request.url 		= shortUrl;
					request.completeUrl	= req.request.url;
					
					// Headers
					var requestHeaders	= [];
					req.request.headers.forEach( function( header ) {

						// Ignore headers stored in settings.requestHeadersToIgnore
						if( settings.requestHeadersToIgnore ) {
							if( settings.requestHeadersToIgnore.toLowerCase().split( ' ' ).indexOf( header.name.toLowerCase() ) > -1 ) {
								return;
							}
						}

						var reqHeader 		= new RequestHeader();
						reqHeader.name		= header.name;
						reqHeader.value		= header.value;
						requestHeaders.push( reqHeader );
					} );
					request.headers 	= requestHeaders;

					request.method 		= req.request.method;

					// PauseBefore
					var pause			= _latestCallEnd ? req.startedDateTime - _latestCallEnd : 0;
					// Round to 50 ms; not less than 0 ms
					request.pauseBefore	= Math.max( Math.ceil( pause / 50 ) * 50, 0 );

					if( req.request.postData ) {
						request.body		= new jb.RequestBodyParser().parse( req.request.postData );
						console.log( 'ApiRecorder: Parsed postData %o into %o', req.request.postData, request.body );
					}

					call.request 		= request;



					// RESPONSE
					var response 			= new Response();
					var headersToIgnore 	= settings.responseHeadersToIgnore ? settings.responseHeadersToIgnore.toLowerCase().split( ' ' ) : [];
					response.headers 		= self.processResponseHeaders( req.response.headers, headersToIgnore );
					response.responseTime 	= {
						comparator			: '<='
						// Round to 50 ms
						, value				: Math.ceil( req.time / 50 ) * 50
					};

					// Only parse JSON
					var contentType;
					if( response.headers && response.headers.length ) {
						response.headers.some( function( item ) {

							if( item.name === 'content-type' || item.name === 'Content-Type' ) {
								contentType = item.value;
								return true;
							}

						} );
					}

					response.body			= {};
					// Only try to parse JSON bodies
					if( contentType && ( contentType.indexOf( 'application/json' ) === 0 || contentType.indexOf( 'text/json' ) === 0 ) ) {
						var responseBody	= BodyParserService.parse( content );
						response.body		= responseBody;
					}
					response.status			= req.response.status;



					call.response 			= response;

					console.log( 'APIRecorder: Processed call %o', call );
					_calls.push( call );


					// Store latest call's end time. Calls that are not handled (because they're
					// excepted in settings) don't count to _latestCallEnd
					_latestCallEnd = req.startedDateTime.getTime() + req.time;


	
				} );
			
	
		};


		/**
		* @param <Array> headersToIgnore			Headers to ignore (remove), array of lowercase strings
		*/
		APIRecorder.prototype.processResponseHeaders = function( headers, headersToIgnore ) {
	
			var ret = [];

			headers.forEach( function( header ) {

				if( headersToIgnore.indexOf( header.name.toLowerCase() ) > -1 ) {
					return;
				}

				var retHeader			= new ResponseHeader();
				retHeader.name 			= header.name;
				retHeader.value 		= header.value;
				retHeader.comparator	= '='; // Default comparator for all types
				retHeader.optional 		= false;
				retHeader.type 			= new window.jb.StringTypeRecognizer().recognizeType( header.value );

				ret.push( retHeader );

			} );

			return ret;

		};


		return new APIRecorder();

	} ] );
















	// Define call object
	// Inject APIRecorder to remove call
	var Call = function( APIRecorder ) {

		this._apiRecorder = APIRecorder;

		Object.defineProperty( this, 'response', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'request', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'name', {
			enumerable: true
			, writable: true
		} );

	};

	Call.prototype.remove = function( ev ) {
		ev.preventDefault();
		ev.stopPropagation();
		this._apiRecorder.removeCall( this );
	};



	// Define request object
	var Request = function() {

		Object.defineProperty( this, 'url', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'completeUrl', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'method', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'headers', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'body', {
			enumerable: true
			, writable: true
		} );

		// Time in ms the playr should wate before making this request. 
		// Contains an object with properties
		// - duration
		// - comparator
		Object.defineProperty( this, 'pauseBefore', {
			enumerable: true
			, writable: true
		} );

	};

	Request.prototype.removeHeader = function( header ) {
		this.headers.splice( this.headers.indexOf( header ), 1 );
	};

	Request.prototype.createHeader = function( name ) {
		var header = new RequestHeader();
		header.name = name;
		this.headers.push( header );
	};




	// Define response object
	var Response = function() {

		Object.defineProperty( this, 'body', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'headers', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'status', {
			enumerable: true
			, writable: true
		} );

		// Time the response takes, in ms. Contains an object with properties
		// - duration
		// - comparator
		Object.defineProperty( this, 'responseTime', {
			enumerable: true
			, writable: true
		} );

	};

	Response.prototype.removeHeader = function( header ) {
		this.headers.splice( this.headers.indexOf( header ), 1 );
	};

	Response.prototype.createHeader = function( name ) {
		var header = new ResponseHeader();
		header.name = name;
		this.headers.push( header );
	};






	// Define header object
	var ResponseHeader = function() {

		// Make sure we can tell response headers apart from request headers.
		// See recorded-call-header directive where both are used.
		Object.defineProperty( this, 'headerType', {
			enumerable	: true
			, value		: 'response'
		} );

		Object.defineProperty( this, 'name', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'type', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'optional', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'nullable', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'value', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'comparator', {
			enumerable: true
			, writable: true
		} );

	};



	// Simple header for request (has no comparator or type)
	var RequestHeader = function() {

		Object.defineProperty( this, 'headerType', {
			enumerable	: true
			, value		: 'request'
		} );

		Object.defineProperty( this, 'name', {
			enumerable: true
			, writable: true
		} );

		Object.defineProperty( this, 'value', {
			enumerable: true
			, writable: true
		} );

	};




} )();









