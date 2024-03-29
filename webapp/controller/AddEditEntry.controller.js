sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/DialogFormController",
	"com/evorait/evosuite/evonotify/model/formatter",
	"sap/ui/core/mvc/OverrideExecution"
], function (DialogFormController, formatter, OverrideExecution) {
	"use strict";

	return DialogFormController.extend("com.evorait.evosuite.evonotify.controller.AddEditEntry", {

		metadata: {
			methods: {
				onChangeSmartField: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				}
			}
		},

		_type: {
			add: false,
			edit: false
		},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/* =========================================================== */
		/* Events                                                      */
		/* =========================================================== */

		/**
		 * when SmartField value changed save it to storage 
		 * so that form will be offline capable
		 * 
		 * @param oEvent
		 */
		onChangeSmartField: function (oEvent) {
			DialogFormController.prototype.onChangeSmartField.apply(this, arguments);

			var oSource = oEvent.getSource(),
				sFieldName = oSource.getName();
			var oContext = this.getView().getBindingContext();
			if (sFieldName) {
				if ((sFieldName === "idDAMAGE_CODE_GROUP" || sFieldName === "idDAMAGE_CODE") && this._selectedEntitySet ===
					"PMNotificationItemSet") {
					this._validateDamageCodeAndCodeGroup(oSource);
				}
				if (oEvent.getSource().getValueState() === "None" && this._type.add) {
					this.checkDefaultValues(this._selectedEntitySet, oContext.getPath(), sFieldName);
				}
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * When Damage Code or Damage Code Group is filled
		 * then the other field is mandatory
		 * @param oSource
		 */
		_validateDamageCodeAndCodeGroup: function (oSource) {
			var oFieldDamageCode = null,
				oFieldDamageCodeGroup = null;

			if (oSource.getName() === "idDAMAGE_CODE_GROUP") {
				oFieldDamageCodeGroup = oSource;
				oFieldDamageCode = this.getFormFieldByName("idDAMAGE_CODE", this._aSmartForms);
			} else {
				oFieldDamageCode = oSource;
				oFieldDamageCodeGroup = this.getFormFieldByName("idDAMAGE_CODE_GROUP", this._aSmartForms);
			}

			if (oFieldDamageCodeGroup && oFieldDamageCode) {
				this._fieldValueValidation(oFieldDamageCodeGroup, oFieldDamageCode);
			}
		},

		/**
		 * Checks field value for Damage Code and Damage Code Group
		 * @param oDamageCodeGroup
		 * @param oDamageCode
		 */
		_fieldValueValidation: function (oDamageCodeGroup, oDamageCode) {
			if (oDamageCode.getValue() !== "" && oDamageCodeGroup.getValue() === "") {
				this._customMandatorySmartFieldHandle(oDamageCodeGroup, true);
			} else if (oDamageCodeGroup.getValue() !== "" && oDamageCode.getValue() === "") {
				this._customMandatorySmartFieldHandle(oDamageCode, true);
			} else {
				this._customMandatorySmartFieldHandle(oDamageCodeGroup, false);
				this._customMandatorySmartFieldHandle(oDamageCode, false);
			}
		},

		/**
		 * Handle Manadatory, nullable property and value state
		 * @param oField
		 * @param bValue
		 */
		_customMandatorySmartFieldHandle: function (oField, bValue) {
			oField.setMandatory(bValue);
			oField.getDataProperty().property.nullable = bValue ? "false" : "true";
			oField.setValueState("None");
		},

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
					this._oDialog.setContentWidth("100%");

					//Load all defaulting values and prefill form
					if (this._type.add) {
						this._setContextKeys();
						this._getNextSortNumber(this._setNewSortNumber.bind(this));
						if (this._oContext) {
							var sPath = this._oContext.getPath();
							//Apply defaulting values
							this.checkDefaultValues(this._selectedEntitySet, sPath).then(function () {
								//Next Step set changed SmartField data from offline storage after refresh page
								this.setFormStorage2FieldData(sPath);
							}.bind(this));
						}
					}
				}
			}
		},

		/**
		 * prefill Plant from header
		 * prefill WorkOrder from header
		 * prefill ReservationNumber from header
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
		 * get the next Item sorting number
		 * and count one upwards
		 */
		_getNextSortNumber: function (callbackFn) {
			var sParentPath = this._oParentContext.getPath();

			this.getModel().read(sParentPath + this._mParams.sNavTo, {
				sorters: [new sap.ui.model.Sorter(this._mParams.sSortField, "DESCENDING")],
				success: function (items) {
					var sortNo = "";
					if (items.results.length > 0) {
						sortNo = items.results[0][this._mParams.sSortField];
						sortNo = parseInt(sortNo) || 0;
						sortNo = (sortNo + 1);
						sortNo = formatter.formatSortNumber(sortNo.toString(), 4);
					} else {
						sortNo = "0001";
					}
					callbackFn(sortNo);
				}.bind(this),
				error: function (error) {
					//do nothing
				}
			});
		},

		/**
		 * Set sort number in the new context
		 */
		_setNewSortNumber: function (sSortNumber) {
			if (sSortNumber) {
				this.getModel().setProperty(this._sPath + "/" + this._mParams.sSortField, sSortNumber);
			}
		}
	});
});