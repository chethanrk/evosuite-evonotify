/*global location*/
sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"com/evorait/evosuite/evonotify/controller/TableController",
	"com/evorait/evosuite/evonotify/model/formatter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/ui/core/Fragment"
], function (FormController, TableController, formatter, FilterOperator, Filter, Fragment) {
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
		 * SmartTable before loading request
		 * set default SortOrder from annotations
		 */
		onBeforeRebindTable: function (oEvent) {
			TableController.prototype.onBeforeRebindTable.apply(this, arguments);
		},

		/**
		 *  save selected context
		 * @param oEvent
		 */
		onPressItem: function (oEvent) {
			this.oListItem = oEvent.getParameter("listItem");
			this._oTaskContext = this.oListItem.getBindingContext();
			this._oNotificationContext = this.oView.getBindingContext().getObject();

			this.oStatusSelectControl = this.getView().byId("idTaskStatusChangeMenu");
			this.oStatusSelectControl.setEnabled(false);

			var oContextData = this._oTaskContext.getObject();
			this._setTaskStatusButtonVisibility(oContextData); //enable/disable status change button
			this._setEditButtonVisibility(oContextData); //enable/disable edit button
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
			var oItem = oEvent.getParameter("item"),
				oData = this._oTaskContext.getObject(),
				sPath = this._oTaskContext.getPath(),
				sFunctionKey = oItem.getKey(),
				message = "";

			if (oData["ALLOW_" + sFunctionKey]) {
				this.getModel("viewModel").setProperty("/isStatusUpdate", true);
				this.getModel().setProperty(sPath + "/FUNCTION", sFunctionKey);
				this.saveChanges({
					state: "success"
				}, this._saveSuccessFn.bind(this), this._saveErrorFn.bind(this), this.getView());
				this.oListItem.getParent().removeSelections(true);
				this.oStatusSelectControl.setEnabled(false);
			} else {
				message = this.getResourceBundle().getText("msg.notificationSubmitFail", this._oNotificationContext.NOTIFICATION_NO);
				this.showInformationDialog(message);
			}
		},

		/**
		 * delete multiple selected items
		 * @param oEvent
		 */
		onPressDelete: function (oEvent) {
			var aSelected = this._oSmartTable.getTable().getSelectedItems(),
				sMsg = this.getResourceBundle().getText("msg.confirmTaskDelete");
			if (aSelected.length > 0) {
				var successFn = function () {
					this.deleteEntries(aSelected, this._oSmartTable);
				};
				this.confirmDialog(sMsg, successFn.bind(this), null, this._oSmartTable);
			}
		},

		/**
		 * show ActionSheet of Task system status buttons
		 * @param oEvent
		 */
		onPressChangeTaskSystemStatus: function (oEvent) {
			if (this._oTaskContext) {
				var oButton = oEvent.getSource();
				// create action sheet only once
				if (!this._actionSheetTaskSystemStatus) {
					Fragment.load({
						name: "com.evorait.evosuite.evonotify.view.fragments.ActionSheetTaskSystemStatus",
						controller: this,
						type: "XML"
					}).then(function (oFragment) {
						this._actionSheetTaskSystemStatus = oFragment;
						this.getView().addDependent(oFragment);
						this._actionSheetTaskSystemStatus.addStyleClass(this.getModel("viewModel").getProperty("/densityClass"));
						this._actionSheetTaskSystemStatus.openBy(oButton);
					}.bind(this));
				} else {
					this._actionSheetTaskSystemStatus.openBy(oButton);
				}
			} else {
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("msg.itemSelectAtLeast");
				this.showMessageToast(msg);
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
				mParams.mKeys.CODE_CATALOG = mResults.Makat;
				// mParams.mKeys.ResponsiblePersonFunctionCode = mResults.PartnerFunOfPersonRespForTask;
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
			this.oStatusSelectControl.setEnabled(true);
		},

		/**
		 * success callback after saving notification
		 * @param oResponse
		 */
		_saveSuccessFn: function (oResponse) {
			var msg = this.getResourceBundle().getText("msg.saveSuccess");
			this.showMessageToast(msg);
		},

		/**
		 * error callback after saving notification
		 * @param oResponse
		 */
		_saveErrorFn: function (oResponse) {
			this.getModel().resetChanges([this._oTaskContext.getPath()]);
		},

		/**
		 * disable/enable edit button for a selected task
		 * when ENABLE_TASK_CHANGE in task is false then edit is not allowed
		 * @param oData
		 */
		_setEditButtonVisibility: function (oData) {
			var oTaskEditCtrl = this.getView().byId("idTaskEdit");
			if (oData.ENABLE_TASK_CHANGE === "X") {
				oTaskEditCtrl.setEnabled(true);
			} else {
				oTaskEditCtrl.setEnabled(false);
			}
		}

	});

});