sap.ui.define([
	"com/evorait/evonotify/controller/BaseController",
	"com/evorait/evonotify/model/formatter",
	"com/evorait/evonotify/model/models"
], function (BaseController, formatter, models) {
	"use strict";

	return BaseController.extend("com.evorait.evonotify.controller.DialogBaseController", {

		/**
		 * save the changes of the edit/new operations
		 */
		saveDialogChanges: function (oDialogCtrl, callbackFn) {
			oDialogCtrl.setBusy(true);

			var oModel = oDialogCtrl.getModel();
			oModel.submitChanges({
				success: function (oData) {
					oDialogCtrl.setBusy(false);
					var responseCode = oData.__batchResponses[0].__changeResponses;
					if (responseCode) {
						if (responseCode[0].statusCode === "200" || responseCode[0].statusCode === "201" || responseCode[0].statusCode === "204") {
							callbackFn(oData);
						}
					}
				}.bind(this),
				error: function () {
					oDialogCtrl.setBusy(false);
				}.bind(this)
			});
		}
	});
});