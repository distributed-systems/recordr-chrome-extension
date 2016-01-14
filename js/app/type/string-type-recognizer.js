( function() {

	'use strict';

	/**
	* Maybe use static methods and properties to save resources? #todo
	*/
	var StringTypeRecognizer = function() {

		this.types = {
			string				: 'string'
			, number			: 'number'
			, date				: 'date'
		};

	};


	/**
	* Tries to recognize type of value passed, returns best guess: 
	* - date
	* - number
	* - string
	* Very primitive (but quick) implementation.
	*/
	StringTypeRecognizer.prototype.recognizeType = function( value ) {

		if( parseInt( value, 10 ) == value ) {
			return this.types.number;
		}

		if( parseFloat( value ) == value ) {
			return this.types.number;
		}

		// Date recognizes numbers as dates – move 
		// below number
		var date = new Date( value );
		if( !isNaN( date.getTime() ) ) {
			return this.types.date;
		}

		return this.types.string;

	};


	/**
	* Returns all possible comparators for a certain type.
	*/
	StringTypeRecognizer.prototype.getComparatorsForType = function( type ) {

		if( type === this.types.string ) {
			return [ '=', 'startsWith', 'endsWith', 'contains', '!=', 'containsNot' ];
		}

		else if( type === this.types.number ) {
			return [ '=', '>', '>=', '<', '<=', '!=' ];
		}

		else if( type === this.types.date ) {
			return [ '=', '>', '>=', '<', '<=', '!=' ];
		}

		else {
			console.error( 'StringTypeRecognizer: Unknown type ' + type );
		}

	};


	// Make function public
	window.jb = window.jb || {};
	window.jb.StringTypeRecognizer = StringTypeRecognizer;


} )();