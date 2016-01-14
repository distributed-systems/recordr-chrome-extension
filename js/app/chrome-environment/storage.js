/**
* Provides a dummy service that mimics chrome devtools' storage functionality for in-browser-testing, especially
* - sync.set
* - sync.get
*/


( function() {

	'use strict';


	/**
	* Storage.sync property.
	*/
	var StorageSync = function() {

	};

	StorageSync.prototype.get = function( keys, cb ) {

		var ret = {};

		if( !Array.isArray( keys ) ) {
			keys = [ keys ];
		}

		keys.forEach( function( key ) {
			var value = localStorage.getItem( key );
			ret[ key ] = value;
		} );

		setTimeout( function() {
			cb( ret );
		}, 10 );

	};

	StorageSync.prototype.set = function( data, cb ) {

		setTimeout( function() {

			Object.keys( data ).forEach( function( key ) {
				window.localStorage.setItem( key, data[ key ] );
			} );
			cb();

		}, 10 );

	};



	/**
	* Storage property of chrome devtools
	*/
	var Storage = function() {

		this.sync = new StorageSync();
	
	};





	window.jb = window.jb || {};
	window.jb.chromeDevtoolsStorage = Storage;


} )();