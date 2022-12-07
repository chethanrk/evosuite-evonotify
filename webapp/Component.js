sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"com/evorait/evosuite/evonotify/model/models",
	"com/evorait/evosuite/evonotify/controller/ErrorHandler",
	"com/evorait/evosuite/evonotify/controller/DialogTemplateRenderController",
	"com/evorait/evosuite/evonotify/model/Constants",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/evorait/evosuite/evonotify/assets/js/url-search-params.min",
	"com/evorait/evosuite/evonotify/assets/js/promise-polyfills",
	"com/evorait/evosuite/evonotify/controller/MessageManager",
	"sap/ui/util/Storage"
], function (UIComponent, Device, JSONModel, models, ErrorHandler, DialogTemplateRenderController, Constants, Filter,
	FilterOperator, UrlSearchPolyfill, PromisePolyfill, MessageManager, Storage) {
	"use strict";

	var oMessageManager = sap.ui.getCore().getMessageManager();

	return UIComponent.extend("com.evorait.evosuite.evonotify.Component", {

		metadata: {
			manifest: "json"
		},

		oSystemInfoProm: null,
		oTemplatePropsProm: null,
		oDefaultInfoProm: null,
		oNavigationLinksPropsProm: null,
		oFormStorage: null,

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

			if (manifestApp && (manifestApp.dataSources)) {
				dataSource = manifestApp.dataSources.mainService.uri;
			}

			this.DialogTemplateRenderer = new DialogTemplateRenderController(this);

			//create local storage with prefix "EvoNotify_form"
			this.oFormStorage = new Storage(Storage.Type.local, "EvoNotify_form");

			var viewModelObj = {
				busy: true,
				delay: 100,
				canExpand: true,
				serviceUrl: dataSource,
				editMode: false,
				isNew: false,
				launchMode: Constants.LAUNCH_MODE.BSP,
				createPageOnly: false,
				densityClass: this.getContentDensityClass(),
				authorizeCheck: false,
				validatedIw21Auth: true, 
				validatedIw22Auth: true, 
				validatedIw31Auth: true 
			};

			this.setModel(models.createHelperModel(viewModelObj), "viewModel");

			this.setModel(models.createUserModel(this), "user");

			this.setModel(models.createNotificationFunctionModel(this), "notificationFunctionModel");

			this.setModel(models.createTaskFunctionModel(this), "taskFunctionModel");

			this.setModel(models.createInformationModel(this), "InformationModel");

			this.setModel(models.createDefaultInformationModel(this), "DefaultInformationModel");

			this._getSystemInformation();

			this.oSystemInfoProm.then(this._handleAuthorization.bind(this));

			this._getDefaultInformation();

			this._getTemplateProps();

			this._getFunctionSet();

			this.oTemplatePropsProm.then(this._setApp2AppLinks());

			this.setModel(oMessageManager.getMessageModel(), "message");

			this.MessageManager = new MessageManager();
			this.setModel(models.createMessageManagerModel(), "messageManager");

			//get start parameter when app2app navigation is in URL
			//replace hash when startup parameter
			//Wait for navigation link properties to load 
			this.oNavigationLinksPropsProm.then(this._initRouter.bind(this));

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
		 * get url GET parameter by key name
		 */
		getLinkParameterByName: function (sKey) {
			var oComponentData = this.getComponentData();
			//Fiori Launchpad startup parameters
			if (oComponentData) {
				var oStartupParams = oComponentData.startupParameters;
				if (oStartupParams[sKey] && (oStartupParams[sKey].length > 0)) {
					return oStartupParams[sKey][0];
				} else if (!sKey) {
					return oStartupParams;
				}
			} else {
				var queryString = window.location.search,
					urlParams = new URLSearchParams(queryString);
				if (urlParams.has(sKey)) {
					return urlParams.get(sKey);
				} else if (!sKey) {
					return urlParams;
				}
			}
			return false;
		},

		/**
		 * check if mobile device
		 * @returns {boolean}
		 * @private
		 */
		_isMobile: function () {
			return sap.ui.Device.system.tablet || sap.ui.Device.system.phone;
		},

		/**
		 * Calls the GetSystemInformation 
		 */
		_getSystemInformation: function () {
			this.oSystemInfoProm = new Promise(function (resolve) {
				this.readData("/SystemInformationSet", []).then(function (oData) {
					this.getModel("user").setData(oData.results[0]);
					resolve(oData.results[0]);
				}.bind(this));
			}.bind(this));
		},

		/**
		 * get Template properties as model inside a global Promise
		 */
		_getTemplateProps: function () {
			this.oTemplatePropsProm = new Promise(function (resolve) {
				var realPath = sap.ui.require.toUrl("com/evorait/evosuite/evonotify/model/TemplateProperties.json");
				var oTempJsonModel = new JSONModel();
				oTempJsonModel.loadData(realPath);
				oTempJsonModel.attachRequestCompleted(function () {
					this.setModel(oTempJsonModel, "templateProperties");
					resolve(oTempJsonModel.getData());
				}.bind(this));
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
		 * and init Router after success or fail
		 */
		_initRouter: function () {
			var oFilter = this._getStartupParamFilter();
			if (typeof oFilter === "object") {
				this.readData("/PMNotificationSet", [oFilter]).then(function (mResult) {
					if (mResult.results.length > 0) {
						//replace hash and init route
						// create the views based on the url/hash
						var hashChanger = sap.ui.core.routing.HashChanger.getInstance();
						hashChanger.replaceHash("Notification/" + mResult.results[0].ObjectKey);
					}
					this.getRouter().initialize();
				}.bind(this));
			} else if (oFilter === Constants.PROPERTY.NEW) {
				//init route for create notification
				var hashChanger = sap.ui.core.routing.HashChanger.getInstance();
				hashChanger.replaceHash("NewNotification");
				this.getModel("viewModel").setProperty("/createPageOnly", true);
				this.getRouter().initialize();
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
				sKey = this.getLinkParameterByName(Constants.PROPERTY.EVONOTIFY);

			if (sKey === Constants.PROPERTY.NEW) {
				return sKey;
			} else if (sKey) {
				return (new Filter(Constants.PROPERTY.EVONOTIFY, FilterOperator.EQ, sKey));
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
			this.oNavigationLinksPropsProm = new Promise(function (resolve) {
				this.readData("/NavigationLinksSet", [oFilter]).then(function (data) {
					data.results.forEach(function (oItem) {
						if (oItem.Value1 && Constants.APPLICATION[oItem.ApplicationId]) {
							oItem.Property = oItem.Value2 || Constants.PROPERTY[oItem.ApplicationId];
							mProps[oItem.Property] = oItem;
						}
					}.bind(this));
					if (this.getModel("templateProperties")) {
						this.getModel("templateProperties").setProperty("/navLinks/", mProps);
					}
					resolve(mProps);
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Calls the PropertyValueDetermination 
		 */
		_getDefaultInformation: function () {
			this.oDefaultInfoProm = new Promise(function (resolve) {
				this.readData("/PropertyValueDeterminationSet", []).then(function (oData) {
					this.getModel("DefaultInformationModel").setProperty("/defaultProperties", oData.results);
					resolve(oData.results);
				}.bind(this));
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
		},
		/**
		 * Handle SAP authorization
		 */
		_handleAuthorization: function () {
			var bPMAuth = this.getModel("user").getProperty("/ENABLE_PM_AUTH_CHECK"),
				sIw21Auth = this.getModel("user").getProperty("/ENABLE_IW21_AUTH_CHECK"),
				sIw22Auth = this.getModel("user").getProperty("/ENABLE_IW22_AUTH_CHECK"),
				sIw31Auth = this.getModel("user").getProperty("/ENABLE_IW31_AUTH_CHECK");
			if (bPMAuth) {
				this.getModel("viewModel").setProperty("/validatedIw21Auth", Boolean(sIw21Auth));
				this.getModel("viewModel").setProperty("/validatedIw22Auth", Boolean(sIw22Auth));
				this.getModel("viewModel").setProperty("/validatedIw31Auth", Boolean(sIw31Auth));
			}
		}
	});
});