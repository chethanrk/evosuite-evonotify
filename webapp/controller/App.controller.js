sap.ui.define([
	"com/evorait/evonotify/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.evorait.evonotify.controller.App", {
		onInit: function () {
			var oViewModel = this.getModel("viewModel"),
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};
			this.getModel().metadataLoaded().then(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});
});