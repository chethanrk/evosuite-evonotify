sap.ui.define([
	"com/evorait/evonotify/controller/TemplateRenderController",
	"sap/ui/core/Fragment"
], function (TemplateRenderController, Fragment) {
	"use strict";

	return TemplateRenderController.extend("com.evorait.evonotify.controller.FormDialogController", {

		_oHelperModel: null,

		_oDialog: null,

		_oResourceBundle: null,

		_oView: null,

		_bIsEdit: false,

		_oModel: null,

		_mParams: {},

		_oContext: null,

		/**
		 * overwrite constructor
		 * set manuel owner component for nested xml views
		 */
		constructor: function (oComponent) {
			this.setOwnerComponent(oComponent);
			TemplateRenderController.apply(this, arguments);
		},

		/**
		 * open dialog 
		 * and render annotation based SmartForm inside dialog content
		 */
		open: function (oView, mParams) {
			this._oView = oView;
			this._oModel = oView.getModel();
			this._oResourceBundle = oView.getController().getOwnerComponent().getModel("i18n").getResourceBundle();
			this._mParams = mParams;

			//set annotation path and other parameters
			this.setTemplateProperties(mParams);

			this._loadDialog();
		},

		/**
		 * load dialog fragment
		 * or get bacl already loaded dialog fragment
		 * @param oEvent
		 */
		onPressClose: function (oEvent) {
			if (this._bIsEdit) {
				this._oModel.deleteCreatedEntry(this._oContext);
			}
			this._oModel.resetChanges();
			this._oDialog.close();
		},

		/**
		 * Save SmartForm
		 * @param oEvent
		 */
		onPressSave: function (oEvent) {
			var oContentView = this._oDialog.getContent()[0],
				oViewController = oContentView.getController(),
				oForm = oContentView.byId("smartFormTemplate");

			if (oForm && oViewController.validateForm) {
				var mErrors = oViewController.validateForm(oForm);
				//if form is valid save created entry
				oViewController.saveChanges(mErrors, this._saveSuccessFn.bind(this), null, this._oDialog);
			} else {
				//todo show message
			}
		},

		onExit: function () {
			this._oDialog.destroy(true);
			this._oDialog = undefined;
		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		/*
		 * init dialog with right fragment name
		 * and set context to the view
		 * @returns {sap.ui.core.Control|sap.ui.core.Control[]}
		 * @private
		 */
		_loadDialog: function () {
			if (!this._oDialog) {
				Fragment.load({
					name: "com.evorait.evonotify.view.fragments.FormDialog",
					controller: this,
					type: "XML"
				}).then(function (oFragment) {
					this._oDialog = oFragment;
					this._setFragmentViewBinding();
				}.bind(this));
			} else {
				this._setFragmentViewBinding();
			}
		},

		/**
		 * load new template and set inside dialog
		 * Bind dialog view to generated path
		 */
		_setFragmentViewBinding: function () {
			this._oDialog.setBusy(true);
			this._oDialog.setTitle(this._oResourceBundle.getText(this._mParams.title));
			this._oView.addDependent(this._oDialog);

			this._oModel.metadataLoaded().then(function () {
				var sPath = this.getEntityPath(this._mParams.entitySet, this._mParams.pathParams, this._oView, this._mParams.sPath);
				this._oDialog.unbindElement();
				this._oDialog.bindElement(sPath);

				//get template and create views
				this._mParams.oView = this._oView;
				this.insertTemplateFragment(sPath, this._mParams.viewName, "FormDialogWrapper", this._afterBindSuccess.bind(this), this._mParams);
			}.bind(this));

			this._oDialog.open();
		},

		/**
		 * What should happen after binding changed
		 */
		_afterBindSuccess: function () {
			this._oDialog.setBusy(false);
		},

		/**
		 * Saving was successful
		 * do further things after save
		 * @param oResponse
		 */
		_saveSuccessFn: function (oResponse) {
			var oChangeData = this.getBatchChangeResponse(oResponse);
			if (oChangeData) {
				this._oModel.resetChanges();

				setTimeout(function () {
					this._oModel.refresh();
				}.bind(this), 1500);
			}
		},

	});
});