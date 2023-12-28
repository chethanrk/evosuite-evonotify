sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"sap/ui/core/Fragment",
	"sap/ui/util/Storage",
	"com/evorait/evosuite/evonotify/controller/UploadFilesController",
	"sap/ui/core/mvc/OverrideExecution"
], function (FormController, Fragment, Storage, UploadFilesController, OverrideExecution) {
	"use strict";

	return FormController.extend("com.evorait.evosuite.evonotify.controller.NotificationDetail", {

		metadata: {
			methods: {
				getAttachmentUrl: {
					public: true,
					final: false
				},
				onNavBack: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onChangeSelectedFile: {
					public: true,
					final: true
				},
				onPressEdit: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onChangeSmartField: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onPressSave: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onPressCancel: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onSelectStatus: {
					public: true,
					final: true
				},
				onPressChangeSystemStatus: {
					public: true,
					final: true
				},
				onPressChangeNumberedStatus: {
					public: true,
					final: true,
					overrideExecution: OverrideExecution.Instead
				},
				onPressChangeNonNumberedStatus: {
					public: true,
					final: true,
					overrideExecution: OverrideExecution.Instead
				},
				onPressCreateOrder: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Before
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
			oRouter.getRoute("NotificationDetail").attachMatched(function (oEvent) {
				this._initializeView();
			}, this);

			var eventBus = sap.ui.getCore().getEventBus();
			//Binding has changed in TemplateRenderController.js
			eventBus.subscribe("TemplateRendererEvoNotify", "changedBinding", this._changedBinding, this);
			//After successfull e-sign assignment
			eventBus.subscribe("TemplateRendererEvoNotify", "esignSuccess", this._signedSuccessful, this);

			//init controller for attachment upload
			this.oUploadController = new UploadFilesController();
			this.oUploadController.init(this);
			eventBus.subscribe("TemplateRendererEvoNotify", "uploadFinished", this._finishedUpload, this);
		},

		/**
		 * life cycle event before view rendering
		 */
		onBeforeRendering: function () {
			this.serviceUrl = this.getModel("viewModel").getProperty("/serviceUrl");
		},

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
			eventBus.unsubscribe("TemplateRendererEvoNotify", "uploadFinished", this._finishedUpload, this);
			if (this._actionSheetSystemStatus) {
				this._actionSheetSystemStatus.destroy(true);
				this._actionSheetSystemStatus = null;
			}
			if (this._actionSheetNumberedStatus) {
				this._actionSheetNumberedStatus.destroy(true);
				this._actionSheetNumberedStatus = null;
			}
			if (this._actionSheetNonNumberedStatus) {
				this._actionSheetNonNumberedStatus.destroy(true);
				this._actionSheetNonNumberedStatus = null;
			}
		},

		/* =========================================================== */
		/* Public methods                                           */
		/* =========================================================== */

		/**
		 * set right download url
		 * @param ObjectKey
		 * @param Fileid
		 * @returns {string}
		 */
		getAttachmentUrl: function (HeaderObjectKey, ObjectKey, Fileid, sEntitySet) {
			if (HeaderObjectKey && ObjectKey && sEntitySet) {
				var sAttachmentPath = this.getModel().createKey(sEntitySet, {
					HeaderObjectKey: HeaderObjectKey,
					ObjectKey: ObjectKey
				});
				return this.serviceUrl + sAttachmentPath + "/$value";
			}
			return "";
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
		 * reads selected file to an array
		 * @param oEvent
		 */
		onChangeSelectedFile: function (oEvent) {
			var files = oEvent.getParameter("files");
			if (files && files[0]) {
				this.oUploadController.init(this);
				this.oUploadController.setContext(this.getView().getBindingContext());
				this.oUploadController.startUploadFiles(files[0]);
				oEvent.getSource().clear();
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

			// set changed SmartField data from offline storage after refresh page
			this.setFormStorage2FieldData(this.sPath);
		},

		/** 
		 * On Change of smart field value
		 * @param oEvent
		 */

		onChangeSmartField: function (oEvent) {
			var oSource = oEvent.getSource(),
				sFieldName = oSource.getName();
			var oContext = this.getView().getBindingContext();
			if (oSource.getValueState() === "None" && oContext) {
				this.checkDefaultValues("PMNotificationSet", oContext.getPath(), sFieldName);
			}
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
				//delete local form storage of this view
				this.deleteExpiredStorage(this.getViewUniqueName());
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
			this.sFunctionType = oItem ? oItem.data("type") : oSource.data("type");
			if (this._showESign()) {
				this._showESignDialog();
			} else {
				this._updateStatus();
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
		/*
		* Show ActionSheet of Numbered User Status Button
		* @param oEvent
		* Author Chethan
		* Since 2402
		*/
		onPressChangeNumberedStatus: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._actionSheetNumberedStatus) {
				Fragment.load({
					name: "com.evorait.evosuite.evonotify.view.fragments.ActionSheetNumberedStatus",
					controller: this,
					type: "XML"
				}).then(function (oFragment) {
					this._actionSheetNumberedStatus = oFragment;
					this.getView().addDependent(oFragment);
					this._actionSheetNumberedStatus.addStyleClass(this.getModel("viewModel").getProperty("/densityClass"));
					this._actionSheetNumberedStatus.openBy(oButton);
				}.bind(this));
			} else {
				this._actionSheetNumberedStatus.openBy(oButton);
			}
		},
		/*
		 * Show ActionSheet of Non Numbered User Status Button
		 * @param oEvent
		 * Author Chethan
		 * Since 2402
		 */
		onPressChangeNonNumberedStatus: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._actionSheetNonNumberedStatus) {
				Fragment.load({
					name: "com.evorait.evosuite.evonotify.view.fragments.ActionSheetNonNumberedStatus",
					controller: this,
					type: "XML"
				}).then(function (oFragment) {
					this._actionSheetNonNumberedStatus = oFragment;
					this.getView().addDependent(oFragment);
					this._actionSheetNonNumberedStatus.addStyleClass(this.getModel("viewModel").getProperty("/densityClass"));
					this._actionSheetNonNumberedStatus.openBy(oButton);
				}.bind(this));
			} else {
				this._actionSheetNonNumberedStatus.openBy(oButton);
			}
		},
		/**
		 * on click of Create Order button
		 * Button visible only when order is not linked with Notification
		 */
		onPressCreateOrder: function () {
			// get current timestamp
			var notificationObject = this._oContext.getObject();
			delete notificationObject.__metadata;
			var olocalStorage = new Storage(Storage.Type.local);
			olocalStorage.put("NotificationObject", notificationObject);
			this.openEvoAPP("new", "EVOORDER");
		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		/**
		 * success callback after saving notification
		 * @param oResponse
		 */
		_saveSuccessFn: function (oResponse) {
			var msg = this.getResourceBundle().getText("msg.saveSuccess");
			this.showSuccessMessage(msg);
			this.setFormsEditable(this.aSmartForms, false);
			this.oViewModel.setProperty("/editMode", false);
			if (this._oContext) {
				this._setNotificationStatusButtonVisibility(this._oContext.getObject());
				this._setNumberedUserStatusButtonVisibility(this._oContext.getObject());
				this._setNonNumberedUserStatusButtonVisibility(this._oContext.getObject());
				this.getOwnerComponent().readData(this._oContext.getPath());
				this.getModel("viewModel").setProperty("/enableNotificationChange", this._oContext.getProperty("ENABLE_NOTIFICATION_CHANGE"));
			}
		},

		_initializeView: function () {
			this.aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
			this.setFormsEditable(this.aSmartForms, false);
			this.oViewModel.setProperty("/editMode", false);
			this.getModel("viewModel").setProperty("/sCurrentView", "NotificationDetail");
		},

		/**
		 * success after file upload was finished
		 */
		_finishedUpload: function (sChannel, sEvent, oData) {
			if (sChannel === "TemplateRendererEvoNotify" && sEvent === "uploadFinished") {
				this.getView().byId("SmartTable--NotifAttachments").rebindTable();
				var msg = this.getResourceBundle().getText("msg.uploadSuccess");
				this.showMessageToast(msg);
				this.addMsgToMessageManager(this.mMessageType.Success, msg, "/Detail");
			}
		},

		/**
		 * function to update the satus
		 */
		_updateStatus: function (mEsignParams) {
			this._oContext = this.getView().getBindingContext();
			if (this._oContext) {
				var oData = this._oContext.getObject(),
					sPath = this._oContext.getPath(),
					message = "";

				if (oData["ALLOW_" + this.sFunctionKey]) {
					//For Non Numbered Status we have to pass FunctionType as U
					this.sFunctionType = this.sFunctionType === "N" ? "U" : this.sFunctionType;
					this.getModel("viewModel").setProperty("/isStatusUpdate", true);
					this.getModel().setProperty(sPath + "/FUNCTION", this.sFunctionKey);
					this.getModel().setProperty(sPath + "/FUNCTION_TYPE", this.sFunctionType);

					if (this.sFunctionKey === "COMPLETE" && mEsignParams) {
						this._setRefrenceDate(sPath, mEsignParams);
					}

					var oMetaModel = this.getModel().getMetaModel() || this.getModel().getProperty("/metaModel");

					oMetaModel.loaded().then(function () {
						this.saveChanges({
							state: "success"
						}, this._saveSuccessFn.bind(this), this._updateStatusFailure.bind(this), this.getView());
					}.bind(this));

				} else {
					message = this.getResourceBundle().getText("msg.notificationSubmitFail", oData.NOTIFICATION_NO);
					this.showInformationDialog(message);
				}
			}
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
						this.getModel("viewModel").setProperty("/enableNotificationChange", this._oContext.getProperty("ENABLE_NOTIFICATION_CHANGE"));
						this._setNumberedUserStatusButtonVisibility(this._oContext.getObject());
						this._setNonNumberedUserStatusButtonVisibility(this._oContext.getObject());
					}
				}
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
		 * @param oData
		 */
		_setNotificationStatusButtonVisibility: function (oData) {
			var mNotificationAllows = {};
			for (var key in oData) {
				if (key.startsWith("ALLOW_")) {
					mNotificationAllows[key] = oData[key];
				}
			}
			this.oViewModel.setProperty("/NotificationAllows", mNotificationAllows);
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

		/*Function to Reset Model Changes on Update Failure*/
		_updateStatusFailure: function () {
			this.getView().getModel().resetChanges();
		},
		/*
		 * Set visibility of Numbered User Status Button based on ALLOW fields 
		 * @param oData
		 * Author Chethan
		 * Since 2402
		 */
		_setNumberedUserStatusButtonVisibility: function (oData) {
			var bShowNumberedStatus = false,
				aNumberedStatus = this.getModel("templateProperties").getProperty("/functionsSet/numberedUserStatus");
			if (aNumberedStatus && aNumberedStatus.length > 0) {
				for (var a in aNumberedStatus) {
					if (oData["ALLOW_" + aNumberedStatus[a].Function]) {
						bShowNumberedStatus = true;
						break;
					}
				}
			}
			this.oViewModel.setProperty("/showNumberedStatus", bShowNumberedStatus);
		},
		/*
		 * Set visibility of Non-Numbered User Status Button based on ALLOW fields 
		 * @param oData
		 * Author Chethan
		 * Since 2402
		 */
		_setNonNumberedUserStatusButtonVisibility: function (oData) {
			var bShowNonNumberedStatus = false,
				aNonNumberedStatus = this.getModel("templateProperties").getProperty("/functionsSet/nonNumberedUserStatus");
			if (aNonNumberedStatus && aNonNumberedStatus.length > 0) {
				for (var a in aNonNumberedStatus) {
					if (oData["ALLOW_" + aNonNumberedStatus[a].Function]) {
						bShowNonNumberedStatus = true;
						break;
					}
				}
			}
			this.oViewModel.setProperty("/showNonNumberedStatus", bShowNonNumberedStatus);
		},
	});
});