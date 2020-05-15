sap.ui.define([
	"com/evorait/evonotify/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.evorait.evonotify.controller.FormController", {

		/**
		 * reset form and close editable state
		 * delete new created entry and nav back
		 */
		cancelFormHandling: function (doNavBack) {
			var isNew = this.getModel("viewModel").getProperty("/isNew"),
				isEditMode = this.getModel("viewModel").getProperty("/editMode");

			if (isEditMode && !isNew) {
				if (this.getView().getModel().hasPendingChanges()) {
					var sPath = this.getView().getBindingContext().getPath();
					this.confirmEditCancelDialog(sPath, doNavBack);
					return;
				} else {
					this.getModel("viewModel").setProperty("/editMode", false);
				}
				if (doNavBack) {
					this.getView().unbindElement();
					this.navBack();
				}
			}
			if (isNew) {
				this.confirmEditCancelDialog();
			}
		},

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
		saveChanges: function (mParams, oSuccessCallback) {
			var oViewModel = this.getView().getModel("viewModel");

			if (mParams.state === "success") {
				oViewModel.setProperty("/busy", true);
				this.getView().getModel().submitChanges({
					success: function (oResponse) {
						oSuccessCallback(oResponse);
						this.oViewModel.setProperty("/busy", false);
					}.bind(this),
					error: function (oError) {
						oViewModel.setProperty("/busy", false);
						this.showSaveErrorPrompt(oError);
					}.bind(this)
				});
			} else if (mParams.state === "error") {
				//var aErrorFields = mParams.fields;
			}
		},

		/**
		 * picks out the change response data from a batch call
		 * Need for create entries 
		 * Example: CreateNotification _saveCreateSuccessFn
		 * @param oResponse
		 */
		_getBatchChangeRepsonse: function (oResponse) {
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
		 * Show dialog when user wants to cancel change/creation of an entry
		 * @private
		 */
		confirmEditCancelDialog: function (sPath, doNavBack) {
			var oResoucreBundle = this.getResourceBundle(),
				oViewModel = this.getModel("viewModel"),
				isNew = oViewModel.getProperty("/isNew");

			var dialog = new sap.m.Dialog({
				title: oResoucreBundle.getText("tit.cancelCreate"),
				type: "Message",
				content: new sap.m.Text({
					text: oResoucreBundle.getText("msg.leaveWithoutSave")
				}),
				beginButton: new sap.m.Button({
					text: oResoucreBundle.getText("btn.confirm"),
					press: function () {
						dialog.close();
						var oContext = this.getView().getBindingContext();

						if (isNew) {
							//delete created entry
							this.navBack();
							this.getModel().deleteCreatedEntry(oContext);
							oViewModel.setProperty("/isNew", false);
						} else {
							//reset changes from object path
							this.getModel().resetChanges([sPath]);
							if (doNavBack) {
								//on edit cancel and nav back unbind object
								this.getView().unbindElement();
								this.navBack();
							}
						}
						oViewModel.setProperty("/editMode", false);
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: oResoucreBundle.getText("btn.no"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		}

	});

});