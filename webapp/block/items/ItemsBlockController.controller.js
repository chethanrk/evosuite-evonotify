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

	return BaseController.extend("com.evorait.evosuite.evonotify.block.items.ItemsBlockController", {

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
			this._oSmartTable = this.getView().byId("notificationItemsTable");
		},

		onAfterRendering: function () {

		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onPressItem: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			if (oContext) {
				var obj = oContext.getObject();
				var parentObj = this.oView.getBindingContext().getObject();
				this.getModel("viewModel").setProperty("/enableNotificationChange", parentObj.ENABLE_NOTIFICATION_CHANGE);
				this.getRouter().navTo("NotificationItemDetail", {
					ObjectKey: obj.ObjectKey,
					mParams: this.mParams
				});
			}
		},

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
				viewName: "com.evorait.evosuite.evonotify.view.templates.SmartFormWrapper#NotifItmCreateUpdate",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#NotifItmCreateUpdate",
				entitySet: "PMNotificationItemSet",
				controllerName: "AddEditEntry",
				title: "tit.addItem",
				type: "add",
				smartTable: this._oSmartTable,
				sSortField: "SORT_NUMBER",
				sNavTo: "/NotificationToItem/",
				mKeys: {
					NOTIFICATION_NO: oContextData.NOTIFICATION_NO
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifObjprtcodeCatalog = mResults.CatalogTypeForObjParts;
				mParams.mKeys.MaintNotifDamageCodecatalog = mResults.CatalogTypeForDamage;
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