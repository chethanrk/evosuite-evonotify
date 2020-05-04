sap.ui.define([
		"sap/ui/test/Opa5",
		"com/evorait/evonotify/test/integration/pages/Common"
	], function(Opa5, Common) {
		"use strict";

		Opa5.createPageObjects({
			onTheBrowserPage : {
				baseClass : Common,

				actions : {

					iChangeTheHashToSomethingInvalid : function () {
						return this.waitFor({
							success : function () {
								Opa5.getHashChanger().setHash("/somethingInvalid");
							}
						});
					},

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

				assertions : {

					iShouldSeeAnEmptyHash : function () {
						return this.waitFor({
							success : function () {
								var oHashChanger = Opa5.getHashChanger(),
									sHash = oHashChanger.getHash();
								Opa5.assert.strictEqual(sHash, "", "The Hash should be empty");
							},
							errorMessage : "The Hash is not Correct!"
						});
					}

				}

			}

		});

	}
);