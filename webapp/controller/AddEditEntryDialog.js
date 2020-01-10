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
			this._oResourceBundle = this._oView.getModel("i18n").getResourceBundle();

			if (mParams.oContext) {
				this._oContext = mParams.oContext;
				this._oView.getModel("viewModel").setProperty("/isNewEntry", false);
				this._oView.getModel("viewModel").setProperty("/addEditEntryTitle", this._oResourceBundle.getText("tit.change" + sFragmentName));

			} else {
				this._oView.getModel("viewModel").setProperty("/isNewEntry", true);
				this._oView.getModel("viewModel").setProperty("/addEditEntryTitle", this._oResourceBundle.getText("tit.new" + sFragmentName));
				this._oContext = this._oView.getModel().createEntry(mParams.sSetPath);
				this.getNextSortNumber(this._oView, mParams, this._setNewSortNumber.bind(this));
				this._setContextKeys(mParams);
			}
			this._loadDialog();
		},
		
		/**
		 * Set Operation sort number in the new context
		 */
		_setNewSortNumber: function (sSortNumber, oParameters) {
			if (sSortNumber) {
				this._oView.getModel().setProperty(this._oContext.sPath + "/" + oParameters.sSortField, sSortNumber);
			}
		},
		
		/**
		* get the next Item sorting number
		* and count one upwards
		*/
		getNextSortNumber: function (oView, oParameters, callbackFn) {
			var oModel = oView.getModel(),
				sPath = oView.getBindingContext().sPath;
			oModel.read(sPath+oParameters.sNavTo, {
				sorters: [new sap.ui.model.Sorter(oParameters.sSortField, "DESCENDING")],
				success: function (items) {
					var sortNo = "";
					if (items.results.length > 0) {
						sortNo = items.results[0][oParameters.sSortField];
						sortNo = parseInt(sortNo) || 0;
						sortNo = (sortNo + 1);
						sortNo = formatter.formatSortNumber(sortNo.toString(), 4);
					} else {
						sortNo = "0001";
					}
					//oModel.setProperty(oParameters.sSetPath + oParameters.sSortField, sortNo);
					callbackFn(sortNo, oParameters);
				},
				error: function (error) {
					//do nothing
				}
			});
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
			this._oDialog.setBusy(true);
			
			if (oDialogContent && oDialogContent.length > 0 && (oDialogContent[0] instanceof sap.ui.comp.smartform.SmartForm)) {
				if (this.validateForm({
						view: this._oView,
						form: oDialogContent[0]
					})) {

					if (this._oView.getModel("viewModel").getProperty("/isNewEntry")) {
						this.saveNewEntry({
							context:this,
							view: this._oView,
							success: function(){
								this.context._oDialog.setBusy(false);
								this.context._closeDialog();
							},
							error:function(){
								this.context._oDialog.setBusy(false);
							}
						});
					} else {
						this.saveChangedEntry({
							context:this,
							view: this._oView,
							success: function(){
								this.context._oDialog.setBusy(false);
								this.context._closeDialog();
							},
							error:function(){
								this.context._oDialog.setBusy(false);
							}
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