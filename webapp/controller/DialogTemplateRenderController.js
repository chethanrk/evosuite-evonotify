sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/TemplateRenderController",
	"sap/ui/core/Fragment"
], function (TemplateRenderController, Fragment) {
	"use strict";

	return TemplateRenderController.extend("com.evorait.evosuite.evonotify.controller.DialogTemplateRenderController", {

		metadata: {
			methods: {
				constructor: {
					public: true,
					final: true
				},
				open: {
					public: true,
					final: true
				},
				onPressClose: {
					public: true,
					final: true
				},
				onPressSave: {
					public: true,
					final: true
				}
			}
		},

		_oHelperModel: null,

		_oDialog: null,

		_oResourceBundle: null,

		_oView: null,

		_oModel: null,

		_mParams: {},

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
			this._oViewController = oView.getController();
			this._oResourceBundle = this._oViewController.getOwnerComponent().getModel("i18n").getResourceBundle();
			this._mParams = mParams;
			this._oSmartTable = mParams.smartTable;

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
			if (this._isNew) {
				this._oModel.deleteCreatedEntry(this._oContext);
			}
			this._oModel.resetChanges();
			this._oDialog.close();
			this._oViewController.deleteExpiredStorage(this._mParams.viewName);
		},

		/**
		 * Save SmartForm
		 * @param oEvent
		 */
		onPressSave: function (oEvent) {
			var oContentView = this._oDialog.getContent()[0],
				oViewController = oContentView.getController(),
				aForms = oViewController.getAllSmartForms(oContentView.getControlsByFieldGroupId("smartFormTemplate"));

			if (aForms.length > 0 && oViewController.validateForm) {
				var mErrors = oViewController.validateForm(aForms);
				this._oModel.setRefreshAfterChange(false);
				//if form is valid save created entry
				oViewController.saveChanges(mErrors, this._saveSuccessFn.bind(this), this._saveErrorFn.bind(this), this._oDialog);
			} else {
				//todo show message
			}
		},

		onExit: function () {
			TemplateRenderController.prototype.onExit.apply(this, arguments);
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
					name: "com.evorait.evosuite.evonotify.view.fragments.FormDialog",
					controller: this,
					type: "XML"
				}).then(function (oFragment) {
					this._oDialog = oFragment;
					this._oDialog.addStyleClass(this._oView.getModel("viewModel").getProperty("/densityClass"));
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
			var sPath = this.getEntityPath(this._mParams.entitySet, this._mParams.pathParams, this._oView, this._mParams.sPath);

			this._oDialog.setBusy(true);
			this._oDialog.unbindElement();
			this._oDialog.bindElement(sPath);
			this._oDialog.setTitle(this._oResourceBundle.getText(this._mParams.title));
			this._oView.addDependent(this._oDialog);

			this._oModel.metadataLoaded().then(function () {
				//set dialog title from the annotations
				this._setDialogTitleByAnnotation();

				//get template and create views
				this._mParams.oView = this._oView;
				this.insertTemplateFragment(sPath, this._mParams.viewName, "FormDialogWrapper", this._afterBindSuccess.bind(this), this._mParams);
			}.bind(this));

			this._oDialog.open();
		},

		/**
		 * To set title of the dialog from the annotation path
		 */
		_setDialogTitleByAnnotation: function () {
			var oMetaModel = this._oModel.getMetaModel() || this._oModel.getProperty("/metaModel"),
				oEntitySet = oMetaModel.getODataEntitySet(this._mParams.entitySet),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
				oAnnotations = oEntityType[this._mParams.annotationPath];

			if (oAnnotations.length) {
				if (oAnnotations[0].RecordType === "com.sap.vocabularies.UI.v1.CollectionFacet") {
					var oLabelAnnotation = oAnnotations[0]["com.sap.vocabularies.Common.v1.Label"];
					if (oLabelAnnotation) {
						this._oDialog.setTitle(oLabelAnnotation.String);
					}
				}
			}
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
			this._oDialog.close();
			this._oModel.setRefreshAfterChange(true);
			this._oViewController.deleteExpiredStorage(this._mParams.viewName);

			var responseCode = oResponse.__batchResponses[0].__changeResponses;
			if (responseCode) {
				if (responseCode[0].statusCode === "200" || responseCode[0].statusCode === "201" || responseCode[0].statusCode === "204") {
					this.showMessageToast(this._oResourceBundle.getText("msg.saveSuccess"));
					if (this._oSmartTable) {
						this._oSmartTable.rebindTable();
					}
				}
			}
		},

		/**
		 * Saving failed
		 * do further things after save
		 * @param oError
		 */
		_saveErrorFn: function (oError) {
			this._oModel.setRefreshAfterChange(true);
			this._oViewController.deleteExpiredStorage(this._mParams.viewName);
		}

	});
});