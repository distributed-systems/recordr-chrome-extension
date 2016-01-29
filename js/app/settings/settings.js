/**
* Settings directive
*/

( function() {
	'use strict';

	angular
	.module( 'jb.apiRecorder.settings', [ 'jb.apiRecorder.settingsService' ] )
	.directive( 'settings', [ function() {

		return {
			controller			: 'SettingsController'
			, controllerAs		: 'settings'
			, bindToController	: true
			, link				: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
			, templateUrl		: '/js/app/settings/settings-template.html'
		};


	} ] )

	.controller( 'SettingsController', [ '$scope', 'SettingsService', function( $scope, SettingsService ) {

		this.data = {};

		this.init = function() {
		
			var self = this;

			SettingsService.getSettings().then( function( data ) {
				console.log( 'SettingsController: Got settings %o', data );
				self.data = data;
			} );


		};

	} ] );

} )();

