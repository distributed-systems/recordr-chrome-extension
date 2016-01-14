/**
* Directive for a card that represents a single call.
*/

( function() {
	'use strict';

	angular
	.module( 'jb.apiRecorder.recorder' )
	.directive( 'recordedCall', [ function() {

		return {
			controller			: 'RecordedCallController'
			, controllerAs		: 'recordedCall'
			, bindToController	: true
			, link				: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
			, templateUrl		: '/js/app/recorder/recorded-call-template.html'
			, scope				: {
				callData		: '='
			}
		};


	} ] )

	.controller( 'RecordedCallController', [ function() {

		var _visible = false;

		this.init = function(el) {
		};

		this.toggleVisibility = function() {
			_visible = !_visible;
		};

		this.isVisible = function() {
			return _visible;
		};

	} ] );

} )();

