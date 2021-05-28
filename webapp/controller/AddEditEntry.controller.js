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
			var oContext = this.getView().getBindingContext();
			if (oEvent.getSource().getValueState() === "None" && this._type.add) {
				this._checkForDefaultProperties(oContext, this._selectedEntitySet);
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