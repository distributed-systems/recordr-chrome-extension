/**
* Fakes a chrome environment in a regular browser.
*/
( function() {

	'use static';



	var chromeDummy = chrome || {};


	// Network
	if( !chromeDummy.devtools ) {
		chromeDummy.devtools = {};
	}

	if( !chromeDummy.devtools.network ) {
		console.log( 'ChromeEnvironment: Create network property.' );
		chromeDummy.devtools.network = new window.jb.chromeDevtoolsNetwork();
	}


	// Storage
	if( !chromeDummy.storage ) {
		console.log( 'ChromeEnvironment: Create storage property.' );
		chromeDummy.storage = new window.jb.chromeDevtoolsStorage();
	}

	console.log( 'ChromeEnvironment: chrome dummy is %o', chromeDummy );

	window.chrome = chromeDummy;


} )();