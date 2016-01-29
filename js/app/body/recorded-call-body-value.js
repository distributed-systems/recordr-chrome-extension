/**
* Directive to display the headers of a request or response
*/

( function() {
	'use strict';

	angular
	.module( 'jb.apiBody.component' )
	.directive( 'recordedCallBodyValue', [ function() {

		return {
			controller			: 'RecordedCallBodyValueController'
			, controllerAs		: 'recordedCallBodyValue'
			, bindToController	: true
			, link				: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
			, templateUrl		: '/js/app/body/recorded-call-body-value-template.html'
			, scope				: {
				data			: '='
			}
		};


	} ] )

	.controller( 'RecordedCallBodyValueController', [ function() {

		var _element;

		// Make types available to frontend
		this.types = jb.StringTypeRecognizer.types;

		this.isCreatingConstraint = false;
		this.availableConstraints = [ {
				name		: 'Regular Expression'
				, value 	: 'regex'
			}, {
				name		: 'Comparator'
				, value		: 'comparator'
			}
		];
		this.newConstraintType = this.availableConstraints[ 0 ];

		this.init = function( el ) {
			_element = el;
		};


		/**
		* Start creating a new constraint (user clicked button)
		*/
		this.startCreatingConstraint = function() {
			this.isCreatingConstraint = true;
		};

		/**
		* Create new constraint (type: this.newConstraintType)
		*/
		this.createConstraint = function() {
			this.data.createConstraint( this.newConstraintType );
			this.newConstraintType = undefined; // Or change event might not fire
			this.isCreatingConstraint = false;
		};



	} ] );

} )();

