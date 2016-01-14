/**
* Directive to display the headers of a request or response
*/

( function() {
	'use strict';

	angular
	.module( 'jb.apiBody.component', [ 'RecursionHelper' ] )
	.directive( 'recordedCallBody', [ function() {

		return {
			controller			: 'RecordedCallBodyController'
			, controllerAs		: 'recordedCallBody'
			, bindToController	: true
			, link				: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
			, templateUrl		: '/js/app/body/recorded-call-body-template.html'
			, scope				: {
				// Request (instead of headers) must be passed so that we can
				// remove/add headers
				data			: '='
			}
		};


	} ] )

	.controller( 'RecordedCallBodyController', [ 'BodyHelperService', function( BodyHelperService ) {

		var _element;


		this.init = function( el ) {
			_element = el;
		};


		this.bodyHelper = BodyHelperService;

	} ] );

} )();

