/*global location*/
sap.ui.define([
	"com/evorait/evonotify/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/evorait/evonotify/model/formatter"
], function (
	BaseController,
	JSONModel,
	History,
	formatter
) {
	"use strict";

	return BaseController.extend("com.evorait.evonotify.controller.ObjectItem", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this.getRouter().getRoute("item").attachPatternMatched(this._onObjectMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler  for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function () {
			if (!this.getModel("viewModel").getProperty("/isNew")) {
				this.navBack();
			}
		},

		navBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			var oContext = this.getView().getBindingContext();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else if (oContext) {
				var obj = oContext.getObject();
				this.getRouter().navTo("object", {
					objectId: obj.MaintenanceNotification
				}, true);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		/**
		 * show edit forms
		 */
		onPressEdit: function () {
			this._setEditMode(true);
		},

		onPressSave: function () {

		},

		onPressCancel: function () {

		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sItemId = oEvent.getParameter("arguments").itemId,
				oViewModel = this.getModel("viewModel"),
				oDataModel = this.getModel();

			var sObjectId = oEvent.getParameter("arguments").objectId;

			oDataModel.metadataLoaded().then(function () {
				oViewModel.setProperty("/isEdit", false);

				var sObjectPath = this.getModel().createKey("PMNotificationItemSet", {
					MaintenanceNotification: sObjectId,
					MaintenanceNotificationItem: sItemId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("viewModel"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				parameters: {
					expand: "NavToItemCause,NavToItemTask,NavToItemActivity"
				},
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oViewModel = this.getModel("viewModel"),
				oElementBinding = oView.getElementBinding(),
				oContext = oElementBinding.getBoundContext();

			// No data for the binding
			if (!oContext) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			//Todo set catalogs
			var oObject = oView.getBindingContext().getObject();

			if (oObject.MaintNotifObjPrtCodeCatalog === "") {
				oObject.MaintNotifObjPrtCodeCatalog = "B";
			}
			if (oObject.MaintNotifDamageCodeCatalog === "") {
				oObject.MaintNotifDamageCodeCatalog = "C";
			}

			// Everything went fine.
			oViewModel.setProperty("/busy", false);
		},

		_setEditMode: function (isEdit) {
			if (isEdit) {
				this.getModel("viewModel").setProperty("/showMode", !isEdit);
				this.getModel("viewModel").setProperty("/editMode", isEdit);
			} else {
				var MaintenanceNotification = this.getModel("viewModel").getProperty("/MaintenanceNotification"),
					sPath = this.getModel().getContext("/PMNotificationSet").getPath(),
					isCompleted = this.getModel().getProperty(sPath + "('" + MaintenanceNotification + "')/IsCompleted"),
					isDeleted = this.getModel().getProperty(sPath + "('" + MaintenanceNotification + "')/IsDeleted");

				if (isCompleted || isDeleted) {
					this.getModel("viewModel").setProperty("/showMode", isEdit);
				} else {
					this.getModel("viewModel").setProperty("/showMode", !isEdit);
				}
			}
		}

	});

});