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
					sPath: this._oActivityContext.getPath()
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
				sSortField: "SORT_NUMBER",
				sNavTo: "/NotificationToActivity/",
				mKeys: {
					NOTIFICATION_NO: oContextData.NOTIFICATION_NO
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifAcivityCodeCatalog = mResults.CatalogTypeForActivities;
			}
			this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
		}
	});

});