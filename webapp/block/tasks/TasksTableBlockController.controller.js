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

	return BaseController.extend("com.evorait.evonotify.block.tasks.TasksTableBlockController", {

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
		 * show dialog with task details
		 * in edit mode
		 * @param oEvent
		 */
		onPressItem: function (oEvent) {
			var mParams = {
				oContext: oEvent.getSource().getBindingContext()
			};
			this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditTask");
		},

		/**
		 * add a new task
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
		 * and set add task dependencies like catalog from NotificationType
		 */
		_openAddDialog: function (oContextData, mResults) {
			var mParams = {
				sSetPath: "/PMNotificationTaskSet",
				sSortField: "MaintNotifTaskSortNumber",
				sNavTo:"/NavToTasks/",
				mKeys: {
					MaintenanceNotification: oContextData.MaintenanceNotification,
					MaintenanceNotificationItem: oContextData.MaintenanceNotificationItem
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifTaskCodeCatalog = mResults.CatalogTypeForTasks;
				mParams.mKeys.ResponsiblePersonFunctionCode = mResults.PartnerFunOfPersonRespForTask;
			}
			this.getOwnerComponent().oAddEntryDialog.open(this.getView(), mParams, "AddEditTask");
		},
		/**
		 * Save the selected status
		 * @param oEvent
		 */
		onSelectStatus: function (oEvent) {
			var oParams = oEvent.getParameters(),
				statusKey = oParams.item.getKey(),
				oContext = oEvent.getSource().getBindingContext(),
				obj = oContext.getObject();

			if (obj.IsOutstanding === true || obj.IsReleased === true || obj.IsCompleted === true) {
				this.getView().setBusy(true);
				this.getModel().setProperty(oContext.getPath() + "/Status", statusKey);
				this.saveChangedEntry({
					context: this,
					view: this.getView(),
					success: function () {
						this.context.oView.setBusy(false);
						//this.view.getModel().refresh(true);
					},
					error: function () {
						this.context.oView.setBusy(false);
					}
				});
			}
		}

	});

});