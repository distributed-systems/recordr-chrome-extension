/**
* Provides a dummy service that mimics chrome devtools' network functionality for in-browser-testing, especially
* - network.onRequestFinished.addListener
* - request.getContent
*/


( function() {

	'use strict';

	var OnRequestFinished = function() {
		this._requestInterval = undefined;
	};

	OnRequestFinished.prototype.addListener = function( cb ) {

		setTimeout( function() {
			cb( generateCall() );
		}, 10 );
		this._requestInterval = setInterval( function() {
			cb( generateCall() );
		}, 500 );

	};

	OnRequestFinished.prototype.removeListener = function() {
		clearInterval( this._requestInterval );
	};



	function generateCall() {

		var ret = {};

		ret.request = {
			bodySize: 0
			, headers: [
				  { name: 'Pragma', value: 'no-cache' }
				, { name: 'Select', value: 'id,name,venueFloor.*,city.zip,city.name' }
				, { name: 'Order', value: 'id asc' }
				, { name: 'API-Version', value: '0.1' }
			]
			, method: 'GET'
			, url: 'https://backoffice.emotions.cornercard.ch/venue?_nocache=1451932961267'
		};


		var contentTypes = [ 'application/json', 'text/json', 'in/valid' ];

		ret.response = {
			headers: [
				  { name: 'Date', value: new Date().toString() }
				, { name: 'Rate-Limit-Cost', value: 290 }
				, { name: 'Content-Language', value: 'de' }
				, { name: 'Content-Type', value: contentTypes[ Math.floor( Math.random() * 3 ) ] } // Needed or body won't be parsed!
			]
			, status: 200
		};

		ret.getContent = function( cb ) {
			var content = '[{"id":1,"name":"Konservatorium für Musik Bern","nullValue":null,"date":"2015-01-28","id_city":1756,"hasCity":true,"venueFloor":[{"id":1,"id_venue":1,"name":null,"created":"2014-08-04T13:39:14.000Z","updated":"2015-05-18T03:02:31.000Z","deleted":null,"capacity":null,"accessible":null}],"city":{"zip":"3011","id":1756,"name":"Bern"}},{"id":2,"name":"Schüür","id_city":3345,"venueFloor":[{"id":15,"id_venue":2,"name":null,"created":"2014-08-04T13:39:14.000Z","updated":"2015-05-18T10:04:43.000Z","deleted":null,"capacity":null,"accessible":null},{"id":11,"id_venue":2,"name":"Garten","created":"2014-08-04T13:39:14.000Z","updated":"2015-05-18T05:19:09.000Z","deleted":null,"capacity":null,"accessible":null},{"id":9,"id_venue":2,"name":"Bar","created":"2014-08-04T13:39:14.000Z","updated":"2015-05-18T05:20:00.000Z","deleted":null,"capacity":null,"accessible":null}],"city":{"zip":"6005","id":3345,"name":"Luzern"}},{"id":3,"name":"Alte Kaserne","id_city":4913,"venueFloor":[{"id":4,"id_venue":3,"name":"Saal","created":"2014-08-04T13:39:14.000Z","updated":"2015-05-16T04:56:31.000Z","deleted":null,"capacity":null,"accessible":null},{"id":5,"id_venue":3,"name":null,"created":"2014-08-04T13:39:14.000Z","updated":"2015-05-18T04:52:03.000Z","deleted":null,"capacity":null,"accessible":null},{"id":2,"id_venue":3,"name":"Bistro","created":"2014-08-04T13:39:14.000Z","updated":"2015-05-18T04:51:12.000Z","deleted":null,"capacity":null,"accessible":null},{"id":3,"id_venue":3,"name":"Foyer","created":"2014-08-04T13:39:14.000Z","updated":"2015-05-18T01:27:44.000Z","deleted":null,"capacity":null,"accessible":null}],"city":{"zip":"8400","id":4913,"name":"Winterthur"}},{"id":4,"name":"Atlantis","id_city":2657,"venueFloor":[{"id":6,"id_venue":4,"name":null,"created":"2014-08-04T13:39:14.000Z","updated":"2015-05-18T05:10:16.000Z","deleted":null,"capacity":null,"accessible":null}],"city":{"zip":"4010","id":2657,"name":"Basel"}},{"id":5,"name":"Albani Music Club","id_city":4913,"venueFloor":[{"id":12,"id_venue":5,"name":false,"created":"2014-08-04T13:39:14.000Z","updated":"2015-05-18T05:07:01.000Z","deleted":null,"capacity":null,"accessible":null}],"city":{"zip":"8400","id":4913,"name":"Winterthur"}},{"id":6,"name":"Boa-Kulturzentrum","id_city":3345,"venueFloor":[{"id":14,"id_venue":6,"name":null,"created":"2014-08-04T13:39:14.000Z","updated":"2014-08-26T18:53:43.000Z","deleted":null,"capacity":null,"accessible":null},{"id":8,"id_venue":6,"name":"Bar","created":"2014-08-04T13:39:14.000Z","updated":"2014-08-26T18:53:43.000Z","deleted":null,"capacity":null,"accessible":null},{"id":10,"id_venue":6,"name":"Anbau","created":"2014-08-04T13:39:14.000Z","updated":"2014-08-26T18:53:43.000Z","deleted":null,"capacity":null,"accessible":null},{"id":7,"id_venue":6,"name":"Halle","created":"2014-08-04T13:39:14.000Z","updated":"2014-08-26T18:53:43.000Z","deleted":null,"capacity":null,"accessible":null}],"city":{"zip":"6005","id":3345,"name":"Luzern"}},{"id":7,"name":"Café Restaurant Zähringer","id_city":4555,"venueFloor":[{"id":13,"id_venue":7,"name":null,"created":"2014-08-04T13:39:14.000Z","updated":"2015-05-18T04:21:59.000Z","deleted":null,"capacity":null,"accessible":null}],"city":{"zip":"8001","id":4555,"name":"Zürich"}},{"id":8,"name":"Podium 41","id_city":3551,"venueFloor":[{"id":17,"id_venue":8,"name":null,"created":"2014-08-04T13:39:14.000Z","updated":"2015-05-18T01:40:04.000Z","deleted":null,"capacity":null,"accessible":null}],"city":{"zip":"6300","id":3551,"name":"Zug"}},{"id":9,"name":"Mokka","id_city":2248,"venueFloor":[{"id":18,"id_venue":9,"name":"Keller","created":"2014-08-04T13:39:14.000Z","updated":"2014-08-26T18:53:44.000Z","deleted":null,"capacity":null,"accessible":null},{"id":20,"id_venue":9,"name":null,"created":"2014-08-04T13:39:14.000Z","updated":"2015-05-18T08:33:33.000Z","deleted":null,"capacity":null,"accessible":null},{"id":16,"id_venue":9,"name":"Garten","created":"2014-08-04T13:39:14.000Z","updated":"2014-08-26T18:53:44.000Z","deleted":null,"capacity":null,"accessible":null},{"id":19,"id_venue":9,"name":"Konzertraum","created":"2014-08-04T13:39:14.000Z","updated":"2014-08-26T18:53:44.000Z","deleted":null,"capacity":null,"accessible":null}],"city":{"zip":"3600","id":2248,"name":"Thun"}},{"id":10,"name":"Club Flamingo","id_city":4559,"venueFloor":[{"id":21,"id_venue":10,"name":null,"created":"2014-08-04T13:39:15.000Z","updated":"2015-05-18T05:11:10.000Z","deleted":null,"capacity":null,"accessible":null}],"city":{"zip":"8005","id":4559,"name":"Zürich"}},{"id":11,"name":"Dampfzentrale","id_city":1751,"venueFloor":[{"id":27,"id_venue":11,"name":null,"created":"2014-08-04T13:39:16.000Z","updated":"2015-05-18T11:54:43.000Z","deleted":null,"capacity":null,"accessible":null},{"id":26,"id_venue":11,"name":"Foyer International","created":"2014-08-04T13:39:16.000Z","updated":"2015-05-18T10:36:37.000Z","deleted":null,"capacity":null,"accessible":null},{"id":22,"id_venue":11,"name":"Musikkeller","created":"2014-08-04T13:39:16.000Z","updated":"2014-08-26T18:53:44.000Z","deleted":null,"capacity":null,"accessible":null},{"id":24,"id_venue":11,"name":"Kesselhaus","created":"2014-08-04T13:39:16.000Z","updated":"2015-05-18T05:07:54.000Z","deleted":null,"capacity":null,"accessible":null},{"id":23,"id_venue":11,"name":"Turbinensaal","created":"2014-08-04T13:39:16.000Z","updated":"2015-05-18T11:54:34.000Z","deleted":null,"capacity":null,"accessible":null}],"city":{"zip":"3005","id":1751,"name":"Bern"}}]';
			setTimeout( function() {
				cb( content );
			}, 10 );
		};

		// http://www.softwareishard.com/blog/har-12-spec/
		ret.startedDateTime = new Date( Date.now() - 5000 );
		ret.time = Math.round( Math.random() * 200 );

		ret.timings = {
			blocked				: Math.random() * 4
			, connect			: -1
			, dns				: -1
			, receive			: Math.random() * 4
			, send				: Math.random() * 0.5
			, ssl				: -1
			, wait				: Math.random() * 4 * 100
		};

		return ret;

	}





	/**
	* Network property of chrome devtools
	*/
	var Network = function() {
		this.onRequestFinished = new OnRequestFinished();
	};



	window.jb = window.jb || {};
	window.jb.chromeDevtoolsNetwork = Network;

} )();