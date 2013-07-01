/*global require */
(function () {

	'use strict';

	require.config({
		baseUrl: 'js',
		paths: {
			Ractive: 'lib/Ractive',
			Statesman: 'lib/Statesman'
		},
		urlArgs: 'bust=' + Date.now()
	});

	require([ 'app' ]);

}());