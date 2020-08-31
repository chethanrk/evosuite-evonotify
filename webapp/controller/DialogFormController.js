sap.ui.define([
	"com/evorait/evonotify/controller/FormController"
], function (FormController) {
	"use strict";

	return FormController.extend("com.evorait.evonotify.controller.DialogFormController", {

		oTemplateModel: null,

		_oDialog: null,

		_oForm: null,

		_oContext: null,

		_sPath: null,

		_mParams: {},

		_type: {},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * worklist on init
		 */
		onInit: function () {
			this.oTemplateModel = this.getModel("templateProperties");

			//SmartForm is editable
			this._oForm = this.getView().byId("smartFormTemplate");
			this._oForm.setEditable(true);

			var eventBus = sap.ui.getCore().getEventBus();
			//Binnding has changed in TemplateRenderController.js
			eventBus.subscribe("TemplateRendererEvoNotify", "changedBinding", this._changedBinding, this);
		},

		/**
		 * life cycle event before view rendering
		 */
		onBeforeRendering: function () {},

		/**
		 * life cycle event after view rendering
		 */
		onAfterRendering: function () {},

		/**
		 * life cycle event for view destroy
		 */
		onExit: function () {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("TemplateRendererEvoNotify", "changedBinding");
		},

		/* =========================================================== */
		/* Events                                                      */
		/* =========================================================== */

		/**
		 * @param oEvent
		 */
		onChangeSmartField: function (oEvent) {},

		/* =========================================================== */
		/* internal methods                                              */
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
				var sViewId = this.getView().getId(),
					sViewName = this.getView().getViewName();
				this._sViewNameId = sViewName + "#" + sViewId;
			}
		},

		/**
		 * Set all controller globals information for dialog
		 * like context and dialog control
		 */
		_getDefaultGlobalParameters: function () {
			//get new binding context
			this._oContext = this.getView().getBindingContext();
			if (!this._oContext) {
				return;
			}
			this._sPath = this._oContext.getPath();

			//global parameters
			this._mParams = this.oTemplateModel.getData();
			//is it add, edit, copy or split
			for (var key in this._type) {
				this._type[key] = key === this._mParams.type;
			}
			//get dialog control
			this._oDialog = this.getView().getParent();
			this._oDialog.setContentWidth("auto");

			this._oParentContext = this.getView().getParent().getParent().getBindingContext();
			this._oParentObject = null;
			if (this._oParentContext) {
				this._oParentObject = this._oParentContext.getObject();
			}

		},

		/**
		 * replace (example: OperationSortNumber) valueHelper with a Select control
		 * CAUSE: Prefiltering operation dropdown is not supported by annotations
		 */
		_replaceFieldWithSelect: function (sFieldName, mParams) {
			var oField = this.getFormFieldByName(sFieldName, this._oForm);
			if (oField) {
				this.replaceSmartFieldWithDropdown(oField, this._sViewNameId + sFieldName, mParams, this.onChangeSmartField.bind(this));
			}
		},

		/**
		 * Add a new group element inside of a specific SmartForm Group
		 * with a given control
		 * @param oGroup
		 * @param oControl
		 * @param sLabel
		 * @param idx
		 */
		_addNewGroupElement: function (oGroup, oControl, sLabel, idx) {
			var oNewGroupElement = new sap.ui.comp.smartform.GroupElement({
				label: sLabel ? this.getResourceBundle().getText(sLabel) : ""
			});
			oNewGroupElement.addElement(oControl);
			oGroup.insertGroupElement(oNewGroupElement, (idx || 100));
		}

	});
});