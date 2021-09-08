sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/DialogFormController",
	"com/evorait/evosuite/evonotify/model/formatter"
], function (DialogFormController, formatter) {
	"use strict";

	return DialogFormController.extend("com.evorait.evosuite.evonotify.controller.ESignNotification", {

		_type: {
			esign: false
		},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/* =========================================================== */
		/* Events                                                      */
		/* =========================================================== */

		/**
		 * When password field changed check for whitespaces
		 * @param oEvent
		 */
		onChangeSmartField: function (oEvent) {
			var oSource = oEvent.getSource(),
				oParams = oEvent.getParameters();

			if (oSource.getName() === "idPASSWORD") {
				var sPassword = oParams.newValue.trim();
				this.getModel().setProperty(this._sPath + "/PASSWORD", sPassword ? btoa(sPassword) : "");

				if (sPassword) {
					oSource.setValueState(sap.ui.core.ValueState.None);
				} else {
					oSource.setValueState(sap.ui.core.ValueState.Error);
				}
			}
		},

		/**
		 * on save esign button
		 * Validate smartform
		 * Validate and trim password
		 * 
		 * @param oEvent
		 */
		saveChanges: function (mParams, successCallback, errorCallback, oDialog) {
			if (mParams.state === "success") {
				var sPassword = this.getModel().getProperty(this._sPath + "/PASSWORD").trim();
				if (sPassword !== "") {
					this._mParams.ReferenceDate = this.getModel().getProperty(this._sPath + "/REFERENCE_DATE");
					this._mParams.ReferenceTime = this.getModel().getProperty(this._sPath + "/REFERENCE_TIME");
					
					var successFn = function (oResponse) {
						if(successCallback){
							successCallback(oResponse);
						}
						var eventBus = sap.ui.getCore().getEventBus();
						eventBus.publish("TemplateRendererEvoNotify", "esignSuccess", this._mParams);
					};
					
					var errorFn = function(oError){
						if(errorCallback){
							errorCallback();
						}
					};
					DialogFormController.prototype.saveChanges.apply(this, [mParams, successFn.bind(this), errorFn.bind(this), oDialog]);
				}
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binding has changed in TemplateRenderController
		 * Set new controller context and path
		 * and load plant and new operation number when required
		 * @param sChannel
		 * @param sEvent
		 * @param oData
		 */
		_changedBinding: function (sChannel, sEvent, oData) {
			if (sChannel === "TemplateRendererEvoNotify" && sEvent === "changedBinding") {
				DialogFormController.prototype._changedBinding.apply(this, arguments);

				if (oData && (oData.viewNameId === this._sViewNameId)) {
					this._getDefaultGlobalParameters();

					//prefill planning plant for add and split
					if (this._type.esign) {
						this._setContextKeys();
						this._setFullNameToField();
						this._checkForDefaultProperties(this._oContext, this._mParams.entitySet);
						this._setDateTimeFields();
					}
				}
			}
		},

		/**
		 * prefill Notification data
		 */
		_setContextKeys: function () {
			if (this._oParentObject) {
				if (this._mParams.mKeys) {
					Object.keys(this._mParams.mKeys).forEach(function (key) {
						this.getModel().setProperty(this._sPath + "/" + key, this._mParams.mKeys[key]);
					}.bind(this));
				}
			}
		},
		
		/**
		 * extend user field with full name of user
		 */
		_setFullNameToField: function(){
			var oField = this.getFormFieldByName("idUSERNAME", this._aSmartForms);
			if (oField) {
				var oInnerCtrl = oField.getInnerControls(),
					oUserData = this.getModel("user").getData();
				try{
					oInnerCtrl[0].setText(oUserData.Fullname + " (" + oUserData.Username + ")");
				}catch(error){
					//do nothing
				}
			}
		},

		/**
		 * prefill date and time fields of visible fields in field group
		 * also only fill date and time when this field is allowed for create
		 */
		_setDateTimeFields: function () {
			var oMetaModel = this.getModel().getMetaModel() || this.getModel().getProperty("/metaModel");

			oMetaModel.loaded().then(function () {
				var oEntitySet = oMetaModel.getODataEntitySet("PMNotificationESignSet"),
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);

				var aFacet = oEntityType[this._mParams.annotationPath], //annotation path of form qualifier
					sGroupTarget = aFacet ? aFacet[0].Facets[0].Target.AnnotationPath : null, //annotation path to linked field group
					oGroupFields = sGroupTarget ? oEntityType[sGroupTarget.replace("@", "")] : null; //field group data

				var now = new Date(),
					offset = -(now.getTimezoneOffset() * 60 * 1000), // now in milliseconds
					userUnixStamp = +now + offset;

				if (oGroupFields && oGroupFields.Data) {
					//loop trough all fieldgroup properties
					oGroupFields.Data.forEach(function (oField) {
						var oProperty = oMetaModel.getODataProperty(oEntityType, oField.Value.Path);
						if (!oProperty.hasOwnProperty("sap:creatable") || oProperty["sap:creatable"] === "true") {
							if (oField.EdmType === "Edm.Date") {
								this.getModel().setProperty(this._sPath + "/" + oField.Value.Path, now);
							}
							if (oField.EdmType === "Edm.Time") {
								this.getModel().setProperty(this._sPath + "/" + oField.Value.Path, {
									ms: userUnixStamp,
									__edmType: "Edm.Time"
								});
							}
						}
					}.bind(this));
				}
			}.bind(this));
		}
	});
});