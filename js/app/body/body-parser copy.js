/**
* Parses body data sent to or gotten from server, converts it into an object
* with the corresponding fields and best guesses.
*/
( function() {

	'use strict';

	angular
	.module( 'jb.apiBody.parser', [] )
	.factory( 'BodyParserService', [ function() {

		/**
		* Parses a primitive and returns it as
		* {
		*	type	: 'string|number|date'
		*	, name	: name
		* 	, value	: value
		* }
		*/
		function parseValue( value ) {

			//console.log( 'BodyParserService: parse value ' + JSON.stringify( value ) + ' name ' + name );
			var valueType = new window.jb.StringTypeRecognizer().recognizeType( value );

			return [ {
				kind			: 'type'
				, type			: valueType
			}, {
				kind			: 'comparator'
				, comparator	: '='
				, type			: valueType
				, value			: value
			} ];

		}






		/**
		*  Parses an array and returns it as
		* {
		*	type			: 'array'
		*	, length		: int
		*	, values		: []
		* }
		*
		* Where values is an array that contains objects with
		* { value: val } for simple values (number, string, date)
		* { properties: [ { key: value } ] } for objects
		* { values: []}
		*
		* #todo: Parse all items, check for differences, set optional and throw errors if incompatible types
		* 		 were detected.
		*/
		function parseArray( array ) {

			//console.log( 'BodyParserService: parse array ' + JSON.stringify( array ) );

			var ret = [ 
				{ 
					kind				: 'type'
					, type				: 'array'
				}, {
					kind				: 'array'
					, length			: {
						kind			: 'comparator'
						, type			: 'number' // type of the value
						, value			: array.length
						, comparator	: '='
					}
					, data				: {}
				} 
			];



			// Parse contents of the array
			if( array.length === 0 ) {
				// Nothing to do. ret.values stays empty.
			}

			// Get type of the items that the array consists of
			else {


				ret[ 1 ].data = parseData( array[ 0 ] );


				/*var type = new window.jb.StringTypeRecognizer().recognizeType( array[ 0 ] );

				if( angular.isArray( array[ 0 ] ) ) {
					type = 'array';
				}
				else if( angular.isObject( array[ 0 ] ) ) {
					type = 'object';
				}


				//ret.data.type = type;



				// If array's children are arrays or objects, continue parsing
				if( type === 'array' ) {

					/*var parsed = parseArray( '', array[ 0 ] );
					console.error( 'parsed for array in array is ' + JSON.stringify( parsed ) );
					ret.values.values = parsed.values;
					ret.values.length = {
						value			: array[ 0 ].length
						, comparator	: '='
					};*/

				/*}
				else if (type === 'object' ) {

					/*var parsedObj = parseObject( '', array[ 0 ] );
					ret.values.properties = parsedObj.properties;*/

				/*}
				else {
					ret[ 0 ].data = parseValue( array[ 0 ] );
				}*/

			}


			return ret;

		}




		/**
		* Parses an object and returns it as
		* {
		*	type		: 'object'
		*	, name		: name
		*	, properties: [ {
		*		(property definitions)
		*	} ]
		* }
		*/
		function parseObject( object ) {

			//console.log( 'BodyParserService: parse object ' + JSON.stringify( object ) );

			var keys = Object.keys( object );

			var ret = [ {
				kind			: 'type'
				, type			: 'object'
			} ];

			var objectValidator = {
				kind			: 'object'
				, data			: {}
			};

			keys.forEach( function( key ) {

				var data = parseData( object[ key ] );
				//console.error( 'data: ', data );
				objectValidator.data[ key ] = data;

			} );

			ret.push( objectValidator );

			return ret;

		}





		/**
		* Parses any data (primitive type, object or array)
		*/
		function parseData( data ) {

			if( angular.isArray( data ) ) {
				return parseArray( data );
			}
			else if( angular.isObject( data ) ) {
				return parseObject( data );
			}
			else {
				return parseValue( data );
			}

		}








		var BodyParser = function() {

		};

		BodyParser.prototype.parse = function( data ) {

			// Return value
			var parsed

			// Parsed JSON data
				, parsedJSON;


			try {
				parsedJSON = JSON.parse( data );
			}
			catch( err ) {
				throw new Error( 'BodyParserService: data JSON could not be parsed.' );
			}

			parsed = parseData( parsedJSON );

			// Return name property on top-most entity (is 'body' that was previously attached).
			/*if( parsed && parsed.key ) {
				delete parsed.key;
			}*/

			console.log( 'Parsed: ' + JSON.stringify( parsed ) );
			return parsed;
			
		};




		return new BodyParser();


	} ] );



} )();
