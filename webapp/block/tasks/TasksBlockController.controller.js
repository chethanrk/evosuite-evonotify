/*global location*/
sap.ui.define([
	"com/evorait/evonotify/controller/FormController",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/evorait/evonotify/model/formatter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter"
], function (
	FormController,
	History,
	JSONModel,
	formatter,
	FilterOperator,
	Filter
) {
	"use strict";

	return FormController.extend("com.evorait.evonotify.block.tasks.TasksBlockController", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 *  save selected context
		 * @param oEvent
		 */
		onPressItem: function (oEvent) {
			this._setBusyWhileSaving(this.getView(), true);
			this.oListItem = oEvent.getParameter("listItem");
			this.oStatusSelectControl = this.getView().byId("idTaskStatusChangeMenu");
			this.oStatusSelectControl.setEnabled(false);
			this._oTaskContext = this.oListItem.getBindingContext();
			this._oNotificationContext = this.oView.getBindingContext().getObject();
			this._getNotificationTaskDetails(this._oTaskContext.getObject().ObjectKey);
		},

		/**
		 * show dialog with task details
		 * in edit mode
		 * @param oEvent
		 */
		onPressEdit: function (oEvent) {
			if (this._oTaskContext) {
				var mParams = {
					viewName: "com.evorait.evonotify.view.templates.SmartFormWrapper#EditTask",
					annotationPath: "com.sap.vocabularies.UI.v1.Facets#editForm",
					entitySet: "PMNotificationTaskSet",
					controllerName: "AddEditEntry",
					title: "tit.editTask",
					type: "edit",
					sPath: this._oTaskContext.getPath()
				};
				this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
				this._oTaskContext = null;
				this.oListItem.getParent().removeSelections(true);
			} else {
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("msg.itemSelectAtLeast");
				this.showMessageToast(msg);
			}
		},

		/**
		 * add a new task
		 * create a new entry based on if its on Notifcation header level or Notification Item level
		 * @param oEvent
		 */
		onPressAdd: function (oEvent) {
			this.getDependenciesAndCallback(this._openAddDialog.bind(this));
		},

		/**
		 * Save the selected status
		 * @param oEvent
		 */
		onSelectStatus: function (oEvent) {
			if (this._oTaskContext && this._oTaskContextData) {
				var sSelFunctionKey = oEvent.getParameter("item").getKey(),
					oData = this._oTaskContextData,
					sPath = this._oTaskContext.getPath(),
					message = "";

				if (oData["ALLOW_" + sSelFunctionKey]) {
					this.getModel().setProperty(sPath + "/FUNCTION", sSelFunctionKey);
					this.saveChanges({
						state: "success"
					}, this.saveSuccessFn.bind(this), null, this.getView());
				} else {
					message = this.getResourceBundle().getText("msg.notificationSubmitFail", this._oNotificationContext.NotificationNo);
					this.showInformationDialog(message);
				}
			} else {
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("msg.itemSelectAtLeast");
				this.showMessageToast(msg);
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * open add dialog 
		 * and set add task dependencies like catalog from NotificationType
		 */
		_openAddDialog: function (oContextData, mResults) {
			var mParams = {
				viewName: "com.evorait.evonotify.view.templates.SmartFormWrapper#AddTask",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#addForm",
				entitySet: "PMNotificationTaskSet",
				controllerName: "AddEditEntry",
				title: "tit.addTask",
				type: "add",
				sSortField: "SORT_NUMBER",
				sNavTo: "/NotificationToTask/",
				mKeys: {
					NotificationNo: oContextData.NotificationNo
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifTaskCodeCatalog = mResults.CatalogTypeForTasks;
				mParams.mKeys.ResponsiblePersonFunctionCode = mResults.PartnerFunOfPersonRespForTask;
			}
			this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
		},

		/**
		 * @param sStatus
		 */
		_setStatusSelectItemsVisibility: function (sStatus) {
			if (!this._oTaskContextData) {
				return false;
			} else {
				var oContextData = this._oTaskContextData,
					oMenu = this.oStatusSelectControl.getMenu();
				this.oStatusSelectControl.setEnabled(true);
				oMenu.getItems().forEach(function (oItem) {
					oItem.setVisible(oContextData["ALLOW_" + oItem.getKey()]);
				}.bind(this));
				this._setBusyWhileSaving(this.getView(), false);
			}
		},

		/**
		 * success callback after saving notification
		 * @param oResponse
		 */
		saveSuccessFn: function (oResponse) {
			var msg = this.getResourceBundle().getText("msg.saveSuccess");
			sap.m.MessageToast.show(msg);
		},

		_getNotificationTaskDetails: function (filterParameter) {
			var oFilter1 = new Filter("ObjectKey", FilterOperator.EQ, filterParameter);
			this.getOwnerComponent().readData("/PMNotificationTaskSet", [
				[oFilter1]
			]).then(function (oData) {
				this._oTaskContextData = oData.results[0];
				this._setStatusSelectItemsVisibility();
			}.bind(this));
		}

	});

});