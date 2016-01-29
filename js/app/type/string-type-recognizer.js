( function() {

	'use strict';

	/**
	* Maybe use static methods and properties to save resources? #todo
	*/
	var StringTypeRecognizer = function() {

	};

	StringTypeRecognizer.types = {
		string				: 'string'
		, number			: 'number'
		, date				: 'date'
		, bool				: 'boolean'
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
			return StringTypeRecognizer.types.number;
		}

		if( parseFloat( value ) == value ) {
			return StringTypeRecognizer.types.number;
		}

		// If we use !isNaN(new Date(value).getTime()) it matches too many things. 
		// Use regex: https://en.wikipedia.org/wiki/ISO_8601
		var dateRegex = /^(\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(Z|\+\d{2}:\d{2}))?)$/;
		if( dateRegex.test( value ) ) {
			return StringTypeRecognizer.types.date;
		}

		return StringTypeRecognizer.types.string;

	};




	// Make function public
	window.jb = window.jb || {};
	window.jb.StringTypeRecognizer = StringTypeRecognizer;


} )();