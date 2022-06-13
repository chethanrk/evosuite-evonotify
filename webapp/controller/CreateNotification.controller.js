sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/FormController",
	"com/evorait/evosuite/evonotify/model/Constants",
	"sap/ui/util/Storage",
	"sap/ui/core/mvc/OverrideExecution"
], function (FormController, Constants, Storage, OverrideExecution) {
	"use strict";

	return FormController.extend("com.evorait.evosuite.evonotify.controller.CreateNotification", {

		metadata: {
			methods: {
				onChangeSmartField: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onNavBack: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressCancel: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onPressSave: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Before
				}
			}
		},

		oViewModel: null,
		aSmartForms: [],
		isStandalonePage: false,
		sEntitySet: "PMNotificationSet",

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
			oRouter.getRoute("CreateNotification").attachMatched(function (oEvent) {
				this._initializeView();
			}, this);

			var eventBus = sap.ui.getCore().getEventBus();
			//Binnding has changed in TemplateRenderController.js
			eventBus.subscribe("TemplateRendererEvoNotify", "changedBinding", this._changedBinding, this);
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
		 * Object on exit
		 */
		onExit: function () {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("TemplateRendererEvoNotify", "changedBinding", this._changedBinding, this);
		},

		/**
		 * when SmartField change event was triggered
		 * @param oEvent
		 */
		onChangeSmartField: function (oEvent) {
			FormController.prototype.onChangeSmartField.apply(this, arguments);

			var oSource = oEvent.getSource(),
				sFieldName = oSource.getName();
			var oContext = this.getView().getBindingContext();

			if (oSource.getValueState() === "None" && oContext) {
				this.checkDefaultValues(this.sEntitySet, oContext.getPath(), sFieldName);
			}
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
		 * when view was initialized
		 */
		_initializeView: function () {
			this.aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
			this.setFormsEditable(this.aSmartForms, true);
			this.isStandalonePage = this.oViewModel.getProperty("/createPageOnly");

			this.oViewModel.setProperty("/editMode", true);
			this.oViewModel.setProperty("/isNew", true);
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
				var _sViewNameId = this.getViewUniqueName(),
					oContext = this.getView().getBindingContext();

				if (oData.viewNameId === _sViewNameId && oContext) {
					var sPath = oContext.getPath();
					//Load all defaulting values and prefill form
					this.checkDefaultValues(this.sEntitySet, sPath).then(function () {
						//1.Step check for GET parameters in url and prefill form
						this._checkForLinkParameters(oContext);

						//2.Step get order data from local storage when coming from EvoNotify "Create Order"
						//if its exists, validate the property and copy value to PMNotification
						this.oStorage = new Storage(Storage.Type.local);
						var oOrder = this.oStorage.get("OrderObject");
						if (oOrder) {
							this.getModel("viewModel").setProperty("/startPage", "");
							this.oViewModel.setProperty("/createPageOnly", false);
							this._setDefaultDataFromLocalStorage(oOrder, sPath);
						}

						//3.Step set changed SmartField data from offline storage after refresh page
						this.setFormStorage2FieldData(sPath);
					}.bind(this));
				}
			}
		},

		/**
		 * check for GET paramters in url 
		 * when there are parameters check if its a property name
		 * and is this property is creatable true
		 */
		_checkForLinkParameters: function (oContext) {
			var oData = oContext.getObject(),
				sPath = oContext.getPath(),
				oModel = this.getModel();

			if (oData) {
				delete oData.__metadata;
			}
			//check if GET parameter is allowed prefill field
			//only when property is creatable true then prefill property
			var oMetaModel = oModel.getMetaModel() || oModel.getProperty("/metaModel"),
				oEntitySet = oMetaModel.getODataEntitySet(this.sEntitySet),
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
				}
			}
		},

		/**
		 * success callback after creating order
		 * @param oResponse
		 */
		_saveCreateSuccessFn: function (oResponse) {
			//delete local form storage of this view
			this.deleteExpiredStorage(this.getViewUniqueName());

			var objectKey = null,
				oChangeData = this.getBatchChangeResponse(oResponse);

			if (oChangeData) {
				objectKey = oChangeData.ObjectKey;

				if (this.isStandalonePage) {
					var msg = this.getResourceBundle().getText("msg.notifcationCreateSuccess", objectKey);
					this.showSuccessMessage(msg);

					//Bind new context
					this.getView().unbindElement();
					var oContext = this.getView().getModel().createEntry("/" + this.sEntitySet);
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
		},

		/**
		 * Get the properties from PMNotification entity and check if it is creatable
		 * If true and if the property exists in the order object copied from local storage
		 * then copy the order property value into PMNotification property
		 * @param oOrder
		 */
		_setDefaultDataFromLocalStorage: function (oOrder, sPath) {
			var oMetaModel = this.getModel().getMetaModel();
			var oEntityType = oMetaModel.getODataEntityType("com.evorait.evonotify.PMNotification");
			var aProperties = oEntityType.property;

			for (var i = 0; i < aProperties.length; i++) {
				var isCreatable = aProperties[i]["sap:creatable"];
				if ((isCreatable === undefined || isCreatable === true) && oOrder[aProperties[i].name] !== undefined) {
					this.getModel().setProperty(sPath + "/" + aProperties[i].name, oOrder[aProperties[i].name]);

					//Apply defaulting values
					this.checkDefaultPropertiesWithValues(oEntityType, sPath, aProperties[i].name, oMetaModel);
				}
			}
			this.getModel().setProperty(sPath + "/DESCRIPTION", oOrder.ORDER_DESCRIPTION);
			this.oStorage.clear();
		}
	});
});