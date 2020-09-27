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

	return BaseController.extend("com.evorait.evonotify.block.causes.CausesBlockController", {

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
			this._oItemCauseContext = this.oListItem.getBindingContext();
		},

		/**
		 * show dialog with cause details
		 * in edit mode
		 * @param oEvent
		 */
		onPressEdit: function (oEvent) {
			if (this._oItemCauseContext) {
				var mParams = {
					viewName: "com.evorait.evonotify.view.templates.SmartFormWrapper#addEditItemCauseForm",
					annotationPath: "com.sap.vocabularies.UI.v1.Facets#addEditItemCauseForm",
					entitySet: "PMNotificationItemCauseSet",
					controllerName: "AddEditEntry",
					title: "tit.editCause",
					type: "edit",
					sPath: this._oItemCauseContext.getPath()
				};
				this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
				this._oItemCauseContext = null;
				this.oListItem.getParent().removeSelections(true);
			} else {
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("msg.itemSelectAtLeast");
				this.showMessageToast(msg);
			}
		},

		/**
		 * add a new cause
		 * create a new entry based on if its Notification Item level
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
				viewName: "com.evorait.evonotify.view.templates.SmartFormWrapper#AddCause",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#addEditItemCauseForm",
				entitySet: "PMNotificationItemCauseSet",
				controllerName: "AddEditEntry",
				title: "tit.addCause",
				type: "add",
				sSortField: "SORT_NUMBER",
				sNavTo: "/NotificationItemToCause/",
				mKeys: {
					NotificationNo: oContextData.NotificationNo,
					NotificationItem: oContextData.NotificationItem
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifCauseCodeCatalog = mResults.CatalogTypeForCauses;
			}
			this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
		}
	});

});