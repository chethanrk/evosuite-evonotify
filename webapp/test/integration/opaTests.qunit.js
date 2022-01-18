/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/evorait/evosuite/evonotify/localService/mockserver",
		"com/evorait/evosuite/evonotify/test/integration/AllJourneys"
	], function (mockserver) {
		mockserver.init();
		QUnit.start();
	});
});