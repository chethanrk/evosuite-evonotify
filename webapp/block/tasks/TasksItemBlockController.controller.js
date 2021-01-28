/*global location*/
sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/evorait/evosuite/evonotify/model/formatter",
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

	return FormController.extend("com.evorait.evosuite.evonotify.block.tasks.TasksItemBlockController", {

		formatter: formatter,
		_oSmartTable: null,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this._oSmartTable = this.getView().byId("notificationTasksItemTable");
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
			this.oStatusSelectControl = this.getView().byId("idTaskItemStatusChangeMenu");
			this.oStatusSelectControl.setEnabled(false);
			this._oItemTaskContext = this.oListItem.getBindingContext();
			this._oNotificationContext = this.oView.getBindingContext().getObject();
			this._getNotificationItemTaskDetails(this._oItemTaskContext.getObject().ObjectKey);
			this._validateItemTaskEdiButton(this._oItemTaskContext.getObject().ENABLE_TASK_CHANGE);
		},

		/**
		 * show dialog with task details
		 * in edit mode
		 * @param oEvent
		 */
		onPressEdit: function (oEvent) {
			if (this._oItemTaskContext) {
				var mParams = {
					viewName: "com.evorait.evosuite.evonotify.view.templates.SmartFormWrapper#ItemTaskUpdate",
					annotationPath: "com.sap.vocabularies.UI.v1.Facets#ItemTaskUpdate",
					entitySet: "PMNotificationItemTaskSet",
					controllerName: "AddEditEntry",
					title: "tit.editTask",
					type: "edit",
					sPath: this._oItemTaskContext.getPath(),
					smartTable: this._oSmartTable
				};
				this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
				this._oItemTaskContext = null;
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

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * open add dialog 
		 * and set add task dependencies like catalog from NotificationType
		 */
		_openAddDialog: function (oContextData, mResults) {
			var mParams = {
				viewName: "com.evorait.evosuite.evonotify.view.templates.SmartFormWrapper#ItemTaskCreate",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#ItemTaskCreate",
				entitySet: "PMNotificationItemTaskSet",
				controllerName: "AddEditEntry",
				title: "tit.addTask",
				type: "add",
				smartTable: this._oSmartTable,
				sSortField: "SORT_NUMBER",
				sNavTo: "/NotificationItemToTask/",
				mKeys: {
					NOTIFICATION_NO: oContextData.NOTIFICATION_NO,
					NOTIFICATION_ITEM: oContextData.NOTIFICATION_ITEM
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifTaskCodeCatalog = mResults.CatalogTypeForTasks;
				mParams.mKeys.ResponsiblePersonFunctionCode = mResults.PartnerFunOfPersonRespForTask;
			}
			this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
		},

		/**
		 * Save the selected status
		 * @param oEvent
		 */
		onSelectStatus: function (oEvent) {
			if (this._oItemTaskContext && this._oItemTaskContextData) {
				var sSelFunctionKey = oEvent.getParameter("item").getKey(),
					oData = this._oItemTaskContextData,
					sPath = this._oItemTaskContext.getPath(),
					message = "";

				if (oData["ALLOW_" + sSelFunctionKey]) {
					this.getModel().setProperty(sPath + "/FUNCTION", sSelFunctionKey);
					this.saveChanges({
						state: "success"
					}, this.saveSuccessFn.bind(this), this.saveErrorFn.bind(this), this.getView());
					this.oListItem.getParent().removeSelections(true);
					this.oStatusSelectControl.setEnabled(false);
				} else {
					message = this.getResourceBundle().getText("msg.notificationSubmitFail", oData.NOTIFICATION_NO);
					this.showInformationDialog(message);
				}
			} else {
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("msg.itemSelectAtLeast");
				this.showMessageToast(msg);
			}
		},

		/**
		 * @param sStatus
		 */
		_setStatusSelectItemsVisibility: function (sStatus) {
			if (!this._oItemTaskContextData) {
				return false;
			} else {
				var oContextData = this._oItemTaskContextData,
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
			this.showMessageToast(msg);
		},

		/**
		 * error callback after saving notification
		 * @param oResponse
		 */
		saveErrorFn: function (oResponse) {
			this.getModel().resetChanges([this._oItemTaskContext.getPath()]);
		},

		_getNotificationItemTaskDetails: function (filterParameter) {
			var oFilter1 = new Filter("ObjectKey", FilterOperator.EQ, filterParameter);
			this.getOwnerComponent().readData("/PMNotificationItemTaskSet", [
				[oFilter1]
			]).then(function (oData) {
				this._oItemTaskContextData = oData.results[0];
				this._setStatusSelectItemsVisibility();
			}.bind(this));
		},

		_validateItemTaskEdiButton: function (isItemTaskEditable) {
			var oItemTaskEditCtrl = this.getView().byId("idItemTaskEdit");
			if (isItemTaskEditable === "X") {
				oItemTaskEditCtrl.setEnabled(true);
			} else {
				oItemTaskEditCtrl.setEnabled(false);
			}
		}
	});

});