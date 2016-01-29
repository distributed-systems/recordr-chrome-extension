/* global jb */


( function() {






	/**
	* Base/parent class for specific entities
	*/
	var Entity = function() {
		this.constraints = [];
	};



	// «static» property that holds all available sub types
	Entity.types = [ 
		{
			identifier		: 'object'
			, name			: 'Object'
		}, {
			identifier		: 'number'
			, name			: 'Number'
		}, {
			identifier		: 'array'
			, name			: 'Array'
		}, {
			identifier		: 'string'
			, name			: 'String'
		}
	];

	// Static method that creates sub types based on argument (from Entity.types)
	Entity.getTypeInstance = function( type ) {
		var className = type.substring( 0, 1 ).toUpperCase() + type.substr( 1 ) + 'Entity';
		try {
			return new jb.entities[ className ]();
		}
		catch( err ) {
			console.error( 'Entity: Could not create instance for type %o', className );
			return false;
		}
	};


	/**
	* "Static method". Takes data and returns entities that represent it. 
	* null becomes a StringEntity
	*/
	Entity.createEntityForData = function( data ) {


		if( Array.isArray( data ) ) {

			var arrayEntity = new ArrayEntity();
			arrayEntity.setupFromData( data );
			return arrayEntity;

		}

		else if( typeof data === 'object' && data !== null ) {

			var objectEntity = new ObjectEntity();
			objectEntity.setupFromData( data );
			return objectEntity;

		}
		
		else if( data === false || data === true ) {

			var boolEntity = new BooleanEntity();
			boolEntity.setupFromData( data );
			return boolEntity;

		}

		else {

			var stringType = new window.jb.StringTypeRecognizer().recognizeType( data )
				, entity;

			switch( stringType ) {

				case 'number':
					entity = new NumberEntity();
					break;

				case 'date':
					entity = new DateEntity();
					break;

				case 'string':
					entity = new StringEntity();
					break;

				default: 
					alert( 'Unknown string type: ' + stringType );
					return;

			}

			entity.setupFromData( data );
			return entity;


		}

	};




	/**
	* Nullable/optional: Can be added through frontend by clicking checkboxes
	* @param <String> name			'optional' or 'nullable'
	*/
	Entity.prototype.toggleNullableOrOptionalConstraint = function( name ) {

		var constraint = this.getConstraintsByKind( name );

		if( constraint.length ) {
			this.constraints.splice( this.constraints.indexOf( constraint ), 1 );
		}
		else {
			this.addConstraint( {
				kind		: name
				, value		: true
			} );
		}

	};





	Entity.prototype.addConstraint = function( data ) {
		this.constraints.push( data );
	};

	Entity.prototype.removeConstraint = function() {
		// To be overwritte by child classes
		console.error( 'Parent method not overwritten.' );
	};

	Entity.prototype.getAvailableConstraints = function() {
		return this.constraints;
	};

	Entity.prototype.getType = function() {
		var typeConstraint = this.getConstraintsByKind( 'type' );
		if( typeConstraint.length > 0 ) {
			return typeConstraint[ 0 ].type;
		}
		return undefined;

	};

	/**
	* Exports data to JSON (for playr). 
	*/
	Entity.prototype.getPlayrJSON = function() {
		console.error( 'Entity: getPlayrJSON not overwritten in child class' );
		return undefined;
	};


	/**
	* Returns array
	*/
	Entity.prototype.getConstraintsByKind = function( kind ) {
		var ret = [];
		this.constraints.forEach( function( item ) {
			if( item.kind === kind ) {
				ret.push( item );
			}
		} );
		return ret;
	};












	var ArrayEntity = function() {

		Entity.apply( this, arguments );

		this.addConstraint( {
			kind			: 'type'
			, type			: 'array'
		} );

		// Create empty array constraint: 
		// Used when new array is created through frontend.
		this.addConstraint( {
			kind			: 'array'
			, length		: {
				kind			: 'comparator'
				, value			: '1'
				, comparator	: '='
				, type			: 'number'
			}
			, data			: []
		} );

	};


	ArrayEntity.prototype = Object.create( Entity.prototype );
	ArrayEntity.prototype.constructor = ArrayEntity;


	/**
	* Creates a data type for the array constraint
	*/
	ArrayEntity.prototype.createDataType = function( type ) {

		var entity = Entity.getTypeInstance( type );
		console.log( 'ArrayEntity: created data type %o', entity );
		
		var arrayConstraint = this.getConstraintsByKind( 'array' );

		if( !arrayConstraint.length || !arrayConstraint[ 0 ].data || !Array.isArray( arrayConstraint[ 0 ].data ) ) {
			console.error( 'ArrayEntity: array constraint missing, can\'t set type' );
			return;
		}

		arrayConstraint[ 0 ].data.push( entity );

	};


	/**
	* Creates properties based on data passed.
	*/
	ArrayEntity.prototype.setupFromData = function( data ) {

		if( !Array.isArray( data ) ) {
			console.error( 'ArrayEntity: Cannot setup data from non-array %o', data );
			return;
		}

		var arrayConstraint = this.getConstraintsByKind( 'array' );

		if( !arrayConstraint.length ) {
			console.error( 'ArrayEntity: Cannot setup ArrayEntity from data, array constraint is missing' );
			return;
		}

		arrayConstraint[ 0 ].length.value = data.length;

		// Take FIRST entry of array to create data property on array constraint
		arrayConstraint[ 0 ].data = Entity.createEntityForData( data[ 0 ] );

	};


	ArrayEntity.prototype.getPlayrJSON = function() {
		 
		var ret = [];
		this.constraints.forEach( function( constraint ) {

			// Array constraint: getPlayrJSON for all data passed
			if( constraint.kind === 'array' ) {
				var arrayConstraint = {};
				arrayConstraint.length = constraint.length;
				arrayConstraint.kind = constraint.kind;
				arrayConstraint.data = constraint.data.getPlayrJSON();
				ret.push( arrayConstraint );
			}
			else {
				ret.push( constraint );
			}

		} );
	
		return ret;

	};














	var ObjectEntity = function() {

		Entity.apply( this, arguments );

		// Setup with default type constraint
		this.addConstraint( {
			kind			: 'type'
			, type			: 'object'
		} );

		// Empty data constraint
		this.addConstraint( {
			kind			: 'object'
			, data			: []
		} );

	};

	ObjectEntity.prototype = Object.create( Entity.prototype );
	ObjectEntity.prototype.constructor = ObjectEntity;


	ObjectEntity.prototype.removeProperty = function( property ) {

		var objectConstraint = this.getConstraintsByKind( 'object' );

		console.log( 'ObjectEntity: Remove %o from %o. Constraint is %o', property, this, objectConstraint );

		if( !objectConstraint.length || !objectConstraint[ 0 ].data ){
			console.error( 'ObjectEntity: object constraint missing, can\'t remove property' );
		}

		var data = objectConstraint[ 0 ].data;
		data.splice( data.indexOf( property ), 1 );

	};


	/**
	* Adds a default property to the object constraint. Needed to create 
	* a new property through the GUI.
	*/
	ObjectEntity.prototype.addProperty = function( type ) {
		
		// Ge a new entity depending on type, e.g. a new StringEntity
		var newPropertyContent = Entity.getTypeInstance( type );

		if( this.getConstraintsByKind( 'object' ).length > 0 ) {

			var data = this.getConstraintsByKind( 'object' )[ 0 ].data;
			data.push( {
				name			: 'newProperty'
				, content		: newPropertyContent
			} );

		}
		else {

			// Object constraint: 
			// data must be an array (not an object as in the exported JSON) 
			// because we cannot modify object keys in the frontend. Object's key
			// therefore is name property in data field. 
			// See getPlayrJSON
			this.addConstraint( {
				kind				: 'object'
				, data				: [ {
					name			: 'newProperty'
					, content		: newPropertyContent
				} ]
			} );

		}

	};

	/**
	* Mainly convert object data array to object
	*/
	ObjectEntity.prototype.getPlayrJSON = function() {

		var ret = [];
		this.constraints.forEach( function( constraint ) {

			// Object constraint: re-format data (see addProperty method for object constraints)
			if( constraint.kind === 'object' ) {

				var objectConstraint = {};
				
				objectConstraint.kind = constraint.kind;

				// Array -> object for data field
				objectConstraint.data = {};
				constraint.data.forEach( function( data ) {
	
					// Property has no/empty value: Return just the propery, as data.content has no
					// getPlayrJSON method.
					if( !data || !data.content ) {
						objectConstraint.data[ data.name ] = [];
						return true;
					}

					objectConstraint.data[ data.name ] = data.content.getPlayrJSON();

				} );

				ret.push( objectConstraint );

			}

			// Other constraint: Return directly
			else {
				ret.push( constraint );
			}

		} );

		return ret;

	};


	ObjectEntity.prototype.setupFromData = function( data ) {

		if( typeof data !== 'object' || !data ) {
			console.error( 'ObjectEntity: Cannot setup object from data %o, is not an object.', data );
			return;
		}

		var objectConstraint = this.getConstraintsByKind( 'object' );

		if( !objectConstraint.length ) {
			console.error( 'ObjectEntity: Cannot be setup from data, has no object constraint' );
			return;
		}

		var keys = Object.keys( data );
		keys.forEach( function( key ) {

			objectConstraint[ 0 ].data.push( {
				name				: key
				, content			: Entity.createEntityForData( data[ key ] )
			} );

		} );




	};










	/**
	* Base entity for string, number, date
	*/
	var ValueEntity = function( type ) {

		Entity.apply( this, arguments );

		// Store type
		this.type = type;

		this.addConstraint( {
			kind		: 'type'
			, type		: type
		} );

	};

	ValueEntity.prototype = Object.create( Entity.prototype );
	ValueEntity.prototype.constructor = ValueEntity;

	ValueEntity.prototype.removeConstraint = function( constraint ) {

		var removed = this.constraints.splice( this.constraints.indexOf( constraint ), 1 );
		if( !removed.length ) {
			console.error( 'ValueEntity: constraint %o not found, could not be removed from %o', constraint, this.constraints );
		}

	};

	ValueEntity.prototype.createConstraint = function( type ) {

		if( type === 'comparator' ) {
			this.addConstraint( {
				kind			: 'comparator'
				, comparator	: '='
				//, type		: this.type  -- Added in getPlayrJSON
				, value			: 'value'
			} );
		}
		else if (type === 'regex' ) {
			this.addConstraint( {
				kind			: 'regex'
				, value			: '^$'
			} );
		}
		else {
			alert( 'StringEntity: Uknown constraint type ' + type );
		}

	};

	ValueEntity.prototype.setupFromData = function( data ) {

		this.addConstraint( {
			kind			: 'comparator'
			, comparator	: '='
			//, type		: this.type	 -- Added in getPlayrJSON
			, value			: data
		} );

		// Nullable
		if( data === null ) {
			this.addConstraint( {
				kind		: 'nullable'
				, value		: true
			} );
		}

	};


	// Re-format data to export it for Playr
	ValueEntity.prototype.getPlayrJSON = function() {

		var ret = [];

		// Add «type» property to comparator constraints. As type may be changed in the frontend
		// we can only add the type property to the constraint object when exporting data.
		this.constraints.forEach( function( constraint, index ) {

			if( constraint.kind === 'comparator' ) {

				var constraintClone = this.constraints.slice( index, index + 1 )[ 0 ];
				constraintClone.type = this.type;
				ret.push( constraintClone );

			}

			else {
				ret.push( constraint );
			}

		}.bind( this ) );

		return ret;

	};
















	var StringEntity = function() {

		ValueEntity.apply( this, [ 'string' ] );

	};

	StringEntity.prototype = Object.create( ValueEntity.prototype );
	StringEntity.prototype.constructor = StringEntity;







	var NumberEntity = function() {

		ValueEntity.apply( this, [ 'number' ] );

	};

	NumberEntity.prototype = Object.create( ValueEntity.prototype );
	NumberEntity.prototype.constructor = NumberEntity;






	var DateEntity = function() {

		ValueEntity.apply( this, [ 'date' ] );

	};

	DateEntity.prototype = Object.create( ValueEntity.prototype );
	DateEntity.prototype.constructor = DateEntity;











	var BooleanEntity = function() {

		Entity.apply( this, arguments );

		this.addConstraint( {
			kind		: 'type'
			, type		: 'boolean'
		} );

	};

	BooleanEntity.prototype = Object.create( Entity.prototype );
	BooleanEntity.prototype.constructor = BooleanEntity;

	BooleanEntity.prototype.setupFromData = function( data ) {
		this.addConstraint( {
			kind			: 'comparator'
			, comparator	: '='
			, type			: 'boolean'	
			, value			: data
		} );
	};

	BooleanEntity.prototype.getPlayrJSON = function() {
		return this.constraints;
	};














	// Make vars public
	window.jb = window.jb || {};
	jb.entities = jb.entities || {};

	jb.entities.ObjectEntity = ObjectEntity;
	jb.entities.ArrayEntity = ArrayEntity;
	jb.entities.StringEntity = StringEntity;
	jb.entities.BooleanEntity = BooleanEntity;
	jb.entities.NumberEntity = NumberEntity;
	jb.entities.DateEntity = DateEntity;
	jb.entities.Entity = Entity;






} )();


/**
* Parses body data sent to or gotten from server, converts it into an object
* with the corresponding fields and best guesses.
*/
( function() {

	'use strict';

	angular
	.module( 'jb.apiBody.parser', [] )
	.factory( 'BodyParserService', [ function() {

		var BodyParser = function() {
		};




		function parseEntity( data ) {

			return jb.entities.Entity.createEntityForData( data );

		}



		BodyParser.prototype.parse = function( data ) {
			
			var json;

			try {
				json = JSON.parse( data );
			}
			catch( err ) {
				alert( 'Could not parse response body\'s data' );
				console.error( 'BodyParser: Could not parse JSON: ' + err.message + ' for ' + data );
				return undefined;
			}

			var ret = parseEntity( json );

			console.log( 'BodyParser: Parsed %o into %o', data, ret );

			return ret;

		};

		return new BodyParser();

	} ] );

} )();