sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/TableController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
<<<<<<< HEAD
	 "sap/ui/core/mvc/OverrideExecution"
], function (TableController, Filter, FilterOperator, OverrideExecution) {
=======
	"sap/ui/core/Fragment"
], function (TableController, Filter, FilterOperator, Fragment) {
>>>>>>> refs/remotes/origin/develop
	"use strict";

	return TableController.extend("com.evorait.evosuite.evonotify.controller.FormController", {
		
		metadata: {
			methods: {
				getAllSmartForms: {
					public: true,
					final: true
				},
				getAllSmartFormGroups: {
					public: true,
					final: true
				},
				setFormsEditable: {
					public: true,
					final: true
				},
				onPressEdit: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onPressSave: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Before
				},
				onPressSmartField: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressObjectStatus: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				cancelFormHandling: {
					public: true,
					final: true
				},
				confirmEditCancelDialog: {
					public: true,
					final: true
				},
				validateForm: {
					public: true,
					final: true
				},
				getBatchChangeResponse: {
					public: true,
					final: true
				},
				getFormFieldByName: {
					public: true,
					final: true
				},
				showSuccessMessage: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				checkDefaultValues: {
					public: true,
					final: true
				},
				checkDefaultPropertiesWithValues: {
					public: true,
					final: true
				}
			}	
		},

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
		 * loop through collection of selected table items 
		 * and set delete property
		 * @param aSelected
		 * @param successFn
		 * @param errorFn
		 */
		deleteEntries: function (aSelected, oTable) {
			return new Promise(function (resolve) {
				var oModel = this.getModel();
				oModel.setRefreshAfterChange(false);
				aSelected.forEach(function (oItem) {
					var oContext = oItem.getBindingContext();
					if (oContext) {
						oModel.setProperty(oContext.getPath() + "/DELETION_INDICATOR", "X");
					}
				});
				this.saveChanges({
					state: "success"
				}, function () {
					oModel.setRefreshAfterChange(true);
					this.showMessageToast(this.getResourceBundle().getText("msg.saveSuccess"));
					if (oTable) {
						oTable.rebindTable();
					}
					resolve();
				}.bind(this), null, oTable);
			}.bind(this));
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
						if (oResponse.__batchResponses) {
							var responses = oResponse.__batchResponses[0].response || oResponse.__batchResponses[0].__changeResponses[0];
							var sStatusCode = parseInt(responses.statusCode, 10);

							if (!isNaN(sStatusCode) && sStatusCode < 300) {
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
		 * get only one selected item context
		 * when multiple items in table was selected then show message
		 * @param oSmartTable
		 */
		getSingleSelectAndOpenEditDialog: function (oSmartTable, mParams, callback) {
			var aSelected = oSmartTable.getTable().getSelectedItems(),
				msg = this.getModel("i18n").getResourceBundle().getText("msg.itemSelectAtLeast");

			if (aSelected.length > 1 || aSelected.length === 0) {
				this.showMessageToast(msg);
				return;
			}
			var oSelectedContext = aSelected[0].getBindingContext();
			if (oSelectedContext) {
				mParams.sPath = oSelectedContext.getPath();
				this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
				oSmartTable.getTable().removeSelections(true);
				if (callback) {
					callback();
				}
			} else {
				this.showMessageToast(msg);
			}
		},

		/**
		 * show ActionSheet of Task system status buttons
		 * @param oEvent
		 * @param oSmartTable
		 */
		onPressTaskStatusShowList: function (oEvent, oSmartTable) {
			var aSelected = oSmartTable.getTable().getSelectedItems(),
				msg = this.getView().getModel("i18n").getResourceBundle().getText("msg.itemSelectAtLeast");

			if (aSelected.length > 1 || aSelected.length === 0) {
				this.showMessageToast(msg);
				return;
			}
			var oSelectedContext = aSelected[0].getBindingContext();
			if (oSelectedContext) {
				var oButton = oEvent.getSource();
				// create action sheet only once
				if (!this._actionSheetTaskSystemStatus) {
					Fragment.load({
						name: "com.evorait.evosuite.evonotify.view.fragments.ActionSheetTaskSystemStatus",
						controller: this,
						type: "XML"
					}).then(function (oFragment) {
						this._actionSheetTaskSystemStatus = oFragment;
						this.getView().addDependent(oFragment);
						this._actionSheetTaskSystemStatus.addStyleClass(this.getModel("viewModel").getProperty("/densityClass"));
						this._actionSheetTaskSystemStatus.openBy(oButton);
					}.bind(this));
				} else {
					this._actionSheetTaskSystemStatus.openBy(oButton);
				}
			} else {
				this.showMessageToast(msg);
			}
		},

		/**
		 * submit task status change
		 * @param oItem
		 * @param oSmartTable
		 */
		changeTaskStatus: function (oItem, oSmartTable) {
			var aSelected = oSmartTable.getTable().getSelectedItems(),
				oSelectedContext = aSelected[0].getBindingContext(),
				oData = oSelectedContext.getObject(),
				sPath = oSelectedContext.getPath(),
				sFunctionKey = oItem.getKey(),
				message = "";

			var successFn = function () {
				this.showMessageToast(this.getResourceBundle().getText("msg.saveSuccess"));
			};
			var errorFn = function () {
				this.getModel().resetChanges([sPath]);
			};

			if (oData["ALLOW_" + sFunctionKey]) {
				this.getModel("viewModel").setProperty("/isStatusUpdate", true);
				this.getModel().setProperty(sPath + "/FUNCTION", sFunctionKey);
				this.saveChanges({
					state: "success"
				}, successFn.bind(this), errorFn.bind(this), this.getView());

				oSmartTable.getTable().removeSelections(true);
				this.getModel("viewModel").setProperty("/singleSelectedTask", false);
				this.oStatusSelectControl.setEnabled(false);
			} else {
				message = this.getResourceBundle().getText("msg.notificationSubmitFail", oData.NOTIFICATION_NO);
				this.showInformationDialog(message);
			}
		},

		/*
		 * Get valid entity type name 
		 * @parm sEntitySet
		 * @param sPath
		 * @parm sChangedProperty
		 */
		checkDefaultValues: function (sEntitySet, sPath, sChangedProperty) {
			var oModel = this.getModel();
			oModel.getMetaModel().loaded().then(function () {
				var oMetaModel = oModel.getMetaModel() || oModel.getProperty("/metaModel"),
					oEntitySet = oMetaModel.getODataEntitySet(sEntitySet),
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);

				if (sChangedProperty) {
					//sChangedProperty is came from field name it's concated with id
					sChangedProperty = sChangedProperty.split("id")[1];
				}

				this.checkDefaultPropertiesWithValues(oEntityType, sPath, sChangedProperty, oMetaModel);

			}.bind(this));
		},

		/*
		 * Get Properties from the default information model
		 * Validates for the change or initial binding
		 * @param {oEntityType}
		 * @param sPath
		 * @param sChangedProperty
		 * @param {oMetaModel}
		 */
		checkDefaultPropertiesWithValues: function (oEntityType, sPath, sChangedProperty, oMetaModel) {
			var aDefaultValues = this.getModel("DefaultInformationModel").getProperty("/defaultProperties");
			if (!aDefaultValues) {
				aDefaultValues = [];
			}

			//check changed property and get dependent properties to add default values
			if (sChangedProperty) {
				aDefaultValues = this._checkForDefaultProperties(aDefaultValues, oEntityType.name, sChangedProperty);
			}

			aDefaultValues.forEach(function (oItem) {
				// It process only selected entityset properties
				if (oEntityType.name === oItem.EntityName) {
					this._findDefaultPropertyValues(oItem, sPath, sChangedProperty, oMetaModel, oEntityType);
				}
			}.bind(this));
		},
		
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

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
		 * to check other default properties when dependent on value is changed and which are dependent on changed value
		 * Create a new array of properties which can be depends on changed property
		 * @param aDefaultValues - array of default value properties
		 * @param sEntityType - Which entity we are going to change
		 * @param sChangedProperty - Which property is changed.
		 * @rerurn [aDefaultChangedValues] -Array of default properties to be change
		 */
		_checkForDefaultProperties: function (aDefaultValues, sEntityType, sChangedProperty) {
			var aDefaultChangedValues = [];
			aDefaultValues.forEach(function (aDefValue) {
				var bValidate = false;
				var sSeparator = aDefValue.Separator,
					aPropertityIn = aDefValue.PropertyIn.split(sSeparator);
				if (aPropertityIn && aPropertityIn !== "" && aDefValue.EntityName === sEntityType) {
					aPropertityIn.forEach(function (aProperty) {
						var sPropertySel = aProperty.split("~")[1];
						if (sPropertySel !== "" && sPropertySel === sChangedProperty) {
							bValidate = true;
							// if bValidate true means some other properties are depends on changed property value
						}
					}.bind(this));
				}
				if (bValidate) {
					aDefaultChangedValues.push(aDefValue);
				}
			}.bind(this));

			return aDefaultChangedValues;
		},

		/**
		 * identify the valid property to set default value. Check condition based on changed property
		 * @param {oDefaultItem}
		 * @param sPath
		 * @param sChangedProperty
		 * @param {oMetaModel}
		 * @param {oEntityType}
		 */
		_findDefaultPropertyValues: function (oDefaultItem, sPath, sChangedProperty, oMetaModel, oEntityType) {
			if (sChangedProperty && sChangedProperty !== "") {
				if (sChangedProperty && oDefaultItem.PropertyName !== sChangedProperty) {
					this._getFilterDataAndSetProperty(oDefaultItem, sPath, oMetaModel, oEntityType);
				}
			} else {
				this._getFilterDataAndSetProperty(oDefaultItem, sPath, oMetaModel, oEntityType);
			}
		},

		/*
		 * method to validate the properties with default properties
		 * if default properties exist, it will call backend for default value of the specific properties
		 * @param {oDefaultValues}
		 * @param sPath
		 * @param {oMetaModel}
		 * @param {oEntityType}
		 */
		_getFilterDataAndSetProperty: function (oDefaultValue, sPath, oMetaModel, oEntityType) {
			//get ValueIn for properties
			var sPropInValues;
			if (oDefaultValue.PropertyIn !== "") {
				sPropInValues = this._getValueForParameterProperties(oDefaultValue, sPath, oEntityType, oMetaModel);
			}
			if (sPropInValues) {
				var oFilter = new Filter({
					filters: [
						new Filter("EntityName", FilterOperator.EQ, oDefaultValue.EntityName),
						new Filter("PropertyName", FilterOperator.EQ, oDefaultValue.PropertyName),
						new Filter("ValueIn", FilterOperator.EQ, sPropInValues)
					],
					and: true
				});
				this.getOwnerComponent().readData("/PropertyValueDeterminationSet", [oFilter]).then(function (oData) {
					if (oData.results && oData.results.length) {
						this._setDefaultValuesToField(oData.results[0], sPath, oMetaModel, oEntityType);
					}
				}.bind(this));

			} else if (oDefaultValue.ReturnValue && oDefaultValue.ReturnValue !== "") {
				// If direct default values
				this._setDefaultValuesToField(oDefaultValue, sPath, oMetaModel, oEntityType);
			}

		},

		/*
		 *Fetch dependent property values from resepective context or parent context
		 * @param {oDefaultValue}
		 * @param sPath
		 * @param {oEntityType}
		 * @param {oMetaModel}
		 * @returnParam sProp
		 */
		_getValueForParameterProperties: function (oDefaultValue, sPath, oEntityType, oMetaModel) {
			var sSeparator = oDefaultValue.Separator,
				aPropertityIn = oDefaultValue.PropertyIn.split(sSeparator),
				sProp = undefined;

			aPropertityIn.forEach(function (aProperty) {
				var sPropertyEntity = aProperty.split("~")[0],
					sPropertySel = aProperty.split("~")[1],
					sPropValue;
				if (oEntityType.name.toUpperCase() === sPropertyEntity) { // same entitySet
					sPropValue = this.getModel().getProperty(sPath + "/" + sPropertySel);
				} else if (this.getView().getParent().getParent().getBindingContext()) { //parent entity set
					sPropValue = this._getParentContextData(sPropertySel, sPropertyEntity, oMetaModel);
				}

				sPropValue = sPropValue ? sPropValue : "";
				if (typeof sProp === "undefined") {
					sProp = sPropValue;
				} else {
					sProp += sSeparator + sPropValue;
				}
			}.bind(this));
			return sProp;
		},

		/*
		 * To check parent context and get values for the parent properties
		 * @param sPropertySel
		 * @param sPropertyEntity
		 * @param {oMetaModel}
		 * @returnParam sPropVal
		 */
		_getParentContextData: function (sPropertySel, sPropertyEntity, oMetaModel) {
			var sPropVal;
			var oParentContext = this.getView().getParent().getParent().getBindingContext(),
				sParentPath = oParentContext.getPath();
			var oParentEntitySet = oMetaModel.getODataEntitySet(sParentPath.split("(")[0].split("/")[1]),
				oParentEntityType = oMetaModel.getODataEntityType(oParentEntitySet.entityType);

			if (oParentEntityType && oParentEntityType.name.toUpperCase() === sPropertyEntity) {
				var oParentData = oParentContext.getObject();
				sPropVal = oParentData[sPropertySel];
			}
			return sPropVal;
		},

		/**
		 * Set default values to propertie based on field type
		 * @param {oDefaultData}
		 * @param sPath
		 * @param {oMetaModel}
		 * @param {oEntityType}
		 */
		_setDefaultValuesToField: function (oDefaultData, sPath, oMetaModel, oEntityType) {
			var oField = oMetaModel.getODataProperty(oEntityType, oDefaultData.PropertyName);
			if (oField) {
				if (oField.type === "Edm.DateTime") {
					if (!isNaN(oDefaultData.ReturnValue) && oDefaultData.ReturnValue.length === 8) {
						this.getModel().setProperty(sPath + "/" + oDefaultData.PropertyName, this._convertionStringToDateObject(oDefaultData.ReturnValue));
					}
				} else
				if (oField.type === "Edm.Time") {
					if (!isNaN(oDefaultData.ReturnValue) && oDefaultData.ReturnValue.length === 6) {
						this.getModel().setProperty(sPath + "/" + oDefaultData.PropertyName, {
							ms: this._convertionStringToMilliseconds(oDefaultData.ReturnValue),
							__edmType: "Edm.Time"
						});
					}
				} else {
					this.getModel().setProperty(sPath + "/" + oDefaultData.PropertyName, oDefaultData.ReturnValue);
					//For custom validations in onchange event 
					var oFieldChange = this.getFormFieldByName("id" + oDefaultData.PropertyName, this._aSmartForms);
					if (oFieldChange) {
						oFieldChange.fireChange({
							newValue: oDefaultData.ReturnValue
						});
					}
				}
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