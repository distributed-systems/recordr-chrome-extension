( function() {

	'use strict';

	angular

	.module( 'jb.bodyComponentTest', [ 'jb.apiBody.component', 'jb.apiBody.parser', 'ngMaterial' ] )

	.controller( 'BodyTestController', [ 'BodyParserService', function( BodyParserService ) {

		var body = '{"id":5,"id_tenant":2,"created":"2014-08-05T01:24:06.000Z","updated":"2014-08-05T09:19:44.000Z","deleted":null,"userLoginEmail":[{"id_user":5,"email":"f@fxstr.com"}],"stringTest":["Value1","Value2"],"arrayInArrayTest":[["Array1-1","Array1-2"],["Array2-1","Array2-2"]],"userProfile":[{"id_user":5,"id_gender":1,"id_language":2,"firstName":"Felix","lastName":"Steiner","address":"Lindenweg 15","zip":"4534","city":"Flumenthal","birthdate":"1953-04-02T22:00:00.000Z","phone":"41797464661","gender":{"id":1,"name":"male","short":"m"}}]}';
		this.request = {
			body 		: BodyParserService.parse( body )
		};

	} ] );

} )();

