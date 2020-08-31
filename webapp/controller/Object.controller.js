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

	return FormController.extend("com.evorait.evonotify.controller.Object", {

		formatter: formatter,

		_oContext: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
		},

		onExit: function () {

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
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

		/**
		 * Show select status dialog with maybe pre-selected filter
		 * @param oEvent
		 */
		onSelectStatus: function (oEvent) {
			var oParams = oEvent.getParameters(),
				statusKey = oParams.item.getKey();
			var oContext = oEvent.getSource().getBindingContext(),
				obj = oContext.getObject();

			if (obj.IsOutStanding === true || obj.IsInProgress === true || obj.IsPostponed === true) {
				this.getModel().setProperty(oContext.getPath() + "/Status", statusKey);
				this.saveChangedEntry({
					context: this,
					view: this._oView,
					success: function () {
						//this.view.setBusy(false);
					},
					error: function () {
						// this.oContext.setBusy(false);
					}
				});
			}

		},
		/**
		 * show edit forms
		 */
		onPressEdit: function () {
			this.getModel("viewModel").setProperty("/editMode", true);
		},
		/**
		 * reset changed data
		 * when create notification remove all values
		 */
		onPressCancel: function () {
			//show confirm message
			this.cancelFormHandling();
		},

		/**
		 * validate and submit form data changes
		 */
		onPressSave: function () {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("ObjectEvoNotify", "validateFields", {});
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route "object"
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId,
				oViewModel = this.getModel("viewModel"),
				oDataModel = this.getModel();

			oDataModel.metadataLoaded().then(function () {
				this.getView().setBusy(true);
				oViewModel.setProperty("/isNew", false);
				oViewModel.setProperty("/isEdit", true);
				oViewModel.setProperty("/editMode", false);

				var sObjectPath = this.getModel().createKey("PMNotificationSet", {
					MaintenanceNotification: sObjectId
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
					expand: "NavToItems,NavToTasks,NavToActivity"
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
				oElementBinding = oView.getElementBinding();
			this._oContext = oElementBinding.getBoundContext();

			// No data for the binding
			if (!this._oContext) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}
			this.getView().setBusy(false);
			// Everything went fine.
			oViewModel.setProperty("/busy", false);
		}
	});
});