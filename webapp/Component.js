sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/Device",
		"com/evorait/evolite/evonotify/model/models",
		"com/evorait/evolite/evonotify/controller/ErrorHandler",
		"sap/m/Dialog",
	    "sap/m/Button",
	    "sap/m/Text",
	    "sap/m/MessageToast"
	], function (UIComponent, Device, models, ErrorHandler, Dialog, Button, Text, MessageToast) {
		"use strict";

		return UIComponent.extend("com.evorait.evolite.evonotify.Component", {

			metadata : {
				manifest: "json"
			},

			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * In this function, the device models are set and the router is initialized.
			 * @public
			 * @override
			 */
			init : function () {
				// call the base component's init function
				UIComponent.prototype.init.apply(this, arguments);

				// initialize the error handler with the component
				this._oErrorHandler = new ErrorHandler(this);

				// set the device model
				this.setModel(models.createDeviceModel(), "device");

				// create the views based on the url/hash
				this.getRouter().initialize();
			},

			/**
			 * The component is destroyed by UI5 automatically.
			 * In this method, the ErrorHandler is destroyed.
			 * @public
			 * @override
			 */
			destroy : function () {
				this._oErrorHandler.destroy();
				// call the base component's destroy function
				UIComponent.prototype.destroy.apply(this, arguments);
			},

			/**
			 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
			 * design mode class should be set, which influences the size appearance of some controls.
			 * @public
			 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
			 */
			getContentDensityClass : function() {
				if (this._sContentDensityClass === undefined) {
					// check whether FLP has already set the content density class; do nothing in this case
					if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
						this._sContentDensityClass = "";
					} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
						//sapUiSizeCompact
						this._sContentDensityClass = "sapUiSizeCompact";
					} else {
						// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
						this._sContentDensityClass = "sapUiSizeCozy";
					}
				}
				return this._sContentDensityClass;
			},
			
			/**
			 * save view form
			 * if its a new entry set new header title on success
			 */
			saveSubmitHandling : function(_this){
				var oViewModel = _this.getModel("objectView"),
					oForm = _this.oForm,
					isEditable = oForm.getEditable();
				
				// validation ok when form editable triggered to false
				if(oForm.check().length === 0){
					oViewModel.setProperty("/busy", true);
					
					// send only view Model else all data in global model will be submitted
					return _this.getView().getModel().submitChanges({
						success: function(){
							oViewModel.setProperty("/busy", false);
							oForm.setEditable(!isEditable);
							
							var sMsg = this.getModel("i18n").getResourceBundle().getText("saveSuccess");
							MessageToast.show(sMsg, {duration: 5000});
							_this._setNewHeaderTitle();
							oViewModel.setProperty("/isNew", false);
							oViewModel.setProperty("/isEdit", true);
						}.bind(this),
						
						error: function(oError){
							oViewModel.setProperty("/busy", false);
							this.showSaveErrorPrompt(oError);
						}.bind(this)
					 });
				}else{
					oForm.setEditable(!isEditable);
				}
			},
			
			/**
			 * save error dialog
			 */
			showSaveErrorPrompt : function(error){
				var oBundle = this.getModel("i18n").getResourceBundle();
				var sTitle = oBundle.getText("errorTitle");
				var sMsg = oBundle.getText("errorText");
	            var sBtn = oBundle.getText("buttonClose");
	
	            var dialog = new Dialog({
	                title: sTitle,
	                type: 'Message',
	                state: 'Error',
	                content: new Text({
	                    text: sMsg
	                }),
	                beginButton: new Button({
	                    text: sBtn,
	                    press: dialog.close
	                }),
	                afterClose: dialog.destroy
	            });
	            dialog.open();
			},
			
			/**
			 * maybe on a last step there needed to hide some SmartFields
			 * so on Object view navigation all fields should visible again
			 */
			showAllSmartFields : function(oForm){
				if(oForm){
					var smarFields = oForm.getSmartFields();
					for(var i=0; smarFields.length > i; i++){
						smarFields[i].setVisible(true);
					}
				}
			},
			
			/**
			 * workaround for cancel a new entry
			 * mandatory and filled fields are always validated
			 * currently there is always a validation on change editable
			 * but when fields are invisible validation breaks
			 */
			hideInvalidFields : function(oForm){
				var invalidFields = oForm.check();
				if(invalidFields.length > 0 && oForm){
					var smarFields = oForm.getSmartFields();
					for(var i=0; smarFields.length > i; i++){
						if(invalidFields.indexOf(smarFields[i].sId) > -1){
							smarFields[i].setVisible(false);
						}
					}
				}
			}

		});

	}
);