sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evonotify.controller.FormController", {

		aSmartForms: [],
		oViewModel: null,

		onInit: function () {
			this.oViewModel = this.getModel("viewModel");

			//Bind the message model to the view and register it
			if (this.getOwnerComponent) {
				this.getOwnerComponent().registerViewToMessageManager(this.getView());
			}
		},

		/**
		 * get all forms of different tabs in one page 
		 */
		getAllSmartForms: function (aGroups) {
			var aForms = [];
			for (var i = 0; i < aGroups.length; i++) {
				if (aGroups[i] instanceof sap.ui.comp.smartform.SmartForm) {
					aForms.push(aGroups[i]);
				}
			}
			return aForms;
		},

		/**
		 * get all groups from all template forms in one page
		 */
		getAllSmartFormGroups: function (aForms) {
			var aGroups = [];
			aForms.forEach(function (oForm) {
				aGroups = aGroups.concat(oForm.getGroups());
			});
			return aGroups;
		},

		/**
		 * set editable true/false for all forms in one page
		 */
		setFormsEditable: function (aForms, isEditable) {
			if (aForms) {
				aForms.forEach(function (oForm) {
					oForm.setEditable(isEditable);
				});
			}
		},

		/**
		 * on edit button
		 */
		onPressEdit: function () {
			this.setFormsEditable(this.aSmartForms, true);
			this.oViewModel.setProperty("/editMode", true);
		},

		/**
		 * on save button
		 */
		onPressSave: function () {
			if (this.aSmartForms.length > 0) {
				var mErrors = this.validateForm(this.aSmartForms);
				this.saveChanges(mErrors, this._saveCreateSuccessFn.bind(this));
			}
		},

		/**
		 * when SmartField is visible as link 
		 * show app to app navigation popup
		 */
		onPressSmartField: function (oEvent) {
			var oSource = oEvent.getSource();
			this.openApp2AppPopover(oSource, oSource.getUrl());
		},

		/**
		 * when ObjectStatus in header is visible as active 
		 * show app to app navigation popup
		 */
		onPressObjectStatus: function (oEvent) {
			var oSource = oEvent.getSource();
			this.openApp2AppPopover(oSource, oSource.data("url"));
		},

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
							this.setFormsEditable(this.aSmartForms, false);
							oViewModel.setProperty("/editMode", false);
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
		},

		/**
		 * Validate smartForm with custom fields
		 * @public
		 */
		validateForm: function (aForms) {
			if (!aForms) {
				return {
					state: "error"
				};
			}
			var aCustomFields = this.getView().getControlsByFieldGroupId("CustomFormField"),
				validatedSmartFields = [];

			aForms.forEach(function (oForm) {
				var validated = oForm.check(); //SmartForm validation
				validatedSmartFields = validatedSmartFields.concat(validated);
			});

			var isValid = validatedSmartFields.length === 0,
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

		/*
		 * function to deleted recent created context if exist
		 * 
		 */
		_deleteCreatedLocalEntry: function () {
			var oContext = this.getView().getBindingContext();
			if (oContext) {
				this.getModel().deleteCreatedEntry(oContext);
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
						var isNew = this.getView().getModel("viewModel").getProperty("/isNew"),
							isStatusUpdate = this.getView().getModel("viewModel").getProperty("/isStatusUpdate");

						if (isNew) {
							this._deleteCreatedLocalEntry();
						}
						if (this.getView().getModel().hasPendingChanges() && isStatusUpdate) {
							this.getView().getModel().resetChanges();
							this.getModel("viewModel").setProperty("/isStatusUpdate", false);

						}
						this._setBusyWhileSaving(oCtrl, false);
						this.getView().getModel("viewModel").setProperty("/busy", false);
						if (oResponse.__batchResponses && oResponse.__batchResponses[0].response && oResponse.__batchResponses[0].response.statusCode ===
							"400") {
							if (oErrorCallback) {
								oErrorCallback(oResponse);
							}
						} else {
							if (oSuccessCallback) {
								oSuccessCallback(oResponse);
							}
						}

					}.bind(this),
					error: function (oError) {
						this._setBusyWhileSaving(oCtrl, false);
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
		 * success callback after creating order
		 */
		_saveCreateSuccessFn: function () {
			var msg = this.getResourceBundle().getText("msg.saveSuccess");
			this.showMessageToast(msg);
			this.setFormsEditable(this.aSmartForms, false);
			this.oViewModel.setProperty("/editMode", false);
		},

		/**
		 * picks out the change response data from a batch call
		 * Need for create entries 
		 * Example: CreateNotification saveCreateSuccessFn
		 * @param oResponse
		 */
		getBatchChangeResponse: function (oResponse) {
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
		 * @param aForms
		 */
		getFormFieldByName: function (sName, aForms) {
			if (!sName || !aForms) {
				return null;
			}
			for (var j = 0; aForms.length > j; j++) {
				var aSmartFields = aForms[j].getSmartFields();
				for (var i = 0; aSmartFields.length > i; i++) {
					if (aSmartFields[i].getName() === sName) {
						return aSmartFields[i];
					}
				}
			}
			return null;
		},

		showSuccessMessage: function (sMessage) {
			this.showMessageToast(sMessage);
		},

		/**
		 * check for defalt values when depenbt on enterd value 
		 * when there are values check if its a property name
		 * and is this property is creatable true
		 * if true then find for default value if exist
		 */
		_checkForDefaultProperties: function (oContext, sEntitySet) {
			if (oContext) {
				var oData = oContext.getObject(),
					sPath = oContext.getPath(),
					oModel = this.getModel();
				delete oData.__metadata;
				//check if GET parameter is allowed prefill field
				//only when property is creatable true then prefill property
				oModel.getMetaModel().loaded().then(function () {
					var oMetaModel = oModel.getMetaModel() || oModel.getProperty("/metaModel"),
						oEntitySet = oMetaModel.getODataEntitySet(sEntitySet),
						oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);

					for (var key in oData) {
						var oProperty = oMetaModel.getODataProperty(oEntityType, key);
						if (!oProperty.hasOwnProperty("sap:creatable") || oProperty["sap:creatable"] === "true") {
							this.checkDefaultValues(oEntitySet.name.split("Set")[0], key, sPath);
						}
					}
				}.bind(this));
			}
		},

		/*
		 * method to validate the properties with default properties
		 * if default properties exist, it will call backend for default value of the specific properties
		 */
		checkDefaultValues: function (oEntitySet, sProperty, sPath) {
			var aDefaultValues = this.getModel("DefaultInformationModel").getProperty("/defaultProperties");
			for (var i in aDefaultValues) {
				if (aDefaultValues[i].EntityName === oEntitySet && aDefaultValues[i].PropertyName === sProperty) {
					//get ValueIn for properties
					var sPropInValues = this._getValueForParameterProperties(aDefaultValues[i], sPath);
					if (sPropInValues) {
						var oFilter = new Filter({
							filters: [
								new Filter("EntityName", FilterOperator.EQ, aDefaultValues[i].EntityName),
								new Filter("PropertyName", FilterOperator.EQ, aDefaultValues[i].PropertyName),
								new Filter("ValueIn", FilterOperator.EQ, sPropInValues)
							],
							and: true
						});
						this._getPropertyValue(oFilter, sPath);
					}
				}
			}
		},

		/*
		 * get the values for the specified properties
		 * returns ValueIn with given separator
		 * handle data if it's own context or parent context
		 */
		_getValueForParameterProperties: function (aDefaultValues, sPath) {
			var sSeparator = aDefaultValues.Separator,
				aPropertityIn = aDefaultValues.PropertyIn.split(sSeparator),
				sProp;
			aPropertityIn.forEach(function (aProperty) {
				var sPropertyEntity = aProperty.split("~")[0],
					sPropertySel = aProperty.split("~")[1],
					sPropValue;
				if (sPath.split("Set")[0].toUpperCase().split("/")[1] === sPropertyEntity) {
					sPropValue = this.getModel().getProperty(sPath + "/" + sPropertySel);
				} else if (this.getView().getParent()) {
					//check parent context
					var pContext = this.getView().getParent().getParent().getBindingContext(),
						pPath = pContext.getPath();
					if (pPath.split("Set")[0].toUpperCase().split("/")[1] === sPropertyEntity) {
						var parentObject = pContext.getObject();
						sPropValue = parentObject[sPropertySel];
					}
				}

				if (sPropValue && sPropValue !== null) {
					if (!sProp) {
						sProp = sPropValue;
					} else {
						sProp += sSeparator + sPropValue;
					}
				}
			}.bind(this));
			return sProp;
		},

		/*
		 * get call for each property to get default value respect to the property
		 */
		_getPropertyValue: function (oFilter, sPath) {
			new Promise(function (resolve) {
				this.getOwnerComponent().readData("/PropertyValueDeterminationSet", [oFilter]).then(function (oData) {
					resolve(oData.results[0]);
					if (oData.results) {
						this.getModel().setProperty(sPath + "/" + oData.results[0].PropertyName, oData.results[0].ReturnValue);
					}
				}.bind(this));
			}.bind(this));
		}
	});
});