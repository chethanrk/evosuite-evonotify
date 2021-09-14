sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/DialogFormController",
	"com/evorait/evosuite/evonotify/model/formatter"
], function (DialogFormController, formatter) {
	"use strict";

	return DialogFormController.extend("com.evorait.evosuite.evonotify.controller.AddEditEntry", {

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
		 * @param oEvent
		 */
		onChangeSmartField: function (oEvent) {
			var oSource = oEvent.getSource(),
				sFieldName = oSource.getName();
			var oContext = this.getView().getBindingContext();
			if (sFieldName) {
				if ((sFieldName === "idDAMAGE_CODE_GROUP" || sFieldName === "idDAMAGE_CODE") && this._selectedEntitySet ===
					"PMNotificationItemSet") {
					this._validateDamageCodeAndCodeGroup(oSource);
				}
				if (oEvent.getSource().getValueState() === "None" && this._type.add) {
					this._checkForDefaultProperties(oContext, this._selectedEntitySet, sFieldName);
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
				if (oFieldDamageCode.getValue() !== "" && oFieldDamageCodeGroup.getValue() === "") {
					this._custiomMandatorySmartFieldHandle(oFieldDamageCodeGroup, true);
				} else if (oFieldDamageCodeGroup.getValue() !== "" && oFieldDamageCode.getValue() === "") {
					this._custiomMandatorySmartFieldHandle(oFieldDamageCode, true);
				} else {
					this._custiomMandatorySmartFieldHandle(oFieldDamageCodeGroup, false);
					this._custiomMandatorySmartFieldHandle(oFieldDamageCode, false);
				}
			}
		},

		/**
		 * Handle Manadatory, nullable property and value state
		 * @param oFeild
		 * @param bValue
		 */
		_custiomMandatorySmartFieldHandle: function (oFeild, bValue) {
			oFeild.setMandatory(bValue);
			oFeild.getDataProperty().property.nullable = bValue ? "false" : "true";
			oFeild.setValueState("None");
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

					//prefill planning plant for add and split
					if (this._type.add) {
						this._setContextKeys();
						this._getNextSortNumber(this._setNewSortNumber.bind(this));
						this._checkForDefaultProperties(this._oContext, this._selectedEntitySet);
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