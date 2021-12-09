/*global location*/
sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"com/evorait/evosuite/evonotify/controller/TableController",
	"com/evorait/evosuite/evonotify/model/formatter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/OverrideExecution"
], function (FormController, TableController, formatter, FilterOperator, Filter, Fragment, OverrideExecution) {
	"use strict";

	return FormController.extend("com.evorait.evosuite.evonotify.block.tasks.TasksItemBlockController", {
		
		metadata: {
			methods: {
				formatter: {
					public: true,
					final: true
				},
				onBeforeRebindTable: {
					public: true,
					final: true
				},
				onPressItem: {
					public: true,
					final: true
				},
				onPressEdit: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onPressAdd: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onSelectStatus: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Before
				},
				saveSuccessFn: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				saveErrorFn: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				showLongText: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressChangeTaskSystemStatus: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}	
		},

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

		/**
		 * Object on exit
		 */
		onExit: function () {
			this.getView().unbindElement();
			if (this._actionSheetItemTaskSystemStatus) {
				this._actionSheetItemTaskSystemStatus.destroy(true);
				this._actionSheetItemTaskSystemStatus = null;
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

		/**
		 * Save the selected status
		 * @param oEvent
		 */
		onSelectStatus: function (oEvent) {
			var oSource = oEvent.getSource(),
				oItem = oEvent.getParameter("item"),
				oData = this._oItemTaskContext.getObject(),
				sPath = this._oItemTaskContext.getPath(),
				sFunctionKey = oItem ? oItem.data("key") : oSource.data("key"),
				message = "";
			if (oData["ALLOW_" + sFunctionKey]) {
				this.getModel("viewModel").setProperty("/isStatusUpdate", true);
				this.getModel().setProperty(sPath + "/FUNCTION", sFunctionKey);
				this.saveChanges({
					state: "success"
				}, this.saveSuccessFn.bind(this), this.saveErrorFn.bind(this), this.getView());
				this.oListItem.getParent().removeSelections(true);
				this.oStatusSelectControl.setEnabled(false);
			} else {
				message = this.getResourceBundle().getText("msg.notificationSubmitFail", oData.NOTIFICATION_NO);
				this.showInformationDialog(message);
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
			if (this._oItemTaskContextData && this._oItemTaskContextData) {
				var oButton = oEvent.getSource();
				// create action sheet only once
				if (!this._actionSheetItemTaskSystemStatus) {
					Fragment.load({
						name: "com.evorait.evosuite.evonotify.view.fragments.ActionSheetItemTaskSystemStatus",
						controller: this,
						type: "XML"
					}).then(function (oFragment) {
						this._actionSheetItemTaskSystemStatus = oFragment;
						this.getView().addDependent(oFragment);
						this._actionSheetItemTaskSystemStatus.addStyleClass(this.getModel("viewModel").getProperty("/densityClass"));
						this._actionSheetItemTaskSystemStatus.openBy(oButton);
					}.bind(this));
				} else {
					this._actionSheetItemTaskSystemStatus.openBy(oButton);
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
				mParams.mKeys.CODE_CATALOG = mResults.Makat;
				mParams.mKeys.ResponsiblePersonFunctionCode = mResults.PartnerFunOfPersonRespForTask;
			}
			this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
		},

		/**
		 * set visibility on status change dropdown items based on allowance from order status
		 */
		_setTaskStatusButtonVisibility: function (oData) {
			var mItemTaskAllows = {};
			for (var key in oData) {
				if (key.startsWith("ALLOW_")) {
					mItemTaskAllows[key] = oData[key];
				}
			}
			this.getView().getModel("viewModel").setProperty("/ItemTaskAllows", mItemTaskAllows);
			this._setBusyWhileSaving(this.getView(), false);
			this.oStatusSelectControl.setEnabled(true);
		},

		_getNotificationItemTaskDetails: function (filterParameter) {
			var oFilter1 = new Filter("ObjectKey", FilterOperator.EQ, filterParameter);
			this.getOwnerComponent().readData("/PMNotificationItemTaskSet", [
				[oFilter1]
			]).then(function (oData) {
				this._oItemTaskContextData = oData.results[0];
				this._setTaskStatusButtonVisibility(this._oItemTaskContextData);
			}.bind(this));
		},

		_validateItemTaskEdiButton: function (isItemTaskEditable) {
			var oItemTaskEditCtrl = this.getView().byId("idItemTaskEdit");
			if (isItemTaskEditable === "X") {
				oItemTaskEditCtrl.setEnabled(true);
			} else {
				oItemTaskEditCtrl.setEnabled(false);
			}
		},
	});

});