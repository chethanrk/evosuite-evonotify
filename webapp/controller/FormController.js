sap.ui.define([
	"com/evorait/evonotify/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.evorait.evonotify.controller.FormController", {

		/**
		 * Validate smartForm with custom fields
		 * @public
		 */
		validateForm: function (oForm) {
			if (!oForm) {
				return {
					state: "error"
				};
			}
			var aCustomFields = this.getView().getControlsByFieldGroupId("CustomFormField"),
				validatedSmartFields = oForm.check(), //SmartForm validation
				isValid = (validatedSmartFields.length === 0),
				invalidFields = validatedSmartFields;

			//validate custom input fields
			for (var i = 0; i < aCustomFields.length; i++) {
				if (aCustomFields[i].getValue) {
					var sValue = aCustomFields[i].getValue();
					try {
						if (aCustomFields[i].getRequired() && aCustomFields[i].getEditable() && (!sValue || sValue.trim() === "")) {
							aCustomFields[i].setValueState(sap.ui.core.ValueState.Error);
							isValid = false;
							invalidFields.push(aCustomFields[i]);
						} else {
							aCustomFields[i].setValueState(sap.ui.core.ValueState.None);
						}
					} catch (e) {
						//do nothing
					}
				}
			}

			if (isValid) {
				return {
					state: "success"
				};
			} else {
				return {
					state: "error",
					fields: invalidFields
				};
			}
		},

		/**
		 * Form is valid now so send to sap
		 * @param oEvent
		 */
		saveChanges: function (mParams, oSuccessCallback, oErrorCallback, oCtrl) {
			if (mParams.state === "success") {
				this._setBusyWhileSaving(oCtrl, true);

				this.getView().getModel().submitChanges({
					success: function (oResponse) {
						this._setBusyWhileSaving(oCtrl, false);
						this.getView().getModel("viewModel").setProperty("/busy", false);
						if (oSuccessCallback) {
							oSuccessCallback(oResponse);
						}
					}.bind(this),
					error: function (oError) {
						this._setBusyWhileSaving(oCtrl, false);
						this.showSaveErrorPrompt(oError);
						if (oErrorCallback) {
							oErrorCallback(oError);
						}
					}.bind(this)
				});
			} else if (mParams.state === "error") {
				//var aErrorFields = mParams.fields;
			}
		},

		_setBusyWhileSaving: function (oCtrl, bIsInProgress) {
			if (oCtrl) {
				oCtrl.setBusy(bIsInProgress);
			} else {
				this.getView().getModel("viewModel").setProperty("/busy", bIsInProgress);
			}
		},

		/**
		 * picks out the change response data from a batch call
		 * Need for create entries 
		 * Example: CreateNotification _saveCreateSuccessFn
		 * @param oResponse
		 */
		_getBatchChangeResponse: function (oResponse) {
			var batch = oResponse.__batchResponses[0];
			//success
			if (batch.__changeResponses) {
				if (batch && (batch.__changeResponses[0].data)) {
					return batch.__changeResponses[0].data;
				}
			}
			return null;
		},

		/**
		 * returns a SmartField from a SmartForm by name
		 * @param sName
		 * @param oForm
		 */
		getFormFieldByName: function (sName, oForm) {
			if (!sName || !oForm) {
				return null;
			}
			var aSmartFields = oForm.getSmartFields();
			for (var i = 0; aSmartFields.length > i; i++) {
				if (aSmartFields[i].getName() === sName) {
					return aSmartFields[i];
				}
			}
			return null;
		}
	});
});