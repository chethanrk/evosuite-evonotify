sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"com/evorait/evosuite/evonotify/model/Constants"
], function (FormController, Constants) {
	"use strict";

	return FormController.extend("com.evorait.evosuite.evonotify.controller.CreateNotification", {

		oViewModel: null,
		aSmartForms: [],
		isStandalonePage: false,

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
			oRouter.getRoute("CreateNotification").attachMatched(function (oEvent) {
				this._initializeView();
			}, this);

			var eventBus = sap.ui.getCore().getEventBus();
			//Binnding has changed in TemplateRenderController.js
			eventBus.subscribe("TemplateRendererEvoNotify", "changedBinding", this._changedBinding, this);
		},

		/**
		 * Binding has changed in TemplateRenderController
		 * Set new controller context and path
		 * @param sChannel
		 * @param sEvent
		 * @param oData
		 */
		_changedBinding: function (sChannel, sEvent, oData) {
			if (sChannel === "TemplateRendererEvoNotify" && sEvent === "changedBinding") {
				var sViewId = this.getView().getId(),
					sViewName = this.getView().getViewName(),
					_sViewNameId = sViewName + "#" + sViewId;

				if (oData.viewNameId === _sViewNameId) {
					this._checkForLinkParameters();
				}
			}
		},

		/**
		 * life cycle event before view rendering
		 */
		onBeforeRendering: function () {},

		/**
		 * life cycle event after view rendering
		 */
		onAfterRendering: function () {
			this._initializeView();
		},

		onChangeSmartField: function (oEvent) {
			var oSource = oEvent.getSource(),
				sFieldName = oSource.getName();
			var oContext = this.getView().getBindingContext();

			if (oSource.getValueState() === "None" && oContext) {
				this._checkForDefaultProperties(oContext, "PMNotificationSet", sFieldName);
			}
		},

		/**
		 * 
		 */
		_initializeView: function () {
			this.aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
			this.setFormsEditable(this.aSmartForms, true);
			this.isStandalonePage = this.oViewModel.getProperty("/createPageOnly");

			this.oViewModel.setProperty("/editMode", true);
			this.oViewModel.setProperty("/isNew", true);
		},

		/**
		 * on press back button
		 * @param oEvent
		 */
		onNavBack: function () {
			//show confirm message
			var sPath = this.getView().getBindingContext().getPath();
			this.confirmEditCancelDialog(sPath);
		},

		/**
		 * Object on exit
		 */
		onExit: function () {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("TemplateRendererEvoNotify", "changedBinding", this._changedBinding, this);
		},

		/**
		 * On press cancel button
		 * @param oEvent
		 */
		onPressCancel: function (oEvent) {
			//show confirm message
			var sPath = this.getView().getBindingContext().getPath();
			this.confirmEditCancelDialog(sPath);
		},

		/**
		 * On press save button
		 * @param oEvent
		 */
		onPressSave: function (oEvent) {
			if (this.aSmartForms.length > 0) {
				var mErrors = this.validateForm(this.aSmartForms);
				//if form is valid save created entry
				this.saveChanges(mErrors, this._saveCreateSuccessFn.bind(this));
			}
		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		/**
		 * check for GET paramters in url 
		 * when there are parameters check if its a property name
		 * and is this property is creatable true
		 */
		_checkForLinkParameters: function () {
			var oContext = this.getView().getBindingContext();
			if (oContext) {
				var oData = oContext.getObject(),
					sPath = oContext.getPath(),
					oModel = this.getModel();
				if (oData) {
					delete oData.__metadata;
				}
				//check if GET parameter is allowed prefill field
				//only when property is creatable true then prefill property
				oModel.getMetaModel().loaded().then(function () {
					var oMetaModel = oModel.getMetaModel() || oModel.getProperty("/metaModel"),
						oEntitySet = oMetaModel.getODataEntitySet("PMNotificationSet"),
						oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);

					for (var key in oData) {
						var urlValue = this.getOwnerComponent().getLinkParameterByName(key);
						var oProperty = oMetaModel.getODataProperty(oEntityType, key);
						if (oProperty !== null) {
							if (urlValue && urlValue !== Constants.PROPERTY.NEW) {
								//check if key is creatable true and url param value is not bigger then maxLength of property
								if ((!oProperty.hasOwnProperty("sap:creatable") || oProperty["sap:creatable"] === "true") &&
									(urlValue.length <= parseInt(oProperty["maxLength"]))) {
									oModel.setProperty(sPath + "/" + key, urlValue);
								}
							}
							this.checkDefaultValues(oEntitySet.name.split("Set")[0], key, sPath);
						}
					}
				}.bind(this));
			}
		},

		/**
		 * success callback after creating order
		 * @param oResponse
		 */
		_saveCreateSuccessFn: function (oResponse) {
			var objectKey = null,
				oChangeData = this.getBatchChangeResponse(oResponse);

			if (oChangeData) {
				objectKey = oChangeData.ObjectKey;

				if (this.isStandalonePage) {
					var msg = this.getResourceBundle().getText("msg.notifcationCreateSuccess", objectKey);
					this.showSuccessMessage(msg);

					//Bind new context
					this.getView().unbindElement();
					var oContext = this.getView().getModel().createEntry("/PMNotificationSet");
					this.getView().setBindingContext(oContext);

					// defaulting values
					this._initializeView();
				} else if (objectKey && objectKey !== "") {
					this.oViewModel.setProperty("/newCreatedNotification", true);
					this.getRouter().navTo("NotificationDetail", {
						ObjectKey: objectKey
					});
				} else {
					var sMsg = this.getResourceBundle().getText("msg.saveSuccess");
					this.showSuccessMessage(sMsg);
					this.navBack();
				}
			}
		}
	});
});