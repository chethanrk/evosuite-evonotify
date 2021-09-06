sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"sap/ui/core/Fragment"
], function (FormController, Fragment) {
	"use strict";

	return FormController.extend("com.evorait.evosuite.evonotify.controller.NotificationDetail", {

		oViewModel: null,
		aSmartForms: [],

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * worklist on init
		 */
		onInit: function () {
			this.oViewModel = this.getModel("viewModel");

			var oRouter = this.getRouter();
			//route for page create new order
			oRouter.getRoute("NotificationDetail").attachMatched(function (oEvent) {
				this._initializeView();
			}, this);

			var eventBus = sap.ui.getCore().getEventBus();
			//Binding has changed in TemplateRenderController.js
			eventBus.subscribe("TemplateRendererEvoNotify", "changedBinding", this._changedBinding, this);
			eventBus.subscribe("TemplateRendererEvoNotify", "esignSuccess", this._signedSuccessful, this);

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
			eventBus.unsubscribe("TemplateRendererEvoNotify", "esignSuccess", this._signedSuccessful, this);
			if (this._actionSheetSystemStatus) {
				this._actionSheetSystemStatus.destroy(true);
				this._actionSheetSystemStatus = null;
			}
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
				this.confirmEditCancelDialog(this.sPath, true);
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
			this.sPath = this.getView().getBindingContext().getPath();
			this.setFormsEditable(this.aSmartForms, true);
			this.oViewModel.setProperty("/editMode", true);
		},

		/**
		 * on save button
		 * @param oEvent
		 */
		onPressSave: function (oEvent) {
			if (this.aSmartForms.length > 0) {
				var mErrors = this.validateForm(this.aSmartForms);
				this.saveChanges(mErrors, this._saveSuccessFn.bind(this));
			}
		},

		/**
		 * cancel creation
		 * @param oEvent
		 */
		onPressCancel: function (oEvent) {
			//show confirm message
			if (this.getModel().hasPendingChanges()) {
				this.confirmEditCancelDialog(this.sPath);
			} else {
				this.setFormsEditable(this.aSmartForms, false);
				this.oViewModel.setProperty("/editMode", false);
			}
		},

		/**
		 * show ActionSheet of system status buttons
		 * @param oEvent
		 */
		onPressChangeSystemStatus: function (oEvent) {
			var oButton = oEvent.getSource();
			// create action sheet only once
			if (!this._actionSheetSystemStatus) {
				Fragment.load({
					name: "com.evorait.evosuite.evonotify.view.fragments.ActionSheetSystemStatus",
					controller: this,
					type: "XML"
				}).then(function (oFragment) {
					this._actionSheetSystemStatus = oFragment;
					this.getView().addDependent(oFragment);
					this._actionSheetSystemStatus.addStyleClass(this.getModel("viewModel").getProperty("/densityClass"));
					this._actionSheetSystemStatus.openBy(oButton);
				}.bind(this));
			} else {
				this._actionSheetSystemStatus.openBy(oButton);
			}
		},

		/**
		 * Show select status dialog with maybe pre-selected filter
		 * @param oEvent
		 */
		onSelectStatus: function (oEvent) {
			var oSource = oEvent.getSource(),
				oItem = oEvent.getParameter("item");

			this.sFunctionKey = oItem ? oItem.data("key") : oSource.data("key");
			if (this._showESign()) {
				this._showESignDialog();
			} else {
				this._updateStatus();
			}
		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		_initializeView: function () {
			this.aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
			this.setFormsEditable(this.aSmartForms, false);
			this.oViewModel.setProperty("/editMode", false);
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

					if (this.oViewModel.getProperty("/newCreatedNotification") === true) {
						this.oViewModel.setProperty("/newCreatedNotification", false);
						//refresh only this binding and not whole oDataModel
						this.getView().getElementBinding().refresh();
					}

					if (!this._oContext) {
						this.getRouter().navTo("ObjectNotFound");
					} else {
						this._setNotificationStatusButtonVisibility(this._oContext.getObject());
					}
				}
			}
		},

		/**
		 * Notification was successful signed
		 * So update system status of notification
		 * @param sChannel
		 * @param sEvent
		 * @param oData
		 */
		_signedSuccessful: function (sChannel, sEvent, oData) {
			if (sChannel === "TemplateRendererEvoNotify" && sEvent === "esignSuccess") {
				this._updateStatus(oData);
			}
		},

		/**
		 * show E-Sign Dialog with SmartForm inside
		 * SmartFields are rendered by annotation qualifier NotifEsignForm
		 */
		_showESignDialog: function () {
			var oData = this._oContext.getObject();
			var mParams = {
				viewName: "com.evorait.evosuite.evonotify.view.templates.SmartFormWrapper#NotifEsignForm",
				annotationPath: "com.sap.vocabularies.UI.v1.Facets#NotifEsignForm",
				entitySet: "PMNotificationESignSet",
				controllerName: "ESignNotification",
				title: "tit.eSignDialogTitle",
				type: "esign",
				mKeys: {
					NOTIFICATION_NO: oData.NOTIFICATION_NO,
					NOTIFICATION_TYPE: oData.NOTIFICATION_TYPE,
					NOTIFICATION_ITEM: oData.NOTIFICATION_ITEM,
					USERNAME: this.getModel("user").getProperty("/Username")
				}
			};
			this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
		},

		/*
		 * Function to decide whether esign should be shown on status update
		 */
		_showESign: function () {
			var isEsignEnabled = this.getModel("user").getProperty("/ENABLE_ESIGN");
			var oData = this._oContext.getObject();
			if (isEsignEnabled === "X" && oData.ALLOW_ESIGN && this.sFunctionKey === "COMPLETE") {
				return true;
			}
			return false;
		},

		/**
		 * success callback after saving notification
		 * @param oResponse
		 */
		_saveSuccessFn: function (oResponse) {
			var msg = this.getResourceBundle().getText("msg.saveSuccess");
			this.showSuccessMessage(msg);
			this.setFormsEditable(this.aSmartForms, false);
			this.oViewModel.setProperty("/editMode", false);
			this._setNotificationStatusButtonVisibility(this._oContext.getObject());
		},

		/**
		 * function to update the satus
		 */
		_updateStatus: function (mEsignParams) {
			var oData = this._oContext.getObject(),
				sPath = this._oContext.getPath(),
				message = "";
			this._oContext = this.getView().getBindingContext();

			if (oData["ALLOW_" + this.sFunctionKey]) {
				this.getModel("viewModel").setProperty("/isStatusUpdate", true);
				this.getModel().setProperty(sPath + "/FUNCTION", this.sFunctionKey);

				if (this.sFunctionKey === "COMPLETE" && mEsignParams) {
					this._setRefrenceDate(sPath, mEsignParams);
				}

				var oMetaModel = this.getModel().getMetaModel() || this.getModel().getProperty("/metaModel");
				
				oMetaModel.loaded().then(function () {
					this.saveChanges({
						state: "success"
					}, this._saveSuccessFn.bind(this), null, this.getView());
				}.bind(this));
				
			} else {
				message = this.getResourceBundle().getText("msg.notificationSubmitFail", oData.NOTIFICATION_NO);
				this.showInformationDialog(message);
			}
		},

		/**
		 * When E-Signing is activated for notification then maybe reference date and time was send
		 * same date fields needs send for status complete change in notification header data
		 * @param sPath
		 * @param mEsignParams
		 */
		_setRefrenceDate: function (sPath, mEsignParams) {
			var oMetaModel = this.getModel().getMetaModel() || this.getModel().getProperty("/metaModel");

			oMetaModel.loaded().then(function () {
				var oEntitySet = oMetaModel.getODataEntitySet("PMNotificationSet"),
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
					oRefDate = oMetaModel.getODataProperty(oEntityType, "REFERENCE_DATE"),
					oRefTime = oMetaModel.getODataProperty(oEntityType, "REFERENCE_TIME");

				if (oRefDate && oRefTime) {
					if ((!oRefDate.hasOwnProperty("sap:updatable") || oRefDate["sap:updatable"] === "true") && mEsignParams.ReferenceDate) {
						this.getModel().setProperty(sPath + "/REFERENCE_DATE", mEsignParams.ReferenceDate);
					}
					if ((!oRefTime.hasOwnProperty("sap:updatable") || oRefTime["sap:updatable"] === "true") && mEsignParams.ReferenceTime) {
						this.getModel().setProperty(sPath + "/REFERENCE_TIME", mEsignParams.ReferenceTime);
					}
				}
			}.bind(this));
		},

		/**
		 * set visibility on status change dropdown items based on allowance from order status
		 */
		_setSelectFunctionVisibility: function () {
			if (this._oContext) {
				var oData = this._oContext.getObject(),
					oStatusSelectControl = this.getView().byId("idStatusChangeMenu"),
					oMenu = oStatusSelectControl.getMenu();

				oMenu.getItems().forEach(function (oItem) {
					oItem.setVisible(oData["ALLOW_" + oItem.getKey()]);
				}.bind(this));
			}
		},

		/**
		 * set visibility on status change dropdown items based on allowance from order status
		 */
		_setNotificationStatusButtonVisibility: function (oData) {
			var mNotificationAllows = {};
			for (var key in oData) {
				if (key.startsWith("ALLOW_")) {
					mNotificationAllows[key] = oData[key];
				}
			}
			this.oViewModel.setProperty("/NotificationAllows", mNotificationAllows);
		}
	});
});