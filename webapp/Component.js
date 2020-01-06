sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/evorait/evonotify/model/models",
	"com/evorait/evonotify/controller/ErrorHandler",
	"com/evorait/evonotify/controller/AddEntryDialog"
], function (UIComponent, Device, models, ErrorHandler, AddEntryDialog) {
	"use strict";

	return UIComponent.extend("com.evorait.evonotify.Component", {

		metadata: {
			manifest: "json"
		},

		oAddEntryDialog: new AddEntryDialog(),

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// handle the main oData model based on the environment
			// the path for mobile applications depends on the current information from
			// the logon plugin - if it's not running as hybrid application then the initialization
			// of the oData service happens by the entries in the manifest.json which is used
			// as metadata reference
			if(window.cordova){
				this._initCordovaHandling();
			}

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");


			// set global helper view model
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view"s meta data
			/*var oResourceBundle = this.getModel("i18n"),
				tableNoDataTextItems = oResourceBundle.getText("itemsTableTitle"),
				tableNoDataTextTasks = oResourceBundle.getText("tasksTitle"),
				tableNoDataTextActivities = oResourceBundle.getText("activitiesTitle");*/

			this.setModel(models.createHelperModel({
				busy : true,
				delay : 0,
				isNew : false,
				isEdit : false,
				editMode : false,
				worklistEntitySet: "PMNotifications",
				taskViewPath : "",
				actViewPath : "",
				rootPath: jQuery.sap.getModulePath("com.evorait.evonotify"), // your resource root
				logoPath: "/img/logo_color_transp_50pxh.png"
				/*itemsTableTitle : tableNoDataTextItems,
				tasksTableTitle : tableNoDataTextTasks,
				activitiesTableTitle : tableNoDataTextActivities,
				tableNoDataTextItems : oResourceBundle.getText("tableNoDataText", [tableNoDataTextItems]),
				tableNoDataTextTasks : oResourceBundle.getText("tableNoDataText", [tableNoDataTextTasks]),
				tableNoDataTextActivities : oResourceBundle.getText("tableNoDataText", [tableNoDataTextActivities]),
				tableBusyDelay : 0*/
			}), "viewModel");

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		destroy: function() {
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
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
		 * init cordova
		 * call Kapsel logon and login to SMP
		 * @private
		 */
		_initCordovaHandling: function(){
			var oModel;
			var externalURL = com.evorait.evolite.evonotify.dev.devapp.externalURL;
			var appContext;
			if (com.evorait.evolite.evonotify.dev.devapp.devLogon) {
				appContext = com.evorait.evolite.evonotify.dev.devapp.devLogon.appContext;
			}

			if (window.cordova && appContext && !window.sap_webide_companion && !externalURL) {
				var url = appContext.applicationEndpointURL + "/";
				var oHeader = {
					"X-SMP-APPCID": appContext.applicationConnectionId
				};

				// this would allow to pass basic authentication from the user registration to the
				// backend request - do not do this yet
				/**
				 if (appContext.registrationContext.user) {
					oHeader.Authorization = "Basic " + btoa(appContext.registrationContext.user + ":" + appContext.registrationContext.password);
				}
				 **/
				// set the central model (default model has no name)
				oModel = new sap.ui.model.odata.ODataModel(url, true, null, null, oHeader);
				this.setModel(oModel);
			}
		}
	});
});