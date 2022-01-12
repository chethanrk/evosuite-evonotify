/*global location*/
sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/TableController",
	"com/evorait/evosuite/evonotify/model/formatter",
	"sap/ui/core/mvc/OverrideExecution"
], function (TableController, formatter, OverrideExecution) {
	"use strict";

	return TableController.extend("com.evorait.evosuite.evonotify.block.activities.ActivitiesItemBlockController", {

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
			this._oItemActivityContext = this.oListItem.getBindingContext();
		},

		/**
		 * show dialog with activity details
		 * in edit mode
		 * @param oEvent
		 */
		onPressEdit: function (oEvent) {
			if (this._oItemActivityContext) {
				var mParams = {
					viewName: "com.evorait.evosuite.evonotify.view.templates.SmartFormWrapper#NotifItemActivityUpdate",
					annotationPath: "com.sap.vocabularies.UI.v1.Facets#ItemActivityCreateUpdate",
					entitySet: "PMNotificationItemActivitySet",
					controllerName: "AddEditEntry",
					title: "tit.editActivity",
					type: "edit",
					sPath: this._oItemActivityContext.getPath(),
					smartTable: this._oSmartTable
				};
				this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
				this._oItemActivityContext = null;
				this.oListItem.getParent().removeSelections(true);
			} else {
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("msg.itemSelectAtLeast");
				this.showMessageToast(msg);
			}
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