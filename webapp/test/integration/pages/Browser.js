sap.ui.require([
		'sap/ui/test/Opa5',
		'com/evorait/evolite/evonotify/test/integration/pages/Common'
	],
	function (Opa5, Common) {
		"use strict";
 
		Opa5.createPageObjects({
			onTheBrowser: {
				baseClass: Common,
				actions: {
					iPressOnTheForwardButton: function () {
						return this.waitFor({
							actions: function () {
								Opa5.getWindow().history.forward();
							}
						});
					},
					iPressOnTheBackButton: function () {
						return this.waitFor({
							actions: function () {
								Opa5.getWindow().history.back();
							}
						});
					}
				},
				assertions: {}
			}
		});
	});