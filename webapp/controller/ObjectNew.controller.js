sap.ui.define([
	"com/evorait/evonotify/controller/FormController",
	"com/evorait/evonotify/model/formatter"
], function (FormController, formatter) {
	"use strict";

	return FormController.extend("com.evorait.evonotify.controller.ObjectNew", {

		formatter: formatter,

		oViewModel: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * worklist on init
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("objectNew").attachMatched(this._onRouteMatched, this);
		},

		/**
		 * life cycle event before view rendering
		 */
		onBeforeRendering: function () {

		},

		/**
		 * on press back button
		 * @param oEvent
		 */
		onNavBack: function () {
			//show confirm message
			this.confirmEditCancelDialog();
		},

		/**
		 * Object after rendering
		 */
		onAfterRendering: function () {},

		/**
		 * Object on exit
		 */
		onExit: function () {

		},

		/**
		 * @param oEvent
		 */
		onPressCancel: function (oEvent) {
			//show confirm message
			this.confirmEditCancelDialog();
		},

		/**
		 * @param oEvent
		 */
		onPressSave: function (oEvent) {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("ObjectNew", "validateFields", {});
		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		/**
		 * new order create
		 * @param oEvent
		 * @private
		 */
		_onRouteMatched: function (oEvent) {
			this.oViewModel = this.getModel("viewModel");
			this.oViewModel.setProperty("/busy", true);
			this.getModel().metadataLoaded().then(function () {
				this.oViewModel.setProperty("/isNew", true);
				this.oViewModel.setProperty("/editMode", true);

				var oContext = this.getModel().createEntry("/PMNotifications");
				this.getView().unbindElement();
				this.getView().setBindingContext(oContext);
				this.oViewModel.setProperty("/busy", false);
			}.bind(this));
		}
	});
});