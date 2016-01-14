/**
* Main-directive (instead of a controller) that handles the recorder app's topmost functionality.
*/
( function() {
	'use strict';

	angular
	.module( 'jb.apiRecorder', [ 'jb.apiRecorder.recorder', 'jb.apiRecorder.recorderService', 'jb.apiRecorder.settings', 'jb.apiBody.component', 'ngMaterial' ] )
	.directive( 'recorderApp', [ function() {

		return {
			controller				: 'RecorderAppController'
			, bindToController		: true
			, controllerAs			: 'recorderApp'
			, link					: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
		};


	} ] )


	.controller( 'RecorderAppController', [ 'APIRecorderService', function( APIRecorderService ) {

		var _recording = false
			, _settingsVisible = false;



		this.init = function() {

		};



		//
		// RECORD
		//

		this.isRecording = function() {
			return _recording;
		};

		this.toggleRecord = function() {

			if( _recording ) {
				APIRecorderService.pause();
			}
			else {
				APIRecorderService.record();
			}

			_recording = !_recording;

		};




		//
		// SETTINGS
		//

		this.toggleSettings = function() {
			_settingsVisible = !_settingsVisible;
		};

		this.settingsVisible = function() {
			return _settingsVisible;
		};




		//
		// EXPORT / CLEAR
		//

		/**
		* Returns true if data was recorded and not all calls were deleted
		*/
		this.hasData = function() {
			if( APIRecorderService.getCalls() && APIRecorderService.getCalls().length ) {
				return true;
			}
			return false;
		};

		this.clearData = function() {
			APIRecorderService.clearCalls();
		};

		this.exportData = function() {

			var json = JSON.stringify( APIRecorderService.exportCalls(), null, 4 );

			// Inspiration: http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
			var textarea = document.createElement( 'textarea' );

			textarea.style.opacity 		= 0;
			textarea.style.width 		= '1em';
			textarea.style.height 		= '1em';
			textarea.style.border 		= 'none';
			textarea.style.position 	= 'fixed';
			textarea.style.left 		= 0;
			textarea.style.top 			= 0;

			textarea.value = json;

			document.documentElement.appendChild( textarea );

			textarea.select();

			var success;
			try {
				success = document.execCommand( 'copy' );
			}
			catch( err ) {
			}

			document.documentElement.removeChild( textarea );

			if( success ) {
				alert( 'JSON copied to clipboard' );
			}
			else {
				alert( 'Could not copy JSON to clipboard.' );
			}




		};



	} ] );

} )();

