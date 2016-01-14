/* global describe, beforeEach, afterEach, jb, it, expect */
( function() {

	'use strict';

	describe( 'BodyParserService', function() {

		var service;

		beforeEach( angular.mock.module( 'jb.apiBody.parser' ) );

		beforeEach( angular.mock.inject( function( BodyParserService ) {
			service = BodyParserService;
		} ) );

		afterEach( function() {
		} );


		describe( 'When parsing data', function() {

			
			it( 'has a parse method.', function() {

				expect( typeof( service.parse ) ).toBe( 'function' );

			} );


			it( 'Parses objects correctly', function() {

				var original = { name: 'test', name2: 'test2' }
				, parsed = service.parse( JSON.stringify( original ) );

				expect( parsed instanceof jb.entities.ObjectEntity ).toBe( true );
				expect( parsed.constraints.length ).toBe( 2 );

				// Check type constraint
				expect( parsed.getConstraintsByKind( 'type' )[ 0 ].type ).toBe( 'object' );

				// Check object constraint
				var objectConstraint = parsed.getConstraintsByKind( 'object' );
				expect( objectConstraint.length ).toBe( 1 );
				expect( objectConstraint[ 0 ].data.length ).toBe( 2 );
				
				expect( objectConstraint[ 0 ].data[ 0 ].name ).toBe( 'name' );
				expect( objectConstraint[ 0 ].data[ 0 ].content instanceof jb.entities.StringEntity ).toBe( true );

			} );


			// Strings can only be parsed when they're part of an object (because we use JSON.parse() which doesn't take strings as an argument)
			it( 'Parses strings correctly', function() {

				var parsed = service.parse( JSON.stringify( { name: 'test' } ) );

				var stringEntity = parsed.getConstraintsByKind( 'object' )[ 0 ].data[ 0 ].content;
				
				expect( stringEntity instanceof jb.entities.StringEntity ).toBe( true );

				// Has a type and comparator constraint
				expect( stringEntity.constraints.length ).toBe( 2 );

				expect( stringEntity.getConstraintsByKind( 'type' )[ 0 ].type ).toBe( 'string' );
				
				// Comparator
				var comparatorConstraint = stringEntity.getConstraintsByKind( 'comparator' );
				expect( comparatorConstraint.length ).toBe( 1 );
				expect( comparatorConstraint[ 0 ] ).toEqual( { 
					kind			: 'comparator'
					, comparator	: '='
					, value			: 'test'
					, type			: 'string'
				} );

			} );





			it( 'Parses arrays correctly', function() {

				var parsed = service.parse( JSON.stringify( [ 'a', 5 ] ) );

				expect( parsed.getConstraintsByKind( 'type' )[ 0 ].type ).toBe( 'array' );

				// Array constraint
				expect( parsed.getConstraintsByKind( 'array' ).length ).toBe( 1 );
				var arrayConstraint = parsed.getConstraintsByKind( 'array' )[ 0 ];
				expect( arrayConstraint.data instanceof jb.entities.StringEntity ).toBe( true );

				// Length
				expect( arrayConstraint.length ).toEqual( {
					value			: 2
					, comparator	: '='
					, type			: 'number'
					, kind			: 'comparator'
				} );

			} );



		} );




	

		describe( 'When exporting an entity', function() {




			// Export tests
			// Simple object
			var cases = [ {
				json 				: {
					name			: 'test'
				}
				, parsed			: [ 
					{
						kind			: 'type'
						, type			: 'object'
					}, {
						kind			: 'object'
						, data			: {
							name		: [ {
								kind			: 'type'
								, type			: 'string'
							}, {
								kind			: 'comparator'
								, comparator	: '='
								, type			: 'string'
								, value			: 'test'
							} ]
						}
					} 
				]
			},



			// Array with simple values
			{
				json				: [
					'a', 'b'
				]
				, parsed			: [ {
					kind			: 'type'
					, type			: 'array'
				}, {
					kind			: 'array'
					, length		: {
						kind		: 'comparator'
						, comparator: '='
						, type		: 'number'
						, value		: 2
					}
					, data			: [ {
						kind		: 'type'
						, type		: 'string'
					}, {
						kind		: 'comparator'
						, type		: 'string'
						, value		: 'a'
						, comparator: '='
					} ]
				} ]
			}



			// Array with objects
			, {
				json		: [ {
						a	: 'b'
					}, {
						c	: 'd'
					} ]

				, parsed	: [ 
					{
						kind			: 'type'
						, type			: 'array'
					}, {
						kind			: 'array'
						, length		: {
							kind		: 'comparator'
							, comparator: '='
							, type		: 'number'
							, value		: 2
						}
						, data			: [ 
							{
								kind		: 'type'
								, type		: 'object'
							}, {
								kind		: 'object'
								, data		: {
									a		: [ {
										kind		: 'type'
										, type		: 'string'
									}, {
										kind		: 'comparator'
										, comparator: '='
										, type		: 'string'
										, value		: 'b'
									} ]
								}
							}
						]
					}
				]
			}





			// Object with different properties (checks for all types)
			/*, {
				json: {
					a			: 'b'
					, b			: 2
					, c			: '2015-12-29'
					, d			: {}
				}
				, parsed		: [
					{
						kind		: 'type'
						, type		: 'object'
					}
					, {
						kind		: 'object'
						, data		: {
							a		: [ {
									kind		: 'type'
									, type		: 'string'
								}, {
									kind		: 'comparator'
									, type		: 'string'
									, comparator: '='
									, value		: 'b'
								} ]
							, b		: [ {
									kind		: 'type'
									, type		: 'number'
								}, {
									kind		: 'comparator'
									, type		: 'number'
									, comparator: '='
									, value		: 2
								} ]
							, c		: [ {
									kind		: 'type'
									, type		: 'date'
								}, {
									kind		: 'comparator'
									, type		: 'date'
									, comparator: '='
									, value		: '2015-12-29'
								} ]
							, d		: [ {
									kind		: 'type'
									, type		: 'object'
								}, {
									kind		: 'object'
									, data		: {}
								} ]
						}
					}

				]
			}*/


			// Nested array
			, {
				json				: [ [ 'a' ] ]
				, parsed			: [ 
					{
						kind			: 'type'
						, type			: 'array'
					} 
					, {
						kind			: 'array'
						, length		: {
							kind		: 'comparator'
							, comparator: '='
							, type		: 'number'
							, value		: 1
						}
						, data			: [
							{
								kind		: 'type'
								, type		: 'array'
							}
							, {
								kind		: 'array'
								, length	: {
									kind			: 'comparator'
									, comparator	: '='
									, type			: 'number'
									, value			: 1
								}
								, data				: [ 
									{
										kind		: 'type'
										, type		: 'string'
									}, {
										kind		: 'comparator'
										, comparator: '='
										, type		: 'string'
										, value		: 'a'
									} 
								]
							}
						]
					}

				]
			} ];



			it( 'has an getPlayrJSON method', function() {

				expect( typeof( new jb.entities.ObjectEntity().getPlayrJSON ) ).toBe( 'function' );
				expect( typeof( new jb.entities.StringEntity().getPlayrJSON ) ).toBe( 'function' );
				expect( typeof( new jb.entities.ArrayEntity().getPlayrJSON ) ).toBe( 'function' );

			} );



			it( 'returns the correct value for all cases.', function() {

				cases.forEach( function( testCase ) {

					var parsed	 	= service.parse( JSON.stringify( testCase.json ) )
						, exported	= parsed.getPlayrJSON();

					expect( exported ).toEqual( testCase.parsed );

				} );

			} );




		} );








	} );

} )();