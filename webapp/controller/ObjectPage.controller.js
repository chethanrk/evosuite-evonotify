sap.ui.define([
	"com/evorait/evonotify/controller/TemplateRenderController"
], function (TemplateRenderController) {
	"use strict";

	return TemplateRenderController.extend("com.evorait.evonotify.controller.ObjectPage", {

		oViewModel: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * worklist on init
		 */
		onInit: function () {
			this.oViewModel = this.getModel("viewModel");

			var oRouter = this.getRouter(),
				sHash = this.getCurrentHash();

			//route for page create new notification
			if (oRouter.getRoute("CreateNotification").match(sHash)) {
				oRouter.getRoute("CreateNotification").attachPatternMatched(function (oEvent) {
					var sViewName = "com.evorait.evonotify.view.templates.CreateNotification#Create";
					this._onRouteMatched(oEvent, sViewName, "PMNotificationSet");
				}, this);
			}

		},

		/**
		 * life cycle event before view rendering
		 */
		onBeforeRendering: function () {},

		/**
		 * Object after rendering
		 */
		onAfterRendering: function () {},

		/**
		 * Object on exit
		 */
		onExit: function () {},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		/**
		 * new order create
		 * @param oEvent
		 * @private
		 */
		_onRouteMatched: function (oEvent, sViewName, sEntitySet, mParams) {
			this.oViewModel.setProperty("/busy", true);
			this.getModel().metadataLoaded().then(function () {
				var sPath = this.getEntityPath(sEntitySet, mParams);
				this.getView().unbindElement();
				this.getView().bindElement(sPath);
				//get template and create views
				this.insertTemplateFragment(sPath, sViewName, "ObjectPageWrapper", this._afterBindSuccess.bind(this));
			}.bind(this));
		},

		_afterBindSuccess: function () {
			this.oViewModel.setProperty("/busy", false);
		}
	});
});