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
		 * @param oEvent
		 */
		onChangeSmartField: function (oEvent) {
			var oSource = oEvent.getSource(),
				oParams = oEvent.getParameters();
			
			if(oSource.getName() === "idPASSWORD"){
				var sPassword = oParams.newValue.trim();
				this.getModel().setProperty(this._sPath + "/PASSWORD", sPassword);
				
				if(sPassword){
					oSource.setValueState(sap.ui.core.ValueState.None);
				}else{
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
					var encodedPassword = btoa(sPassword);
					this.getModel().setProperty(this._sPath + "/PASSWORD", encodedPassword);
					this.getModel("viewModel").setProperty("/isNew", true);
					
					var successFn = function(){
						var eventBus = sap.ui.getCore().getEventBus();
						eventBus.publish("TemplateRendererEvoNotify", "esignSuccess", {});
					};
					
					DialogFormController.prototype.saveChanges.apply(this, [mParams, successFn.bind(this), errorCallback, oDialog]);
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
		}
	});
});