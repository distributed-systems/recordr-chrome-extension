/**
* Directive to display the headers of a request or response
*/

( function() {
	'use strict';

	angular
	.module( 'jb.apiBody.component' )
	.directive( 'recordedCallBodyArray', [ 'RecursionHelper', function( RecursionHelper ) {

		return {
			controller			: 'RecordedCallBodyArrayController'
			, controllerAs		: 'recordedCallBodyArray'
			, bindToController	: true
			, link				: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
			, templateUrl		: '/js/app/body/recorded-call-body-array-template.html'
			, scope				: {
				data			: '='
			}
			, compile			: function( element ) {
				return RecursionHelper.compile( element );
			}
		};


	} ] )

	.controller( 'RecordedCallBodyArrayController', [ function() {

		var _element;

		this.newDataType = undefined;

		this.types = jb.entities.Entity.types;

		this.init = function( el ) {
			_element = el;
		};


		/**
		* Adds data property to array constraint
		*/
		this.setDataType = function() {

			this.data.createDataType( this.newDataType );
			this.newDataType = undefined;

		};


	} ] );

} )();

