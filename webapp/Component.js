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
	"com/evorait/evonotify/assets/js/promise-polyfills",
	"com/evorait/evonotify/controller/MessageManager"
], function (UIComponent, Device, models, ErrorHandler, DialogTemplateRenderController, Constants, Filter,
	FilterOperator, UrlSearchPolyfill, PromisePolyfill, MessageManager) {
	"use strict";
	
	var oMessageManager = sap.ui.getCore().getMessageManager();

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

			this.setModel(models.createNotificationFunctionModel(this), "notificationFunctionModel");

			this.setModel(models.createTaskFunctionModel(this), "taskFunctionModel");

			this.setModel(models.createInformationModel(this), "InformationModel");

			this._getSystemInformation();

			this._getFunctionSet();

			this._setApp2AppLinks();
			
			this.setModel(oMessageManager.getMessageModel(), "message");
			
			this.MessageManager = new MessageManager();
			this.setModel(models.createMessageManagerModel(), "messageManager");

			//get start parameter when app2app navigation is in URL
			//replace hash when startup parameter
			//and init Router after success or fail
			this._initRouter();
		},

		/**
		 * This method registers the view to the message manager
		 * @param oView
		 */
		registerViewToMessageManager: function (oView) {
			oMessageManager.registerObject(oView, true);
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
		 * Calls the FunctionSetData for Notification and Task
		 */
		_getFunctionSet: function () {
			var oFilter1 = new Filter("ObjectCategory", FilterOperator.EQ, Constants.FUNCTIONSET_FILTER.NOTIFICATION_FILTER);
			this.readData("/FunctionsSet", [oFilter1])
				.then(function (data) {
					this.getModel("notificationFunctionModel").setData(data);
				}.bind(this));
			var oFilter2 = new Filter("ObjectCategory", FilterOperator.EQ, Constants.FUNCTIONSET_FILTER.TASK_FILTER);
			this.readData("/FunctionsSet", [oFilter2])
				.then(function (data) {
					this.getModel("taskFunctionModel").setData(data);
				}.bind(this));
		},

		/**
		 * Check for a Startup parameter and look for Order ID in Backend
		 * When there is a filtered Order replace route hash
		 */
		_initRouter: function () {
			var oFilter = this._getStartupParamFilter();
			if (oFilter) {
				this.readData("/PMNotificationSet", [oFilter]).then(function (mResult) {
					if (mResult.results.length > 0) {
						//replace hash and init route
						// create the views based on the url/hash
						var hashChanger = sap.ui.core.routing.HashChanger.getInstance();
						hashChanger.replaceHash("Notification/" + mResult.results[0].ObjectKey);
					}
					this.getRouter().initialize();
				}.bind(this));
			} else {
				// create the views based on the url/hash
				this.getRouter().initialize();
			}
		},

		/**
		 * When in link is startup parameter from FLP or Standalone app
		 * then App2App navigation happened and this app shoul show a detail page
		 */
		_getStartupParamFilter: function () {
			var oComponentData = this.getComponentData(),
				sKey = Constants.PROPERTY.EVONOTIFY;

			//Fiori Launchpad startup parameters
			if (oComponentData) {
				var oStartupParams = oComponentData.startupParameters;
				if (oStartupParams[sKey] && (oStartupParams[sKey].length > 0)) {
					return new Filter(sKey, FilterOperator.EQ, oStartupParams[sKey][0]);
				}
			} else {
				var queryString = window.location.search,
					urlParams = new URLSearchParams(queryString);
				if (urlParams.has(sKey)) {
					var oFilter = new Filter(sKey, FilterOperator.EQ, urlParams.get(sKey));
					urlParams.delete(sKey);
					return oFilter;
				}
			}
			return false;
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