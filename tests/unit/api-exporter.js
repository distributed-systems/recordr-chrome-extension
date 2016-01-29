/* global describe, beforeEach, jb, it, expect */
( function() {

	'use strict';

	describe( 'APICallsExporter', function() {

		var exporter;

		beforeEach( function() {
			exporter = new jb.APICallExporter();
		} );

		it( 'has an export method', function() {
			expect( typeof( exporter.export ) ).toBe( 'function' );
		} );


		it( 'adds correct basic information', function() {

			var res = exporter.export( [] );
			expect( res.author ).toBe( 'chrome-extension' );
			expect( res.created ).toBeDefined();
			expect( isNaN( new Date( res.created ).getTime() ) ).toBe( false );

			expect( res.description ).toBeDefined();
			expect( res.version ).toBe( '0.0.1' );
			expect( res.protocolVersion ).toBe( '0.1.x' );

		} );

		it( 'exports single request correctly (request data only)', function() {

			var data = {
				name			: 'patch-/'
				, request		: {
					body		: [ 
						{
							key		: 'name-1'
							, value	: 'value-1'
						}, {
							key		: 'name-2'
							, value	: 'value-2'
						} 
					]
					, completeUrl	: 'http://joinbox.com/entity/2'
					, headers		: [
						{
							name	: 'name-1'
							, value	: 'value-1'
						}, {
							name	: 'name-2'
							, value	: 'value-2'
						}
					]
					, method		: 'PATCH'
					, pauseBefore	: 500
					, url			: '/'
				}
				, response			: {}
			};

			// Two requests to check for pause inbetween
			var res = exporter.export( [ data, data ] );


			// AMOUNT of scenarios
			expect( res.scenario.length ).toBe( 3 );

			// PAUSE (not before first request!)

			// REQUEST
			var scenario = res.scenario[ 0 ];
			expect( scenario.kind ).toBe( 'request' );
			expect( scenario.id ).toBe( 'patch-/');

			// request
			var req = scenario.request;
			expect( req.method ).toBe( 'PATCH' );
			expect( req.url ).toBe( 'http://joinbox.com/entity/2' );

			// request.headers
			expect( Object.keys( req.headers ).length ).toBe( 2 );
			expect( req.headers[ 'name-1' ] ).toBe( 'value-1' );
			expect( req.headers[ 'name-2' ] ).toBe( 'value-2' );

			// request.content (body)
			expect( Object.keys( req.content ).length ).toBe( 2 );
			expect( req.content[ 'name-1' ] ).toBe( 'value-1' );
			expect( req.content[ 'name-2' ] ).toBe( 'value-2' );

			// PAUSE
			expect( res.scenario[ 1 ].kind ).toBe( 'pause' );
			expect( res.scenario[ 1 ].duration ).toBe( 500 );

			// 2nd SCENARIO
			expect( res.scenario[ 0 ] ).toEqual( res.scenario[ 2 ] );

		} );


	

		it( 'exports request without header/body correctly', function() {

			var res = exporter.export( [ {
				request		: {
					body		: undefined
					, headers	: undefined
				}
				, response		: {}
			} ] );

			expect( res.scenario[ 0 ].body ).toBeUndefined();
			expect( res.scenario[ 0 ].headers ).toBeUndefined();

		} );



		it( 'exports response correctly (without body)', function() {

			var res = exporter.export( [ {
				request					: {}
				, response				: {
					status				: 200
					, responseTime		: {
						value			: 250
						, comparator	: '<='
					}
					, headers			: [
						{
							name		: 'name-1'
							, value		: 'value-1'
							, type		: 'string'
							, comparator: '='
							, optional	: false
						}, {
							name		: 'name-2'
							, value		: 2500
							, type		: 'number'
							, comparator: '<'
							, optional	: true
						}
					] 
				}
			} ] );


			// Don't export pauses
			expect( res.scenario.length ).toBe( 1 );

			var resp = res.scenario[ 0 ].response;


			// Status
			expect( resp.status ).toBe( 200 );


			// Timing
			expect( resp.responseTime ).toEqual( {
				optional				: false
				, comparator			: '<='
				, value					: 250
				, type					: 'number'
				, kind					: 'comparator'
			} );


			// Headers
			expect( Object.keys( resp.headers ).length ).toBe( 2 );
			
			expect( resp.headers[ 'name-1' ] ).toEqual( {
				kind					: 'comparator'
				, type					: 'string'
				, comparator			: '='
				, value					: 'value-1'
				, optional				: false
			} );

			expect( resp.headers[ 'name-2' ] ).toEqual( {
				kind					: 'comparator'
				, type					: 'number'
				, comparator			: '<'
				, value					: 2500
				, optional				: true
			} );

		} );




		it( 'exports a response body correctly', function() {

			var bodies = [
				{
					input: {
						type				: 'array'
						, length			: {
							comparator		: '='
							, value			: 3
						}
						, values			: {
							type			: 'string'
						}
					}
					, output: {
						kind				: 'array'
						, length			: {
							kind			: 'comparator'
							, comparator	: '='
							, value			: 3
						}
						, data				: {
							kind			: 'type'
							, type			: 'string'
						}
					}
				}


				/*, {
					input: {
						type				: 'array'
						, length			: {
							comparator		: '='
							, value			: 3
						}
						, values			: {
							type			: 'string'
						}
					}
					, output: {
						kind				: 'array'
						, length			: {
							kind			: 'comparator'
							, comparator	: '='
							, value			: 3
						}
						, data				: {
							kind			: 'type'
							, type			: 'string'
						}
					}
				}*/

			];


			/*var res = exporter.export( [ {
				request					: {}
				, response				: {
					body				: undefined
				}
			} ] );*/


		} );


	

	} );

} )();