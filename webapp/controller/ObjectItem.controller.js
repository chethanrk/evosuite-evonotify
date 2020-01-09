/*global location*/
sap.ui.define([
	"com/evorait/evonotify/controller/FormController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/evorait/evonotify/model/formatter"
], function (
	FormController,
	JSONModel,
	History,
	formatter
) {
	"use strict";

	return FormController.extend("com.evorait.evonotify.controller.ObjectItem", {

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
			if (this.getModel("viewModel").getProperty("/editMode")) {
				this.cancelFormHandling(true);
			} else {
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
			this.getModel("viewModel").setProperty("/editMode", true);

			//set based on NotificationType catalog properties when they are missed
			var oData = this.getView().getBindingContext().getObject();
			if (!oData.MaintNotifObjPrtCodeCatalog || !oData.MaintNotifDamageCodeCatalog) {
				this.getDependenciesAndCallback(this._addRequiredProperties.bind(this));
			}
		},

		onPressSave: function () {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("ItemObject", "validateFields", {});
		},

		onPressCancel: function () {
			//show confirm message
			this.cancelFormHandling();
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

		/**
		 * on page bindinge change load new data
		 */
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

			// Everything went fine.
			oViewModel.setProperty("/busy", false);
		},

		/**
		 * when edit of an item is allowed and edit was pressed
		 * also when some properties like catalog was not filled
		 * set this properties in editMode
		 * @param {string} oContextData
		 * @param {string} mResults
		 * @private
		 */
		_addRequiredProperties: function (oContextData, mResults) {
			if (mResults) {
				var sPath = this.getView().getBindingContext().getPath();
				this.getModel().setProperty(sPath + "/MaintNotifObjPrtCodeCatalog", mResults.CatalogTypeForObjParts);
				this.getModel().setProperty(sPath + "/MaintNotifDamageCodeCatalog", mResults.CatalogTypeForDamage);
			}
		}

	});

});