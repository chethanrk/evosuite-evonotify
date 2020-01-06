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

	return BaseController.extend("com.evorait.evonotify.controller.ObjectActivity", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this.getRouter().getRoute("activity").attachPatternMatched(this._onObjectMatched, this);
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
			if (this.oForm) {
				this.cancelFormHandling(this.oForm);
			}
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
				//if(parseInt(obj.MaintenanceNotificationItem) === 0){
				this.getRouter().navTo("object", {
					objectId: obj.MaintenanceNotification
				}, true);
				/*}else{
					this.getRouter().navTo("item", {
						objectId: obj.MaintenanceNotification,
						itemId: obj.MaintenanceNotificationItem
					}, true);
				}*/
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
			if (this.oForm) {
				this.saveSubmitHandling(this.oForm);
			}
		},

		onPressCancel: function () {
			if (this.oForm) {
				this.cancelFormHandling(this.oForm);
			}
		},

		/**
		 * fired edit toggle event from subsection block DetailsFormBlock
		 */
		onFiredEditMode: function (oEvent) {
			var oParameters = oEvent.getParameters();
			this._setEditMode(oParameters.editable);

			if (!this.oForm) {
				this.oForm = sap.ui.getCore().byId(oParameters.id);
			}
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
			var oParameters = oEvent.getParameter("arguments"),
				sObjectId = oParameters.objectId,
				sItemId = oParameters.itemId,
				sActivityId = oParameters.activityId,
				oViewModel = this.getModel("viewModel"),
				oDataModel = this.getModel(),
				isNew = (sActivityId === "new");

			oDataModel.metadataLoaded().then(function () {
				oViewModel.setProperty("/isNew", isNew);
				oViewModel.setProperty("/isEdit", !isNew);
				oViewModel.setProperty("/MaintenanceNotification", sObjectId);
				this._setEditMode(isNew);

				if (isNew) {
					var oContext = oDataModel.createEntry("/PMNotificationActivities");
					oDataModel.setProperty(oContext.sPath + "/MaintenanceNotification", sObjectId);
					oDataModel.setProperty(oContext.sPath + "/MaintenanceNotificationItem", sItemId);
					oDataModel.setProperty(oContext.sPath + "/MaintNotifAcivityCodeCatalog", 'A');
					this.getView().unbindElement();
					this.getView().setBindingContext(oContext);

					var oBundle = this.getModel("i18n").getResourceBundle();
					oViewModel.setProperty("/Title", oBundle.getText("newNotificationActivityTitle"));
					oViewModel.setProperty("/busy", false);

				} else {
					var sObjectPath = this.getModel().createKey("PMNotificationActivities", {
						MaintenanceNotification: sObjectId,
						MaintenanceNotificationItem: sItemId,
						MaintNotificationActivity: sActivityId
					});
					this._bindView("/" + sObjectPath);
				}
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
				oContext = oElementBinding.getBoundContext(),
				data = this.getModel().getProperty(oContext.sPath);

			if (data.MaintNotifAcivityCodeCatalog === "") {
				data.MaintNotifAcivityCodeCatalog = 'A';
			}

			if (this.oForm) {
				this.oForm.setEditable(false);
			}

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}
			// Everything went fine.
			this._setNewHeaderTitle();
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
		},

		_setNewHeaderTitle: function () {
			var oContext = this.getView().getBindingContext();
			this.getModel("viewModel").setProperty("/Title", this.getModel().getProperty(oContext.sPath + "/MaintNotifActyTxt"));
		}

	});

});