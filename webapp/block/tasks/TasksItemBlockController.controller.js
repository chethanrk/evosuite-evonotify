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
				onBeforeRebindTable: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onPressItem: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
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
				onPressDelete: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onSelectStatus: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Before
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
			this.getModel("viewModel").setProperty("/singleSelectedTask", false);
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
			this.getModel("viewModel").setProperty("/singleSelectedTask", false);
			//only one item can be edited so enable edit button when only one entry was selected
			var aSelected = this._oSmartTable.getTable().getSelectedItems();
			this.getModel("viewModel").setProperty("/singleSelectedTask", aSelected.length === 1);

			if (aSelected.length === 1) {
				var oContextData = aSelected[0].getBindingContext().getObject();
				this._setTaskStatusButtonVisibility(oContextData); //enable/disable status change button
				this._setEditButtonVisibility(oContextData); //enable/disable edit button
			}
		},

		/**
		 * show dialog with task details
		 * in edit mode
		 * @param oEvent
		 */
		onPressEdit: function (oEvent) {
			var mParams = {
				viewName: "com.evorait.evosuite.evonotify.view.templates.SmartFormWrapper#ItemTaskUpdate",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#ItemTaskUpdate",
				entitySet: "PMNotificationItemTaskSet",
				controllerName: "AddEditEntry",
				title: "tit.editTask",
				type: "edit",
				smartTable: this._oSmartTable
			};
			this.getSingleSelectAndOpenEditDialog(this._oSmartTable, mParams, function () {
				this.getModel("viewModel").setProperty("/singleSelectedTask", false);
			}.bind(this));
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
			this.onPressTaskStatusShowList(oEvent, this._oSmartTable);
		},

		/**
		 * Save the selected status
		 * @param oEvent
		 */
		onSelectStatus: function (oEvent) {
			this.changeTaskStatus(oEvent.getParameter("item"), this._oSmartTable);
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
			this.oStatusSelectControl = this.getView().byId("idTaskItemStatusChangeMenu");
			this.oStatusSelectControl.setEnabled(false);
			var mItemTaskAllows = {};
			for (var key in oData) {
				if (key.startsWith("ALLOW_")) {
					mItemTaskAllows[key] = oData[key];
				}
			}
			this.getView().getModel("viewModel").setProperty("/TaskAllows", mItemTaskAllows);

			this.oStatusSelectControl.setEnabled(this.getModel("viewModel").getProperty("/validatedIw22Auth"));

		},

		/**
		 * disable/enable edit button for a selected task
		 * when ENABLE_TASK_CHANGE in task is false then edit is not allowed
		 * @param oData
		 */
		_setEditButtonVisibility: function (oData) {
			var oItemTaskEditCtrl = this.getView().byId("idItemTaskEdit");
			if (oData.ENABLE_TASK_CHANGE === "X") {

				oItemTaskEditCtrl.setEnabled(Boolean(this.getModel("viewModel").getProperty("/validatedIw22Auth")));

			} else {
				oItemTaskEditCtrl.setEnabled(false);
			}
		}
	});

});