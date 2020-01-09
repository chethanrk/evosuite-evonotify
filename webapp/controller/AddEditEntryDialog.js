sap.ui.define([
	"com/evorait/evonotify/controller/FormController",
	"com/evorait/evonotify/model/formatter",
	"sap/ui/core/Fragment"
], function (FormController, formatter, Fragment) {
	"use strict";
	return FormController.extend("com.evorait.evonotify.controller.AddEditEntryDialog", {

		formatter: formatter,

		/**
		 * open create entry dialog and load right fragment
		 * @param oView
		 * @param mParams
		 */
		open: function (oView, mParams, sFragmentName) {
			this._oView = oView;
			this._sFragmentName = sFragmentName;

			if (mParams.oContext) {
				this._oContext = mParams.oContext;
				this._oView.getModel("viewModel").setProperty("/isNewEntry", false);

			} else {
				this._oView.getModel("viewModel").setProperty("/isNewEntry", true);
				this._oContext = this._oView.getModel().createEntry(mParams.sSetPath);
				this._setContextKeys(mParams);
			}
			this._loadDialog();
		},

		/**
		 * cancel edit and close dialog
		 * @param oEvent
		 */
		onPressCancel: function (oEvent) {
			if (this._oView.getModel("viewModel").getProperty("/isNewEntry")) {
				this._oView.getModel().deleteCreatedEntry(this._oContext);
			}
			this._closeDialog();
		},

		/**
		 * submit new entry
		 * @param oEvent
		 */
		onPressSave: function (oEvent) {
			var oDialogContent = this._oDialog.getContent();

			if (oDialogContent && oDialogContent.length > 0 && (oDialogContent[0] instanceof sap.ui.comp.smartform.SmartForm)) {
				if (this.validateForm({
						view: this._oView,
						form: oDialogContent[0]
					})) {

					if (this._oView.getModel("viewModel").getProperty("/isNewEntry")) {
						this.saveNewEntry({
							view: this._oView,
							success: this._closeDialog.bind(this)
						});
					} else {
						this.saveChangedEntry({
							view: this._oView,
							success: this._closeDialog.bind(this)
						});
					}

				}
			}
		},

		/*
		 * init dialog with right fragment name
		 * and set context to the view
		 * @returns {sap.ui.core.Control|sap.ui.core.Control[]}
		 * @private
		 */
		_loadDialog: function () {
			var setFragmentDetails = function (_this) {
				_this._oDialog.bindElement(_this._oContext.getPath());

				_this._oView.addDependent(_this._oDialog);
				_this._oDialog.open();
			};

			if (!this._oDialog) {
				Fragment.load({
					name: "com.evorait.evonotify.view.fragments." + this._sFragmentName,
					controller: this,
					type: "XML"
				}).then(function (oFragment) {
					this._oDialog = oFragment;
					setFragmentDetails(this);
				}.bind(this));
			} else {
				setFragmentDetails(this);
			}
		},

		/*
		 * set context dependencies
		 * @param mParams
		 * @private
		 */
		_setContextKeys: function (mParams) {
			if (mParams.mKeys) {
				var sPath = this._oContext.getPath();

				Object.keys(mParams.mKeys).forEach(function (key) {
					this._oView.getModel().setProperty(sPath + "/" + key, mParams.mKeys[key]);
				}.bind(this));
			}
		},

		/*
		 * reset all global variables and destroy dialog view
		 * @private
		 */
		_closeDialog: function () {
			this._oDialog.close();

			this._oView = null;
			this._sFragmentName = null;
			this._oContext = null;

			this._oDialog.destroy(true);
			this._oDialog = null;
		}

	});
});