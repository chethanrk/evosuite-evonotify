sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/evorait/evosuite/evonotify/model/Constants",
	"sap/ui/core/mvc/OverrideExecution"
], function (FormController, Filter, FilterOperator, Constants, OverrideExecution) {
	"use strict";

	return FormController.extend("com.evorait.evosuite.evonotify.controller.NotificationItemDetail", {

		metadata: {
			methods: {
				onNavBack: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressEdit: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onPressSave: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onPressDelete: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				saveSuccessFn: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressCancel: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onNavToNotification: {
					public: true,
					final: true
				}
			}
		},

		oViewModel: null,
		aSmartForms: [],

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * worklist on init
		 */
		onInit: function () {
			FormController.prototype.onInit.apply(this, arguments);
			this.oViewModel = this.getModel("viewModel");

			var oRouter = this.getRouter();
			//route for page create new order
			oRouter.getRoute("NotificationItemDetail").attachMatched(function (oEvent) {
				this._initializeView();
			}, this);

			var eventBus = sap.ui.getCore().getEventBus();
			//Binding has changed in TemplateRenderController.js
			eventBus.subscribe("TemplateRendererEvoNotify", "changedBinding", this._changedBinding, this);
		},

		/**
		 * life cycle event before view rendering
		 */
		onBeforeRendering: function () {},

		/**
		 * Object after rendering
		 */
		onAfterRendering: function () {
			this._initializeView();

		},

		/**
		 * Object on exit
		 */
		onExit: function () {
			this.getView().unbindElement();
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("TemplateRendererEvoNotify", "changedBinding", this._changedBinding, this);
		},

		/**
		 * on press back button
		 * @param oEvent
		 */
		onNavBack: function (oEvent) {
			if (this.oViewModel.getProperty("/newCreatedNotification")) {
				this.oViewModel.setProperty("/newCreatedNotification", false);
				this.getView().unbindElement();
				this.getRouter().navTo("worklist", {}, true);
			} else if (this.oViewModel.getProperty("/editMode") && this.getModel().hasPendingChanges()) {
				//show confirm message
				var sPath = this.getView().getBindingContext().getPath();
				this.confirmEditCancelDialog(sPath, true);
			} else {
				this.getView().unbindElement();
				this.setFormsEditable(this.aSmartForms, false);
				this.oViewModel.setProperty("/editMode", false);
				this.getView().unbindElement();
				this.navBack();
			}
		},

		/**
		 * on edit button
		 * @param oEvent
		 */
		onPressEdit: function (oEvent) {
			this.setFormsEditable(this.aSmartForms, true);
			this.oViewModel.setProperty("/editMode", true);
			
			// set changed SmartField data from offline storage after refresh page
			var sPath = this.getView().getBindingContext().getPath();
			this.setFormStorage2FieldData(sPath);
		},

		/**
		 * on save button
		 * @param oEvent
		 */
		onPressSave: function (oEvent) {
			if (this.aSmartForms.length > 0) {
				var mErrors = this.validateForm(this.aSmartForms);
				this.saveChanges(mErrors, this.saveSuccessFn.bind(this));
			}
		},

		/**
		 * success callback after saving notification
		 * @param oResponse
		 */
		saveSuccessFn: function (oResponse) {
			var msg = this.getResourceBundle().getText("msg.saveSuccess");
			this.showSuccessMessage(msg);
			this.setFormsEditable(this.aSmartForms, false);
			this.oViewModel.setProperty("/editMode", false);
		},

		/**
		 * cancel creation
		 * @param oEvent
		 */
		onPressCancel: function (oEvent) {
			//show confirm message
			if (this.getModel().hasPendingChanges()) {
				var sPath = this.getView().getBindingContext().getPath();
				this.confirmEditCancelDialog(sPath);
			} else {
				this.setFormsEditable(this.aSmartForms, false);
				this.oViewModel.setProperty("/editMode", false);
			}
		},

		/**
		 * on delete confirm with user
		 * @param oEvent
		 */
		onPressDelete: function (oEvent) {
			var sMsg = this.getResourceBundle().getText("msg.confirmItemDelete");
			if (this._oContext) {
				var sObjectKey = this._oContext.getProperty("ObjectKey");
				var successFn = function () {
					this.deleteEntries([this.getView()], null).then(function () {
						this.getRouter().navTo("NotificationDetail", {
							ObjectKey: sObjectKey
						});
					}.bind(this));
				};
				this.confirmDialog(sMsg, successFn.bind(this), null, null);
			}
		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		_initializeView: function () {
			this.aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
			this.setFormsEditable(this.aSmartForms, false);
			this.oViewModel.setProperty("/editMode", false);
			this.getModel("viewModel").setProperty("/sCurrentView", "NotificationItemDetail");
		},

		/**
		 * navigate on breadcrumb link back to notifcation detail page
		 * @public
		 */
		onNavToNotification: function () {
			var obj = this.getView().getBindingContext().getObject();
			this.getRouter().navTo("NotificationDetail", {
				ObjectKey: obj.ObjectKey
			}, true);
		},

		/**
		 * TemplateRenderer changedBinding Event
		 * set new this._oContext
		 * @param sChannel
		 * @param sEvent
		 * @param oData
		 */
		_changedBinding: function (sChannel, sEvent, oData) {
			if (sChannel === "TemplateRendererEvoNotify" && sEvent === "changedBinding") {
				var sViewName = this.getView().getViewName() + "#" + this.getView().getId();

				if (oData && (oData.viewNameId === sViewName)) {
					this._oContext = this.getView().getBindingContext();
					if (!this._oContext) {
						this.getRouter().navTo("ObjectNotFound");
					} else {
						if (!this.getModel("viewModel").getProperty("/enableNotificationChange")) {
							this._getNotificationDetails(this._oContext.getObject().HeaderObjectKey);
						}
					}
				}
			}
		},

		_getNotificationDetails: function (filterParameter) {
			var oFilter1 = new Filter("ObjectKey", FilterOperator.EQ, filterParameter);
			this.getOwnerComponent().readData("/PMNotificationSet", [
				[oFilter1]
			]).then(function (oData) {
				this.getModel("viewModel").setProperty("/enableNotificationChange", oData.results[0].ENABLE_NOTIFICATION_CHANGE);
			}.bind(this));
		}
	});
});