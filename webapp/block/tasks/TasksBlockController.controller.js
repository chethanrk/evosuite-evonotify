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

	return BaseController.extend("com.evorait.evonotify.block.tasks.TasksBlockController", {

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
			this._oTaskContext = this.oListItem.getBindingContext();

			var oSelectMenu = this.getView().byId("idMenuTask"),
				oMenuItems = oSelectMenu.getItems();

			oMenuItems.forEach(function (oItem) {
				var sKey = oItem.getKey();
				oItem.setVisible(this._setStatusSelectItemsVisibility(sKey));
			}.bind(this));
		},

		/**
		 * show dialog with task details
		 * in edit mode
		 * @param oEvent
		 */
		onPressEdit: function (oEvent) {
			if (this._oTaskContext) {
				var mParams = {
					viewName: "com.evorait.evonotify.view.templates.SmartFormWrapper#EditTask",
					annotationPath: "com.sap.vocabularies.UI.v1.Facets#editForm",
					entitySet: "PMNotificationTaskSet",
					controllerName: "AddEditEntry",
					title: "tit.editTask",
					type: "edit",
					sPath: this._oTaskContext.getPath()
				};
				this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
				this._oTaskContext = null;
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

		/**
		 * Save the selected status
		 * @param oEvent
		 */
		onSelectStatus: function (oEvent) {
			if (this._oTaskContext) {
				var oParams = oEvent.getParameters(),
					statusKey = oParams.item.getKey(),
					oContextData = this._oTaskContext.getObject();

				if (oContextData.IsOutstanding === true || oContextData.IsReleased === true || oContextData.IsCompleted === true) {
					this.getView().setBusy(true);
					this.getModel().setProperty(this._oTaskContext.getPath() + "/Status", statusKey);
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
			} else {
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("msg.itemSelectAtLeast");
				this.showMessageToast(msg);
			}
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
				viewName: "com.evorait.evonotify.view.templates.SmartFormWrapper#AddTask",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#addForm",
				entitySet: "PMNotificationTaskSet",
				controllerName: "AddEditEntry",
				title: "tit.addTask",
				type: "add",
				sSortField: "SORT_NUMBER",
				sNavTo: "/NotificationToTask/",
				mKeys: {
					NotificationNo: oContextData.NotificationNo
				}
			};

			if (mResults) {
				mParams.mKeys.MaintNotifTaskCodeCatalog = mResults.CatalogTypeForTasks;
				mParams.mKeys.ResponsiblePersonFunctionCode = mResults.PartnerFunOfPersonRespForTask;
			}
			this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
		},

		/**
		 * @param sStatus
		 */
		_setStatusSelectItemsVisibility: function (sStatus) {
			if (!this._oTaskContext) {
				return false;
			} else {
				var oContextData = this._oTaskContext.getObject();
				return formatter.taskStatusVisibility(oContextData.IsOutstanding, oContextData.IsReleased, oContextData.IsCompleted, oContextData.IsSuccessfull,
					sStatus);
			}
		}

	});

});