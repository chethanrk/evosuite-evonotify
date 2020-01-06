/*global location*/
sap.ui.define([
		"com/evorait/evonotify/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"com/evorait/evonotify/model/formatter"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter
	) {
		"use strict";

		return BaseController.extend("com.evorait.evonotify.controller.ObjectCause", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				this.getRouter().getRoute("cause").attachPatternMatched(this._onObjectMatched, this);
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Event handler  for navigating back.
			 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the worklist route.
			 * @public
			 */
			onNavBack : function() {
				if(this.oForm){
					this.cancelFormHandling(this.oForm);
				}
				if(!this.getModel("viewModel").getProperty("/isNew")){
					this.navBack();
				}
			},
			
			navBack : function(){
				var sPreviousHash = History.getInstance().getPreviousHash();
				var oContext = this.getView().getBindingContext();
				
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else if(oContext) {
					var obj = oContext.getObject();
					this.getRouter().navTo("item", {
						objectId: obj.MaintenanceNotification,
						itemId: obj.MaintenanceNotificationItem
					}, true);
				}else{
					this.getRouter().navTo("worklist", {}, true);
				}
			},
			
			/**
			 * show edit forms
			 */
			onPressEdit : function() {
				this._setEditMode(true);
			},
			
			onPressSave : function(){
				if(this.oForm){
					this.saveSubmitHandling(this.oForm);
				}
			},
			
			onPressCancel : function(){
				if(this.oForm){
					this.cancelFormHandling(this.oForm);
				}
			},
			
			/**
			 * fired edit toggle event from subsection block DetailsFormBlock
			 */
			onFiredEditMode : function(oEvent) {
				var oParameters = oEvent.getParameters();
				this._setEditMode(oParameters.editable);
				
				if(!this.oForm){
					this.oForm = sap.ui.getCore().byId(oParameters.id);
				}
			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				var sItemId = oEvent.getParameter("arguments").itemId,
					sCauseId = oEvent.getParameter("arguments").causeId,
					oViewModel = this.getModel("viewModel"),
					oDataModel = this.getModel(),
					isNew = (sCauseId === "new");
					
				var sObjectId =  oEvent.getParameter("arguments").objectId;

				oDataModel.metadataLoaded().then( function() {
					oViewModel.setProperty("/isNew", isNew);
					oViewModel.setProperty("/isEdit", !isNew);
					oViewModel.setProperty("/MaintenanceNotification",sObjectId);
					this._setEditMode(isNew);

					if(isNew){
						var oContext = oDataModel.createEntry("/PMNotificationCauses");
						oDataModel.setProperty(oContext.sPath+"/MaintenanceNotification", sObjectId);
						oDataModel.setProperty(oContext.sPath+"/MaintenanceNotificationItem", sItemId);
						this.getView().unbindElement();
						this.getView().setBindingContext(oContext);
						
						var oBundle = this.getModel("i18n").getResourceBundle();
						oViewModel.setProperty("/Title", oBundle.getText("newNotificationCauseTitle"));
						oViewModel.setProperty("/busy", false);
						
					}else{
						var sObjectPath = this.getModel().createKey("PMNotificationCauses", {
							MaintenanceNotification :  sObjectId,
							MaintenanceNotificationItem : sItemId,
							MaintenanceNotificationCause : sCauseId
						});
						this._bindView("/" + sObjectPath);
					}
				}.bind(this));
			},

			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound
			 * @private
			 */
			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("viewModel"),
					oDataModel = this.getModel();

				this.getView().bindElement({
					path: sObjectPath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("viewModel"),
					oElementBinding = oView.getElementBinding(),
					oContext = oElementBinding.getBoundContext(),
			    	data = this.getModel().getProperty(oContext.sPath);
					
					if(data.MaintNotifCauseCodeCatalog === ""){
						data.MaintNotifCauseCodeCatalog = '5';
					}
				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}
				// Everything went fine.
				this._setNewHeaderTitle();
				oViewModel.setProperty("/busy", false);
			},
			
			_setEditMode : function(isEdit){
				if(isEdit){
					this.getModel("viewModel").setProperty("/showMode", !isEdit);
					this.getModel("viewModel").setProperty("/editMode", isEdit);
				}else{
					var MaintenanceNotification = this.getModel("viewModel").getProperty("/MaintenanceNotification"),
					sPath = this.getModel().getContext("/PMNotifications").getPath(),
					isCompleted = this.getModel().getProperty(sPath+"('"+MaintenanceNotification+"')/IsCompleted"),
					isDeleted = this.getModel().getProperty(sPath+"('"+MaintenanceNotification+"')/IsDeleted");
					
					if(isCompleted || isDeleted){
						this.getModel("viewModel").setProperty("/showMode", isEdit);
					}else{
						this.getModel("viewModel").setProperty("/showMode", !isEdit);
					}
				}
			},
			
			_setNewHeaderTitle : function(){
				var oContext = this.getView().getBindingContext();
				this.getModel("viewModel").setProperty("/Title", this.getModel().getProperty(oContext.sPath+"/MaintNotifCauseText"));
			}

		});

	}
);