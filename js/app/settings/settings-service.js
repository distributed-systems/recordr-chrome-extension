/**
* Service that gets settings from chrome.storage and updates it automatically every time
* a settings is changed.
*/

/* global chrome */

( function() {

	'use strict';

	angular
	.module( 'jb.apiRecorder.settingsService', [] )

	.factory( 'SettingsService', [ '$rootScope', '$q', function( $rootScope, $q ) {

		var _getSettingsPromise;

		var Settings = function() {

			this.data = {
				contentTypesToRecord			: undefined
				, responseHeadersToIgnore		: undefined
				, requestHeadersToIgnore		: undefined
			};

			this.setupChangeListener();

		};


		Settings.prototype.setupChangeListener = function() {

			var self = this;

			// Store data on change
			$rootScope.$watch( function() {
				return self.data;
			}, function() {
				chrome.storage.sync.set( self.data, function() {
					console.log( 'Settings: Stored data %o: %o', self.data );
				} );
			}, true );

		};



		Settings.prototype.getSettings = function() {
		
			var self = this;

			if( _getSettingsPromise ) {
				return _getSettingsPromise.promise;
			}


			var keys = Object.keys( self.data );
			console.log( 'Settings: Get data for keys %o', keys );

			_getSettingsPromise = $q.defer();

			chrome.storage.sync.get( keys, function( result ) {
				
				for( var i in result ) {

					if( self.data.hasOwnProperty( i ) ) {
						self.data[ i ] = result[ i ];
					}

				}

				$rootScope.$apply( function() {
					console.log( 'SettingsService: Settings %o gotten', self.data );
					_getSettingsPromise.resolve( self.data );
				} );

			} );

			return _getSettingsPromise.promise;
						
		};

		return new Settings();

	} ] );

} )();