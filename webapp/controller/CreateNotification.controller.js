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

		/**
		 * 
		 */
		_initializeView: function () {
			this.aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
			this.setFormsEditable(this.aSmartForms, true);
			this.isStandalonePage = this.oViewModel.getProperty("/createPageOnly");

			this.oViewModel.setProperty("/editMode", true);
			this.oViewModel.setProperty("/isNew", true);

			this._checkForLinkParameters();
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

				//check if GET parameter is allowed prefill field
				//only when property is creatable true then prefill property
				oModel.getMetaModel().loaded().then(function () {
					var oMetaModel = oModel.getMetaModel() || oModel.getProperty("/metaModel"),
						oEntitySet = oMetaModel.getODataEntitySet("PMNotificationSet"),
						oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);

					for (var key in oData) {
						var urlValue = this.getOwnerComponent().getLinkParameterByName(key);
						if (urlValue && urlValue !== Constants.PROPERTY.NEW) {
							var oProperty = oMetaModel.getODataProperty(oEntityType, key);
							//check if key is creatable true and url param value is not bigger then maxLength of property
							if ((!oProperty.hasOwnProperty("sap:creatable") || oProperty["sap:creatable"] === "true") &&
								(urlValue.length <= parseInt(oProperty["maxLength"]))) {
								oModel.setProperty(sPath + "/" + key, urlValue);
							}
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
				} else if (objectKey && objectKey !== "") {
					this.oViewModel.setProperty("/newCreatedNotification", true);
					this.getRouter().navTo("NotificationDetail", {
						ObjectKey: objectKey
					});
				} else {
					var msg = this.getResourceBundle().getText("msg.saveSuccess");
					this.showSuccessMessage(msg);
					this.navBack();
				}
			}
		}
	});
});