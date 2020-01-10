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

	return BaseController.extend("com.evorait.evonotify.block.items.ItemsTableBlockController", {

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

		onAfterRendering: function () {

		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onPressItem: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			if (oContext) {
				var obj = oContext.getObject();
				this.getRouter().navTo("item", {
					objectId: obj.MaintenanceNotification,
					itemId: obj.MaintenanceNotificationItem
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
				sSetPath: "/PMNotificationItemSet",
				sSortField: "MaintNotifItemSortNumber",
				sNavTo:"/NavToItems/",
				mKeys: {
					MaintenanceNotification: oContextData.MaintenanceNotification
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifObjPrtCodeCatalog = mResults.CatalogTypeForObjParts;
				mParams.mKeys.MaintNotifDamageCodeCatalog = mResults.CatalogTypeForDamage;
			}
			this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditItem");
		}

	});

});