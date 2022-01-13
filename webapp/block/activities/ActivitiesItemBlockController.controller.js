/*global location*/
sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"com/evorait/evosuite/evonotify/controller/TableController",
<<<<<<< HEAD
	"com/evorait/evosuite/evonotify/model/formatter",
	"sap/ui/core/mvc/OverrideExecution"
], function (TableController, formatter, OverrideExecution) {
=======
	"com/evorait/evosuite/evonotify/model/formatter"
], function (FormController, TableController, formatter) {
>>>>>>> refs/remotes/origin/develop
	"use strict";

	return FormController.extend("com.evorait.evosuite.evonotify.block.activities.ActivitiesItemBlockController", {

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
				showLongText: {
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
			this._oSmartTable = this.getView().byId("notificationActivityItemTable");
			this.getModel("viewModel").setProperty("/singleSelectedActivity", false);
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
			//only one item can be edited so enable edit button when only one entry was selected
			var aSelected = this._oSmartTable.getTable().getSelectedItems();
			this.getModel("viewModel").setProperty("/singleSelectedActivity", aSelected.length === 1);
		},

		/**
		 * show dialog with activity details
		 * in edit mode
		 * @param oEvent
		 */
		onPressEdit: function (oEvent) {
			var mParams = {
				viewName: "com.evorait.evosuite.evonotify.view.templates.SmartFormWrapper#NotifItemActivityUpdate",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#ItemActivityCreateUpdate",
				entitySet: "PMNotificationItemActivitySet",
				controllerName: "AddEditEntry",
				title: "tit.editActivity",
				type: "edit",
				smartTable: this._oSmartTable
			};
			this.getSingleSelectAndOpenEditDialog(this._oSmartTable, mParams, function () {
				this.getModel("viewModel").setProperty("/singleSelectedActivity", false);
			}.bind(this));
		},

		/**
		 * add a new activity
		 * create a new entry based on if its on Notifcation header level or Notification Item level
		 * @param oEvent
		 */
		onPressAdd: function (oEvent) {
			this.getDependenciesAndCallback(this._openAddDialog.bind(this));
		},

		/**
<<<<<<< HEAD
		 * Called on click of Long text indicator
		 * @param oEvent
		 */
		showLongText: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			var longText = oContext.getProperty("NOTES");
			this.displayLongText(longText);
=======
		 * delete multiple selected items
		 * @param oEvent
		 */
		onPressDelete: function (oEvent) {
			var aSelected = this._oSmartTable.getTable().getSelectedItems(),
				sMsg = this.getResourceBundle().getText("msg.confirmActivityDelete");
			if (aSelected.length > 0) {
				var successFn = function () {
					this.deleteEntries(aSelected, this._oSmartTable);
				};
				this.confirmDialog(sMsg, successFn.bind(this), null, this._oSmartTable);
			}
>>>>>>> refs/remotes/origin/develop
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * open add dialog 
		 * and set add cause dependencies like catalog from NotificationType
		 */
		_openAddDialog: function (oContextData, mResults) {
			var mParams = {
				viewName: "com.evorait.evosuite.evonotify.view.templates.SmartFormWrapper#NotifItemActivityCreate",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#ItemActivityCreateUpdate",
				entitySet: "PMNotificationItemActivitySet",
				controllerName: "AddEditEntry",
				title: "tit.addActivity",
				type: "add",
				smartTable: this._oSmartTable,
				sSortField: "SORT_NUMBER",
				sNavTo: "/NotificationItemToActivity/",
				mKeys: {
					NOTIFICATION_NO: oContextData.NOTIFICATION_NO,
					NOTIFICATION_ITEM: oContextData.NOTIFICATION_ITEM
				}
			};

			if (mResults) {
				mParams.mKeys.CODE_CATALOG = mResults.Mfkat;
			}
			this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
		}
	});

});