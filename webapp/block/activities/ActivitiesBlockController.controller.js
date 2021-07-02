/*global location*/
sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/evorait/evosuite/evonotify/model/formatter"
], function (
	BaseController,
	History,
	JSONModel,
	formatter
) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evonotify.block.activities.ActivitiesBlockController", {

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
			this._oSmartTable = this.getView().byId("notificationActivityTable");
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/**
		 *  save selected context
		 * @param oEvent
		 */
		onPressItem: function (oEvent) {
			this.oListItem = oEvent.getParameter("listItem");
			this._oActivityContext = this.oListItem.getBindingContext();
		},

		/**
		 * show dialog with activity details
		 * in edit mode
		 * @param oEvent
		 */
		onPressEdit: function (oEvent) {
			if (this._oActivityContext) {
				var mParams = {
					viewName: "com.evorait.evosuite.evonotify.view.templates.SmartFormWrapper#ActivityCreateUpdate",
					annotationPath: "com.sap.vocabularies.UI.v1.Facets#ActivityCreateUpdate",
					entitySet: "PMNotificationActivitySet",
					controllerName: "AddEditEntry",
					title: "tit.editActivity",
					type: "edit",
					sPath: this._oActivityContext.getPath(),
					smartTable: this._oSmartTable
				};
				this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
				this._oActivityContext = null;
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

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * open add dialog 
		 * and set add activity dependencies like catalog from NotificationType
		 */
		_openAddDialog: function (oContextData, mResults) {
			var mParams = {
				viewName: "com.evorait.evosuite.evonotify.view.templates.SmartFormWrapper#ActivityCreateUpdate",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#ActivityCreateUpdate",
				entitySet: "PMNotificationActivitySet",
				controllerName: "AddEditEntry",
				title: "tit.addActivity",
				type: "add",
				smartTable: this._oSmartTable,
				sSortField: "SORT_NUMBER",
				sNavTo: "/NotificationToActivity/",
				mKeys: {
					NOTIFICATION_NO: oContextData.NOTIFICATION_NO
				}
			};

			if (mResults) {
				mParams.mKeys.CODE_CATALOG = mResults.Mfkat;
			}
			this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
		},

		/**
		 * Called on click of Long text indicator
		 * @param oEvent
		 */
		showLongText: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			var longText = oContext.getProperty("NOTES");
			this.displayLongText(longText);
		}
	});

});