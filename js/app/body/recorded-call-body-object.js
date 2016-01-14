/**
* Directive to display the headers of a request or response
*/

( function() {
	'use strict';

	angular
	.module( 'jb.apiBody.component' )
	.directive( 'recordedCallBodyObject', [ 'RecursionHelper', function( RecursionHelper ) {

		return {
			controller			: 'RecordedCallBodyObjectController'
			, controllerAs		: 'recordedCallBodyObject'
			, bindToController	: true
			, link				: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
			// Manual compile: required as angular doesn't get recursive direcitves
			, compile			: function( element ) {
				return RecursionHelper.compile( element );
			}
			, templateUrl		: '/js/app/body/recorded-call-body-object-template.html'
			, scope				: {
				data			: '='
			}
		};


	} ] )

	.controller( 'RecordedCallBodyObjectController', [ function() {

		var _element;

		this.isAddingProperty = false;
		this.propertyTypeToBeAdded = undefined;

		// Make available types public
		this.types = jb.entities.Entity.types;

		this.startAddingProperty = function() {
			this.isAddingProperty = true;
		};

		this.addProperty = function() {
			this.isAddingProperty = false;
			this.data.addProperty( this.propertyTypeToBeAdded );
			this.propertyTypeToBeAdded = undefined; // Or we can't look for change event
		};

		this.init = function( el ) {
			_element = el;
		};

	} ] );

} )();

