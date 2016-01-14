/**
* Directive to display the headers of a request or response
*/

( function() {
	'use strict';

	angular
	.module( 'jb.apiRecorder.recorder' )
	.directive( 'recordedCallHeaders', [ function() {

		return {
			controller			: 'RecordedCallHeadersController'
			, controllerAs		: 'recordedCallHeaders'
			, bindToController	: true
			, link				: function( scope, el, attrs, ctrl ) {

				ctrl.init( el );

			}
			, templateUrl		: '/js/app/recorder/recorded-call-headers-template.html'
			, scope				: {
				// Request (instead of headers) must be passed so that we can
				// remove/add headers
				request			: '='
			}
		};


	} ] )

	.controller( 'RecordedCallHeadersController', [ function() {

		var _isAddingHeader			= false
			, _stringTypeRecognizer	= new jb.StringTypeRecognizer();

		// Make types available to frontend
		this.types = _stringTypeRecognizer.types;

		this.init = function() {
			this.newHeaderName = undefined;
		};



		this.addHeader = function() {
			_isAddingHeader = true;
		};

		this.cancelHeaderCreation = function() {
			_isAddingHeader = false;
		};

		this.isAddingHeader = function() {
			return _isAddingHeader;
		};



		/**
		* Returns valid comparators for a certain type
		*/
		this.getComparatorsForDataType = function( type ) {
			var comparators = _stringTypeRecognizer.getComparatorsForType( type );
			return comparators;
		};


		this.createHeader = function() {
			this.request.createHeader( this.newHeaderName );
			_isAddingHeader = false;
		};


	} ] );

} )();

