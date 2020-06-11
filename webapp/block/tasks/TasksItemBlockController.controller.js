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

	return BaseController.extend("com.evorait.evonotify.block.tasks.TasksItemBlockController", {

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
			this._oItemTaskContext = this.oListItem.getBindingContext();
		},

		/**
		 * show dialog with task details
		 * in edit mode
		 * @param oEvent
		 */
		onPressEdit: function (oEvent) {
			if (this._oItemTaskContext) {
				var mParams = {
					viewName: "com.evorait.evonotify.view.templates.SmartFormWrapper#addEditItemTaskForm",
					annotationPath: "com.sap.vocabularies.UI.v1.Facets#addEditItemTaskForm",
					entitySet: "PMNotificationItemTaskSet",
					controllerName: "AddEditEntry",
					title: "tit.editTask",
					type: "edit",
					sPath: this._oItemTaskContext.getPath()
				};
				this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
				this._oItemTaskContext = null;
				this.oListItem.getParent().removeSelections(true);
			} else {
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("msg.itemSelectAtLeast");
				this.showMessageToast(msg);
			}
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
				viewName: "com.evorait.evonotify.view.templates.SmartFormWrapper#AddItemTask",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#addEditItemTaskForm",
				entitySet: "PMNotificationItemTaskSet",
				controllerName: "AddEditEntry",
				title: "tit.addTask",
				type: "add",
				sSortField: "MaintNotifTaskSortNumber",
				sNavTo: "/NavToItemTask/",
				mKeys: {
					MaintenanceNotification: oContextData.MaintenanceNotification,
					MaintenanceNotificationItem: oContextData.MaintenanceNotificationItem
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifTaskCodeCatalog = mResults.CatalogTypeForTasks;
				mParams.mKeys.ResponsiblePersonFunctionCode = mResults.PartnerFunOfPersonRespForTask;
			}
			this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
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