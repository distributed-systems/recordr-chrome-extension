/* global describe, beforeEach, it, expect */
( function() {

	'use strict';

	describe( 'RequestBodyParser', function() {

		var parser;

		beforeEach( function() {
			parser = new window.jb.RequestBodyParser();
		} );

		it( 'has a parse method', function() {
			expect( typeof( parser.parse ) ).toBe( 'function' );
		} );

		it( 'parses a body correctly', function() {

			var data = [
				{	
					originalData	: undefined
					, parsed		: {}
				}, {
					originalData: 	{
						mimeType	: 'multipart/form-data; boundary=----WebKitFormBoundaryJcrZz3SbfGOPYSck'
						, text		: '------WebKitFormBoundaryJcrZz3SbfGOPYSck\nContent-Disposition: form-data; name="title"\n\nYears of movies and many characters played. This i...\n------WebKitFormBoundaryJcrZz3SbfGOPYSck--'
					}
					, parsed		: [ {
						key			: 'title'
						, value		: 'Years of movies and many characters played. This i...'
					} ]
				}, {
					originalData	: {
						mimeType	: "multipart/form-data; boundary=----WebKitFormBoundaryPu7nY5hr8x1Jd0eO"
						, text		: '------WebKitFormBoundaryPu7nY5hr8x1Jd0eO\nContent-Disposition: form-data; name="title"\n\nYears of movies and many characters played. This ...\n------WebKitFormBoundaryPu7nY5hr8x1Jd0eO\nContent-Disposition: form-data; name="teaser"\n\nNew\n------WebKitFormBoundaryPu7nY5hr8x1Jd0eO\nContent-Disposition: form-data; name="text"\n\nChanged.\n------WebKitFormBoundaryPu7nY5hr8x1Jd0eO--\n'
					}
					, parsed		: [ 
						{
							key		: 'title'
							, value	: 'Years of movies and many characters played. This ...'
						}, {
							key		: 'teaser'
							, value	: 'New'
						}, {
							key		: 'text'
							, value	: 'Changed.'
						} 
					]
				}
			];

			data.forEach( function( item ) {

				expect( parser.parse( item.originalData ) ).toEqual( item.parsed );

			} );

		} );


	} );

} )();


