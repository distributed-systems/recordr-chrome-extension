/**
* Directive for the calls list. Lists all calls that were made.
*/

( function() {
	'use strict';

	angular
	.module( 'jb.apiRecorder.recorder', [] )
	.directive( 'recordedCallsList', [ 'APIRecorderService', function( APIRecorderService ) {

		return {
			controller			: 'RecordedCallsListController'
			, controllerAs		: 'recordedCallsList'
			, bindToController	: true
			, link				: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
			, templateUrl: '/js/app/recorder/recorded-calls-list-template.html'
		};


	} ] )

	.controller( 'RecordedCallsListController', [ 'APIRecorderService', function( APIRecorderService ) {

		this.init = function(el) {
		};

		this.getCalls = function() {
			return APIRecorderService.getCalls();
		};

	} ] );

} )();

