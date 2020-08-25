/*global location*/
sap.ui.define([
	"com/evorait/evonotify/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/evorait/evonotify/model/formatter"
], function (
	BaseController,
	History,
	JSONModel,
	formatter
) {
	"use strict";

	return BaseController.extend("com.evorait.evonotify.block.activities.ActivitiesItemBlockController", {

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
					viewName: "com.evorait.evonotify.view.templates.SmartFormWrapper#addEditItemActivityForm",
					annotationPath: "com.sap.vocabularies.UI.v1.Facets#addEditItemActivityForm",
					entitySet: "PMNotificationItemActivitySet",
					controllerName: "AddEditEntry",
					title: "tit.editActivity",
					type: "edit",
					sPath: this._oItemActivityContext.getPath()
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

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * open add dialog 
		 * and set add cause dependencies like catalog from NotificationType
		 */
		_openAddDialog: function (oContextData, mResults) {
			var mParams = {
				viewName: "com.evorait.evonotify.view.templates.SmartFormWrapper#AddItemActivity",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#addEditItemActivityForm",
				entitySet: "PMNotificationItemActivitySet",
				controllerName: "AddEditEntry",
				title: "tit.addActivity",
				type: "add",
				sSortField: "NotifActivitySortNumber",
				sNavTo: "/NotificationItemToActivity/",
				mKeys: {
					ObjectKey: oContextData.ObjectKey
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifAcivityCodeCatalog = mResults.CatalogTypeForActivities;
			}
			this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
		}
	});

});