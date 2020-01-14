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
		validateForm: function (mParams) {
			var oView = mParams.view || this.getView(),
				aCustomFields = oView.getControlsByFieldGroupId("CustomFormField"),
				validatedSmartFields = mParams.form.check(), //SmartForm validation
				isValid = (validatedSmartFields.length === 0),
				invalidFields = validatedSmartFields;

			//console.log(mParams.form.check());

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
			return isValid;
		},

		/**
		 * submit a new entry to SAP
		 * @param sParamId
		 * @param sNavPath
		 */
		saveNewEntry: function (mParams) {
			var sParamId = mParams.entryKey,
				sNavPath = mParams.navPath;

			var oView = mParams.view || this.getView(),
				oModel = oView.getModel(),
				oViewModel = oView.getModel("viewModel");

			oViewModel.setProperty("/busy", true);
			oModel.submitChanges({
				success: function (response) {
					var batch = response.__batchResponses[0],
						sCreatedEntryId = null;

					oViewModel.setProperty("/busy", false);
					//success
					if(response.__batchResponses[0].response && response.__batchResponses[0].response.statusCode === "400"){
						if (mParams.error) {
							mParams.error();
						}
					}
					else{
						if (batch.__changeResponses) {
							if (batch && (batch.__changeResponses[0].data)) {
								sCreatedEntryId = batch.__changeResponses[0].data[sParamId];
							}
							if (sCreatedEntryId && sCreatedEntryId !== "" && sNavPath) {
								oViewModel.setProperty("/newCreatedEntry", true);
								this.getRouter().navTo("object", {
									objectId: sCreatedEntryId
								});
							} else {
								var msg = oView.getModel("i18n").getResourceBundle().getText("msg.saveSuccess");
								sap.m.MessageToast.show(msg);
	
								if (mParams.success) {
									mParams.success();
								}
							}
						}
					}
				}.bind(this),
				error: function (oError) {
					oViewModel.setProperty("/busy", false);
					if (mParams.error) {
						mParams.error();
					}
					this.showSaveErrorPrompt(oError);
				}.bind(this)
			});
		},

		/**
		 * save entry who was in edit mode
		 */
		saveChangedEntry: function (mParams) {
			var oView = mParams.view || this.getView(),
				oViewModel = oView.getModel("viewModel");

			oViewModel.setProperty("/busy", true);

			oView.getModel().submitChanges({
				success: function (response) {
					var successMsg = oView.getModel("i18n").getResourceBundle().getText("msg.submitSuccess");
					this.showMessageToast(successMsg);
					setTimeout(function () {
						oView.getModel().refresh();

						if (mParams.success) {
							mParams.success();
						}
						oViewModel.setProperty("/busy", false);
						oViewModel.setProperty("/editMode", false);
					}.bind(this), 1500);
				}.bind(this),
				error: function (oError) {
					oViewModel.setProperty("/busy", false);
					if (mParams.success) {
						mParams.success();
					}
					this.showSaveErrorPrompt(oError);
				}.bind(this)
			});
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
							this.getModel().resetChanges(sPath);
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