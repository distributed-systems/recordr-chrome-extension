( function() {

	'use strict';

	/**
	* Allows us to work with API playr instruction files in the frontend 
	* (angular directive) by providing some helper methods.
	*/
	var BodyHelper = function() {
	};

	/**
	* Returns the item in array which has a property kind with name kind, e.g.
	* [
	*     { kind: 'type', value: 'string' }
	*   , { kind: 'regex', value: '^g' }
	* ]
	* getConstraint('type') returns { kind: 'type', value: 'string' }
	*/
	BodyHelper.prototype.getConstraint = function( node, kind ) {

		if( !node || !node.length ) {
			return;
		}

		if( !Array.isArray( node ) ) {
			console.error( 'BodyHelper: node is not an array: %o', node );
			return;
		}

		var match;
		node.some( function( item ) {
			if( item.kind === kind ) {
				match = item;
				return true;
			}
		} );

		console.error( match );

		return match;

	};



	/**
	* Quick-access method for getConstraint(type)
	*/
	BodyHelper.prototype.getType = function( data ) {

		var typeObject = this.getConstraint( data, 'type' );
		if( !typeObject || !typeObject.type ) {
			return false;
		}
		return typeObject.type;

	};



	window.jb = window.jb || {};
	window.jb.BodyHelper = BodyHelper;

} )();





( function() {

	'use strict';

	angular
	.module( 'jb.apiBody.helper', [] )
	.factory( 'BodyHelperService', [ function() {

		return new window.jb.BodyHelper();

	} ] );

} )();