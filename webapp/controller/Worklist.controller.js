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
				formatter: {
					public: true,
					final: true
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
			this.oSmartTable = this.getView().byId("NotificationTable");
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

		/**
		 * SmartTable before loading request
		 * set default SortOrder from annotations
		 */
		onBeforeRebindTable: function (oEvent) {
			TableController.prototype.onBeforeRebindTable.apply(this, arguments);
		},

		/**
		 * event when Variant mMnagment of SmartFilterBar or SmartTable was initialized
		 * @param oEvent
		 */
		onInitializedSmartVariant: function (oEvent) {
			TableController.prototype.onInitializedSmartVariant.apply(this, arguments);
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