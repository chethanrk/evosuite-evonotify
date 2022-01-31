sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/TableController",
	"com/evorait/evosuite/evonotify/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/OverrideExecution"
], function (TableController, formatter, JSONModel, OverrideExecution) {
	"use strict";

	return TableController.extend("com.evorait.evosuite.evonotify.controller.Worklist", {

		metadata: {
			methods: {
				addFilters: {
					"public": true,
					"final": false,
					overrideExecution: OverrideExecution.Instead
				},
				onBeforeRebindTable: {
					public: true,
					final: true
				},
				onInitializedSmartVariant: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressTableRow: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressCreateNotification: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Before
				}
			}
		},

		formatter: formatter,

		oSmartTable: null,

		aPageDefaultFilters: [],

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			//Bind the message model to the view and register it
			if (this.getOwnerComponent) {
				this.getOwnerComponent().registerViewToMessageManager(this.getView());
			}
			this.oSmartTable = this.getView().byId("idPageNotificationListSmartTable");
		},

		/**
		 * worklist after rendering
		 */
		onAfterRendering: function () {
			this.getModel("viewModel").setProperty("/busy", false);
		},

		/**
		 * worklist on exit
		 */
		onExit: function () {

		},

		/* =========================================================== */
		/* Public methods                                           */
		/* =========================================================== */

		/**
		 * allows extension to add filters. They will be combined via AND with all other filters
		 * oControllerExtension must be the ControllerExtension instance which adds the filter
		 * oFilter must be an instance of sap.ui.model.Filter
		 */
		addFilters: function () {
			return [];
		},

		/**
		 * SmartTable before loading request
		 * set default SortOrder from annotations
		 */
		onBeforeRebindTable: function (oEvent) {
			TableController.prototype.onBeforeRebindTable.apply(this, arguments);
			var mBindingParams = oEvent.getParameter("bindingParams");
			this.aPageDefaultFilters = this.aPageDefaultFilters.concat(this.addFilters());
			mBindingParams.filters = mBindingParams.filters.concat(this.aPageDefaultFilters);
		},

		/**
		 * event when Variant mMnagment of SmartFilterBar or SmartTable was initialized
		 * @param oEvent
		 */
		onInitializedSmartVariant: function (oEvent) {
			TableController.prototype.onInitializedSmartVariant.apply(this, arguments);
			//get default filter by GET url parameter and if property is allowed to filter
			this.getDefaultTableFiltersFromUrlParams("PMNotificationSet").then(function (aFilters) {
				this.aPageDefaultFilters = aFilters;
				this.oSmartTable.rebindTable();
			}.bind(this));
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPressTableRow: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			this.oSmartTable.setEditable(false);
			this.getModel("viewModel").setProperty("/enableNotificationChange", oContext.getProperty("ENABLE_NOTIFICATION_CHANGE"));
			this.getRouter().navTo("NotificationDetail", {
				ObjectKey: oContext.getProperty("ObjectKey")
			});
		},

		/**
		 * Event handler to navigate to create notification page
		 * @param oEvent
		 */

		onPressCreateNotification: function () {
			this.oSmartTable.setEditable(false);
			this.getRouter().navTo("CreateNotification", {});
		}
	});
});