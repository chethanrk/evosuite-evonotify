sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";

	function getFrameUrl(sHash, sUrlParameters) {
		var sUrl = jQuery.sap.getResourcePath("com/evorait/evosuite/evonotify/app", ".html");
		sHash = sHash || "";
		sUrlParameters = sUrlParameters ? "?" + sUrlParameters : "";

		if (sHash) {
			sHash = "#" + (sHash.indexOf("/") === 0 ? sHash.substring(1) : sHash);
		} else {
			sHash = "";
		}

		return sUrl + sUrlParameters + sHash;
	}

	return Opa5.extend("com.evorait.evosuite.evonotify.test.integration.pages.Common", {

		iStartTheApp: function (oOptions) {
			oOptions = oOptions || {};
			// Start the app with a minimal delay to make tests run fast but still async to discover basic timing issues
			this.iStartMyAppInAFrame(getFrameUrl(oOptions.hash, "serverDelay=50"));
		},

		iStartTheAppWithDelay: function (sHash, iDelay) {
			this.iStartMyAppInAFrame(getFrameUrl(sHash, "serverDelay=" + iDelay));
		},

		iLookAtTheScreen: function () {
			return this;
		},

		iShouldSeeTheTitle: function (sId, sText) {
			return this.waitFor({
				id: sId,
				success: function (oText) {
					strictEqual(oText.getTitle(), sText);
				}
			});
		},

		iShouldSeeTheText: function (sId, sText) {
			return this.waitFor({
				id: sId,
				success: function (oText) {
					strictEqual(oText.getText(), sText);
				}
			});
		},

		iShouldSeeDialog: function () {
			return this.waitFor({
				controlType: "sap.m.Dialog",
				success: function () {
					// we set the view busy, so we need to query the parent of the app
					Opa5.assert.ok(true, "The dialog is open");
				},
				errorMessage: "Did not find the dialog control"
			});
		},

		iShouldSeeMessageManager: function () {
			return this.waitFor({
				controlType: "sap.m.MessagePopover",
				success: function () {
					// we set the view busy, so we need to query the parent of the app
					Opa5.assert.ok(true, "Message Manager is open");
				},
				errorMessage: "Did not find the Message Manager control"
			});
		},
		iShouldSeeMessageManagerContentLength: function (n) {
			return this.waitFor({
				controlType: "sap.m.MessagePopover",
				success: function (aMessagePopover) {
					var aItems = aMessagePopover[0].getItems();
					Opa5.assert.ok(aItems.length === n, "Message Manager has " + n + " items.");
				},
				errorMessage: "Message Manager has not right number of items."
			});
		},

		iStartMyAppOnADesktopToTestErrorHandler: function (sParam) {
			this.iStartMyAppInAFrame(getFrameUrl("", sParam));
		},

		createAWaitForAnEntitySet: function (oOptions) {
			return {
				success: function () {
					var bMockServerAvailable = false,
						aEntitySet;

					this.getMockServer().then(function (oMockServer) {
						aEntitySet = oMockServer.getEntitySetData(oOptions.entitySet);
						bMockServerAvailable = true;
					});

					return this.waitFor({
						check: function () {
							return bMockServerAvailable;
						},
						success: function () {
							oOptions.success.call(this, aEntitySet);
						}
					});
				}
			};
		},

		getMockServer: function () {
			return new Promise(function (success) {
				Opa5.getWindow().sap.ui.require(["com/evorait/evosuite/evonotify/localService/mockserver"], function (mockserver) {
					success(mockserver.getMockServer());
				});
			});
		},

		theUnitNumbersShouldHaveTwoDecimals: function (sControlType, sViewName, sSuccessMsg, sErrMsg) {
			var rTwoDecimalPlaces = (/^-?\d+\.\d{2}$/);

			return this.waitFor({
				controlType: sControlType,
				viewName: sViewName,
				success: function (aNumberControls) {
					Opa5.assert.ok(aNumberControls.every(function (oNumberControl) {
							return rTwoDecimalPlaces.test(oNumberControl.getNumber());
						}),
						sSuccessMsg);
				},
				errorMessage: sErrMsg
			});
		},
		
		iShouldSeePopover: function () {
				return this.waitFor({
					controlType: "sap.m.Popover",
					searchOpenDialogs: true, // OPA framework cannot find popover without the flag set to true
					success: function () {
						Opa5.assert.ok(true, "The Popover is open");
					},
					errorMessage: "Did not find the Popover"
				});
			},

	});

});