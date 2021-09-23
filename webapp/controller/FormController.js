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
							this.getModel().resetChanges();
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

						//Below condition checks if save action was for new created entity
						//where in such case the locally created entry needs to be deleted
						if (isNew) {
							this._deleteCreatedLocalEntry();
						}
						//Below condition checks if there is any pending changes to reset
						//Only status update changes needs to be reset in case of failure 
						if (this.getView().getModel().hasPendingChanges() && isStatusUpdate) {
							this.getView().getModel().resetChanges();
							this.getModel("viewModel").setProperty("/isStatusUpdate", false);

						}
						this._setBusyWhileSaving(oCtrl, false);
						this.getView().getModel("viewModel").setProperty("/busy", false);
						if (oResponse.__batchResponses) {
							var responses = oResponse.__batchResponses[0].response || oResponse.__batchResponses[0].__changeResponses[0];
							var sStatusCode = parseInt(responses.statusCode, 10);

							if (!isNaN(sStatusCode) && sStatusCode < 300) {
								if (oSuccessCallback) {
									oSuccessCallback(oResponse);
								}
							} else if (oErrorCallback) {
								oErrorCallback(oResponse);
							}
						} else if (oErrorCallback) {
							oErrorCallback(oResponse);
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

		/*
		 * Get Properties from the default information model
		 * Validates for the change or initial binding
		 * @parm sEntitySet
		 * @param sPath
		 * @parm sChangedProperty
		 */
		checkDefaultValues: function (sEntitySet, sPath, sChangedProperty) {
			var aDefaultValues = this.getModel("DefaultInformationModel").getProperty("/defaultProperties");

			var sEntity = sEntitySet.split("Set")[0];

			if (!aDefaultValues) {
				aDefaultValues = [];
			}

			//check changed property and get dependent properties to add default values
			if (sChangedProperty) {
				aDefaultValues = this._checkForDefaultProperties(aDefaultValues, sEntity, sChangedProperty);
			}

			aDefaultValues.forEach(function (oItem) {
				if (sEntity === oItem.EntityName) {
					this._findDefaultPropertyValues(oItem, sPath, sChangedProperty);
				}
			}.bind(this));
		},

		/**
		 * to check other defalt properties when dependent on value is changed and which are dependent on changed value
		 * Create a new array of properties which can be depends on changed property
		 * @param aDefaultValues - array of default value properties
		 * @param sEntitySet - Which entity we are going to change
		 * @param sChangedProperty - Which property is changed.
		 * @rerurn [aDeafultChangedValues] -Array of default properties to be change
		 */
		_checkForDefaultProperties: function (aDefaultValues, sEntitySet, sChangedProperty) {
			var aDeafultChangedValues = [];
			aDefaultValues.forEach(function (aDefValue) {
				var bValidate = false;
				var sSeparator = aDefValue.Separator,
					aPropertityIn = aDefValue.PropertyIn.split(sSeparator);
				if (aPropertityIn && aPropertityIn !== "" && aDefValue.EntityName === sEntitySet) {
					aPropertityIn.forEach(function (aProperty) {
						var sPropertySel = aProperty.split("~")[1];
						if (sPropertySel !== "" && sPropertySel === sChangedProperty.split("id")[1]) {
							bValidate = true;
						}
					}.bind(this));
				}
				if (bValidate) {
					aDeafultChangedValues.push(aDefValue);
				}
			}.bind(this));

			return aDeafultChangedValues;
		},

		/**
		 * identify the valid property To set default value. Check condition based on changed property
		 * @param {oDefaultItem}
		 * @param sPath
		 * @param sChangedProperty
		 */
		_findDefaultPropertyValues: function (oDefaultItem, sPath, sChangedProperty) {
			if (sChangedProperty && sChangedProperty !== "") {
				if (sChangedProperty && oDefaultItem.PropertyName !== sChangedProperty.split("id")[1]) {
					this._getfilterDataAndSetProperty(oDefaultItem, sPath);
				}
			} else {
				this._getfilterDataAndSetProperty(oDefaultItem, sPath);
			}
		},

		/*
		 * method to validate the properties with default properties
		 * if default properties exist, it will call backend for default value of the specific properties
		 * @param aDefaultValues
		 * @param sPath
		 */
		_getfilterDataAndSetProperty: function (aDefaultValues, sPath) {
			//get ValueIn for properties
			var sPropInValues = this._getValueForParameterProperties(aDefaultValues, sPath);
			if (sPropInValues) {
				var oFilter = new Filter({
					filters: [
						new Filter("EntityName", FilterOperator.EQ, aDefaultValues.EntityName),
						new Filter("PropertyName", FilterOperator.EQ, aDefaultValues.PropertyName),
						new Filter("ValueIn", FilterOperator.EQ, sPropInValues)
					],
					and: true
				});
				this._getPropertyDefaultValue(oFilter, sPath);
			} else if (aDefaultValues.ReturnValue && aDefaultValues.ReturnValue !== "") {
				// If direct default values
				this._setDefaultValuesToField(aDefaultValues, sPath);
			}

		},

		/*
		 *Fetch dependent property values from resepective context or parent context
		 * @param {oaDefaultValue}
		 * @param sPath
		 * @returnParam sProp
		 */
		_getValueForParameterProperties: function (oaDefaultValue, sPath) {
			var sSeparator = oaDefaultValue.Separator,
				aPropertityIn = oaDefaultValue.PropertyIn.split(sSeparator),
				sProp;
			aPropertityIn.forEach(function (aProperty) {
				var sPropertyEntity = aProperty.split("~")[0],
					sPropertySel = aProperty.split("~")[1],
					sPropValue;
				if (sPath.split("Set")[0].toUpperCase().split("/")[1] === sPropertyEntity) {
					sPropValue = this.getModel().getProperty(sPath + "/" + sPropertySel);
				} else if (this.getView().getParent().getParent().getBindingContext()) {
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
		 * @param {oFilter}
		 * @param sPath
		 */
		_getPropertyDefaultValue: function (oFilter, sPath) {
			new Promise(function (resolve) {
				this.getOwnerComponent().readData("/PropertyValueDeterminationSet", [oFilter]).then(function (oData) {
					resolve(oData.results[0]);
					if (oData.results) {
						this._setDefaultValuesToField(oData.results[0], sPath);
					}
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Set default values to propertie based on field type
		 * @param {oResult}
		 * @param sPath
		 */
		_setDefaultValuesToField: function (oResult, sPath) {
			var oSmartForm = this.aSmartForms.length ? this.aSmartForms : this._aSmartForms;
			var oField = this.getFormFieldByName("id" + oResult.PropertyName, oSmartForm);
			if (oField) {
				this._fieldBasedConvertion(oField, oResult, sPath);
			} else {
				//for valuelist parameter properties
				this.getModel().setProperty(sPath + "/" + oResult.PropertyName, oResult.ReturnValue);
			}
		},

		/**
		 * Method to differentiate based on feild type and format data
		 * Specially for date and time field 
		 * Convert string to date object and milliseconds
		 * @param oField
		 * @param oDefaultData
		 * @param sPath
		 */
		_fieldBasedConvertion: function (oField, oDefaultData, sPath) {
			if (oField.getDataProperty().property.type === "Edm.DateTime") {
				if (!isNaN(oDefaultData.ReturnValue) && oDefaultData.ReturnValue.length === 8) {
					this.getModel().setProperty(sPath + "/" + oDefaultData.PropertyName, this._convertionStringToDateObject(oDefaultData.ReturnValue));
				}
			} else
			if (oField.getDataProperty().property.type === "Edm.Time") {
				if (!isNaN(oDefaultData.ReturnValue) && oDefaultData.ReturnValue.length === 6) {
					this.getModel().setProperty(sPath + "/" + oDefaultData.PropertyName, {
						ms: this._convertionStringToMilliseconds(oDefaultData.ReturnValue),
						__edmType: "Edm.Time"
					});
				}
			} else {
				this.getModel().setProperty(sPath + "/" + oDefaultData.PropertyName, oDefaultData.ReturnValue);
				oField.fireChange({
					newValue: oDefaultData.ReturnValue
				});
			}
		},

		/**
		 * Convert string values to year, month and day 
		 * Convert value into the date object
		 * @param sTime
		 */
		_convertionStringToDateObject: function (sDate) {
			var iYear = parseInt(sDate.slice(0, 4), 10),
				iMnt = parseInt(sDate.slice(4, 6), 10) - 1,
				iDay = parseInt(sDate.slice(6, 8), 10);

			var now = new Date(iYear, iMnt, iDay),
				offset = -(now.getTimezoneOffset() * 60 * 1000), // now in milliseconds
				userUnixStamp = +now + offset;

			return new Date(userUnixStamp);
		},

		/**
		 * Convert string values to hrs, min and sec 
		 * Convert value into the Milliseconds
		 * @param sTime
		 */
		_convertionStringToMilliseconds: function (sTime) {
			var iHrs = parseInt(sTime.slice(0, 2), 10),
				iMnt = parseInt(sTime.slice(2, 4), 10),
				iSec = parseInt(sTime.slice(4, 6), 10);

			return (((iHrs * 60 * 60) + (iMnt * 60) + iSec)) * 1000;
		}
	});
});