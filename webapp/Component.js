sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/evorait/evonotify/model/models",
	"com/evorait/evonotify/controller/ErrorHandler",
	"com/evorait/evonotify/controller/DialogTemplateRenderController",
	"com/evorait/evonotify/model/Constants",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/evorait/evonotify/assets/js/url-search-params.min",
	"com/evorait/evonotify/assets/js/promise-polyfills"
], function (UIComponent, Device, models, ErrorHandler, DialogTemplateRenderController, Constants, Filter,
	FilterOperator, UrlSearchPolyfill, PromisePolyfill) {
	"use strict";

	return UIComponent.extend("com.evorait.evonotify.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			var manifestApp = this.getMetadata().getManifestEntry("sap.app"),
				dataSource = "";

			// oModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			if (manifestApp) {
				dataSource = manifestApp.dataSources.mainService.uri;
			}

			this.DialogTemplateRenderer = new DialogTemplateRenderController(this);

			var viewModelObj = {
				busy: true,
				delay: 100,
				canExpand: true,
				serviceUrl: dataSource,
				editMode: false,
				isNew: false,
				operationsRowsCount: 0,
				launchMode: Constants.LAUNCH_MODE.BSP
			};

			this.setModel(models.createHelperModel(viewModelObj), "viewModel");

			this.setModel(models.createHelperModel({}), "templateProperties");

			this.setModel(models.createUserModel(this), "user");

			this.setModel(models.createInformationModel(this), "InformationModel");

			this._getSystemInformation();

			this._setApp2AppLinks();

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				var element = document.getElementsByTagName("body")[0];
				if (element.classList.contains("sapUiSizeCozy") || element.classList.contains("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!this._isMobile()) { // apply "compact" mode if touch is not supported
					//sapUiSizeCompact
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

		/**
		 * check if mobile device
		 * @returns {boolean}
		 * @private
		 */
		_isMobile: function () {
			return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent.toLowerCase());
		},

		/**
		 * Calls the GetSystemInformation 
		 */
		_getSystemInformation: function () {
			this.readData("/SystemInformationSet", []).then(function (oData) {
				this.getModel("user").setData(oData.results[0]);
			}.bind(this));
		},

		/**
		 * read app2app navigation links from backend
		 */
		_setApp2AppLinks: function () {
			if (sap.ushell && sap.ushell.Container) {
				this.getModel("viewModel").setProperty("/launchMode", Constants.LAUNCH_MODE.FIORI);
			}
			var oFilter = new Filter("LaunchMode", FilterOperator.EQ, this.getModel("viewModel").getProperty("/launchMode")),
				mProps = {};

			this.readData("/NavigationLinksSet", [oFilter])
				.then(function (data) {
					data.results.forEach(function (oItem) {
						if (oItem.Value1 && Constants.APPLICATION[oItem.ApplicationId]) {
							oItem.Property = oItem.Value2 || Constants.PROPERTY[oItem.ApplicationId];
							mProps[oItem.Property] = oItem;
						}
					}.bind(this));
					this.getModel("templateProperties").setProperty("/navLinks/", mProps);
				}.bind(this));
		},

		/**
		 *  Read call given entityset and filters
		 */
		readData: function (sUri, aFilters) {
			return new Promise(function (resolve, reject) {
				this.getModel().read(sUri, {
					filters: aFilters,
					success: function (oData, oResponse) {
						resolve(oData);
					}.bind(this),
					error: function (oError) {
						//Handle Error
						reject(oError);
					}.bind(this)
				});
			}.bind(this));
		}
	});
});