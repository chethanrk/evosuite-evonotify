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

	return FormController.extend("com.evorait.evosuite.evonotify.block.tasks.TasksBlockController", {

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
			this._oSmartTable = this.getView().byId("notificationTasksTable");
		},

		/**
		 * Object on exit
		 */
		onExit: function () {
			this.getView().unbindElement();
			if (this._actionSheetTaskSystemStatus) {
				this._actionSheetTaskSystemStatus.destroy(true);
				this._actionSheetTaskSystemStatus = null;
			}
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
			this._validateTaskEdiButton(this._oTaskContext.getObject().ENABLE_TASK_CHANGE);
		},

		/**
		 * show dialog with task details
		 * in edit mode
		 * @param oEvent
		 */
		onPressEdit: function (oEvent) {
			if (this._oTaskContext) {
				var mParams = {
					viewName: "com.evorait.evosuite.evonotify.view.templates.SmartFormWrapper#TaskUpdate",
					annotationPath: "com.sap.vocabularies.UI.v1.Facets#TaskUpdate",
					entitySet: "PMNotificationTaskSet",
					controllerName: "AddEditEntry",
					title: "tit.editTask",
					type: "edit",
					sPath: this._oTaskContext.getPath(),
					smartTable: this._oSmartTable
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
			var oSource = oEvent.getSource(),
				oItem = oEvent.getParameter("item"),
				oData = this._oTaskContext.getObject(),
				sPath = this._oTaskContext.getPath(),
				sFunctionKey = oItem ? oItem.data("key") : oSource.data("key"),
				message = "";
			if (oData["ALLOW_" + sFunctionKey]) {
				this.getModel().setProperty(sPath + "/FUNCTION", sFunctionKey);
				this.saveChanges({
					state: "success"
				}, this.saveSuccessFn.bind(this), this.saveErrorFn.bind(this), this.getView());
				this.oListItem.getParent().removeSelections(true);
				this.oStatusSelectControl.setEnabled(false);
			} else {
				message = this.getResourceBundle().getText("msg.notificationSubmitFail", this._oNotificationContext.NOTIFICATION_NO);
				this.showInformationDialog(message);
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
				viewName: "com.evorait.evosuite.evonotify.view.templates.SmartFormWrapper#TaskCreate",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#TaskCreate",
				entitySet: "PMNotificationTaskSet",
				controllerName: "AddEditEntry",
				title: "tit.addTask",
				type: "add",
				smartTable: this._oSmartTable,
				sSortField: "SORT_NUMBER",
				sNavTo: "/NotificationToTask/",
				mKeys: {
					NOTIFICATION_NO: oContextData.NOTIFICATION_NO
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifTaskCodeCatalog = mResults.CatalogTypeForTasks;
				mParams.mKeys.ResponsiblePersonFunctionCode = mResults.PartnerFunOfPersonRespForTask;
			}
			this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
		},

		/**
		 * set visibility on status change dropdown items based on allowance from order status
		 */
		_setTaskStatusButtonVisibility: function (oData) {
			var mTaskAllows = {};
			for (var key in oData) {
				if (key.startsWith("ALLOW_")) {
					mTaskAllows[key] = oData[key];
				}
			}
			this.getModel("viewModel").setProperty("/TaskAllows", mTaskAllows);
			this._setBusyWhileSaving(this.getView(), false);
			this.oStatusSelectControl.setEnabled(true);
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
			this.getModel().resetChanges([this._oTaskContext.getPath()]);
		},

		_getNotificationTaskDetails: function (filterParameter) {
			var oFilter1 = new Filter("ObjectKey", FilterOperator.EQ, filterParameter);
			this.getOwnerComponent().readData("/PMNotificationTaskSet", [
				[oFilter1]
			]).then(function (oData) {
				this._oTaskContextData = oData.results[0];
				this._setTaskStatusButtonVisibility(this._oTaskContextData);
			}.bind(this));
		},

		_validateTaskEdiButton: function (isTaskEditable) {
			var oTaskEditCtrl = this.getView().byId("idTaskEdit");
			if (isTaskEditable === "X") {
				oTaskEditCtrl.setEnabled(true);
			} else {
				oTaskEditCtrl.setEnabled(false);
			}
		},

		/**
		 * Called on click of Long text indicator
		 * @param oEvent
		 */
		showLongText: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			var longText = oContext.getProperty("NOTES");
			this.displayLongText(longText);
		},

		/**
		 * show ActionSheet of Task system status buttons
		 * @param oEvent
		 */
		onPressChangeTaskSystemStatus: function (oEvent) {
			if (this._oTaskContext && this._oTaskContextData) {
				var oButton = oEvent.getSource();
				// create action sheet only once
				if (!this._actionSheetTaskSystemStatus) {
					this._actionSheetTaskSystemStatus = sap.ui.xmlfragment(
						"com.evorait.evosuite.evonotify.view.fragments.ActionSheetTaskSystemStatus",
						this
					);
					this.getView().addDependent(this._actionSheetTaskSystemStatus);
				}
				this._actionSheetTaskSystemStatus.openBy(oButton);
			} else {
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("msg.itemSelectAtLeast");
				this.showMessageToast(msg);
			}
		},
	});

});