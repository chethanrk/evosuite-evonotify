/*global location*/
sap.ui.define([
		"com/evorait/evolite/evonotify/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"com/evorait/evolite/evonotify/model/formatter",
		'sap/ui/core/Fragment',
		'sap/ui/model/Filter'
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
		Fragment,
		Filter
	) {
		"use strict";

		return BaseController.extend("com.evorait.evolite.evonotify.controller.Object", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var tableNoDataTextItems = this.getResourceBundle().getText("itemsTableTitle"),
					tableNoDataTextTasks = this.getResourceBundle().getText("tasksTitle"),
					tableNoDataTextActivities = this.getResourceBundle().getText("activitiesTitle");
					
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0,
						isNew : false,
						isEdit : false,
						editable: false,
						editMode : false,
						showAdd : false,
						saveAsTileTitle: this.getResourceBundle().getText("itemsViewTitle"),
						shareOnJamTitle: this.getResourceBundle().getText("itemsViewTitle"),
						itemsTableTitle : tableNoDataTextItems,
						tasksTableTitle : tableNoDataTextTasks,
						activitiesTableTitle : tableNoDataTextActivities,
						tableNoDataTextItems : this.getResourceBundle().getText("tableNoDataText", [tableNoDataTextItems]),
						tableNoDataTextTasks : this.getResourceBundle().getText("tableNoDataText", [tableNoDataTextTasks]),
						tableNoDataTextActivities : this.getResourceBundle().getText("tableNoDataText", [tableNoDataTextActivities]),
						tableBusyDelay : 0
					});
				//Model for status to be created
				var oStatusModel = new JSONModel("/HeaderStatus.json");
				this.setModel(oStatusModel, "objectStatus");
				
				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
				
				this.getView().addEventDelegate({
				   //onBeforeHide : function(){}
				});

				// Store original busy indicator delay, so it can be restored later on
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						// Restore original busy indicator delay for the object view
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
				
			},
			
			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */


			/**
			 * Event handler  for navigating back.
			 * It there is a history entry we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the worklist route.
			 * @public
			 */
			onNavBack : function() {
				if(this.oForm){
					this.cancelFormHandling(this.oForm);
				}
				if(!this.getModel("objectView").getProperty("/isNew")){
					this.navBack();
				}
			},
			
			navBack : function(){
				var sPreviousHash = History.getInstance().getPreviousHash();
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", {}, true);
				}
			},
			
			/**
			 * table item row select
			 * navigate to notification item
			 */
			onPressItem : function(oEvent) {
				var obj = this.getTableRowObject(oEvent.getParameters());
				
				this.onPressCancel();
				this.getRouter().navTo("item", {
					objectId: obj.MaintenanceNotification,
					itemId: obj.MaintenanceNotificationItem
				});
			},
			
			/**
			 * table task row select
			 * navigate to notification task
			 */
			onPressTask : function(oEvent) {
				var obj = this.getTableRowObject(oEvent.getParameters(), "Tasks");
				
				this.onPressCancel();
				this.getRouter().navTo("objtask", {
					objectId: obj.MaintenanceNotification,
					taskId: obj.MaintenanceNotificationTask
					//itemId: 0
				});
			},
			
			/**
			 * table task row select
			 * navigate to notification task
			 */
			onPressActivity : function(oEvent) {
				var obj = this.getTableRowObject(oEvent.getParameters(), "Activities");
				
				this.onPressCancel();
				this.getRouter().navTo("objactivity", {
					objectId: obj.MaintenanceNotification,
					itemId: 0,
					activityId: obj.MaintNotificationActivity
				});
			},
			/** 
			 * changing the status to Put in Process
			
			onPressInpro : function(statusCode){
				if(this.oForm){
					this.statusChangeHandling(this.oForm, statusCode);
				}
			}, 
			
			/** 
			 * changing the status to Put in Process
			
			onPressPostpone : function(statusCode){
				if(this.oForm){
					this.statusChangeHandling(this.oForm, statusCode);
				}
			}, 
			
			/** 
			 * changing the status to Put in Process
			
			onPressComplete : function(statusCode){
				if(this.oForm){
					this.statusChangeHandling(this.oForm, statusCode);
				}
			}, */
			/** on press for status change
			 * 
			 */
			 onPressStatus : function () {
			 	if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.evorait.evolite.evonotify.HeaderStatusDialog", this);
				var oStatusModel = this.getModel("objectStatus");        
				this._oDialog.setModel(oStatusModel);
			 	}
				// update old search filter
				var isNew = this.getModel("objectView").getProperty("/isNew");
				var phaseVal = this.getView().getBindingContext().getProperty("NotifProcessingPhase");
				if(phaseVal < "2" || isNew){
					var sValue1 = "";
					var oFilter = new Filter("StatusCode",sap.ui.model.FilterOperator.Contains, sValue1);
				}
				else if(phaseVal === "2"){
					    sValue1 = "I0069";
						 oFilter = new Filter("StatusCode",sap.ui.model.FilterOperator.NE, sValue1);
				}
				else if(phaseVal === "3"){
				    	sValue1 = "I0072";
				    	 oFilter = new Filter("StatusCode",sap.ui.model.FilterOperator.Contains, sValue1);	
				}	
				var oBinding = this._oDialog.getBinding("items");
				oBinding.filter([oFilter]);
				// toggle compact style
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
				
				this._oDialog.open();
				
				},
				//handleSearch: function(oEvent) {
				//var sValue = "I0069";
				//var oFilter = new Filter("StatusDescription", sap.ui.model.FilterOperator.Contains, sValue);
				//var oBinding = oEvent.getSource().getBinding("items");
				//oBinding.filter([oFilter]);
				//},
				/* Handle Dailog Close
				*/
				handleClose: function(oEvent) {
					var aContexts = oEvent.getParameter("selectedContexts");
					if (aContexts.length) {
						var statusCode = aContexts.map(function(oContext){ return oContext.getObject().StatusCode; } );
						this.headerStatusChangeHandling(this.oForm, statusCode);
						/*if( statusCode.join() === "I0069"){
							this.onPressPostpone(statusCode);
							this.statusChangeHandling(this.oForm, statusCode);
						}
						else if( statusCode.join() === "I0070"){
							this.onPressInpro(statusCode);
							this.statusChangeHandling(this.oForm, statusCode);
						}
						else if( statusCode.join() === "I0072"){
							this.onPressComplete(statusCode);
							this.statusChangeHandling(this.oForm, statusCode);
						}*/
					}
					oEvent.getSource().getBinding("items").filter([]);
				},
			/**
			 * show edit forms
			 */
			onPressEdit : function() {
				this._setEditMode(true);
			},
			/**
			 * reset changed data
			 * when create notification remove all values
			 */
			onPressCancel : function() {
				if(this.oForm){
					this.cancelFormHandling(this.oForm);
				}
			},
			
			/**
			 * validate and submit form data changes
			 */
			onPressSave : function() {
				if(this.oForm){
					this.saveSubmitHandling(this.oForm);
				}
			},
			
			/**
			 * navigate to new notification item
			 */
			onAddItemPress : function(){
				this.onPressCancel();
				this.getRouter().navTo("item", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					itemId: "new"
				});
			},
			/**
			 * navigate to new notification item
			 */
			onAddTaskPress : function(){
				this.onPressCancel();
				this.getRouter().navTo("objtask", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					taskId: "new"
				});
			},
			/**
			 * navigate to new notification item
			 */
			onAddActivityPress : function(){
				this.onPressCancel();
				this.getRouter().navTo("objactivity", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					activityId: "new"
				});
			},
			/**
			 * fired edit toggle event from subsection block DetailsFormBlock
			 */
			onFiredEditMode : function(oEvent) {
				var oParameters = oEvent.getParameters();
				this._setEditMode(oParameters.editable);
				//var isEdit = this.getModel("objectView").getProperty("/editMode");
				//this._setStatusVisible(isEdit);
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
				var sObjectId =  oEvent.getParameter("arguments").objectId,
					oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel(),
					isNew = (sObjectId === "new");
					
				oDataModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				oDataModel.metadataLoaded().then( function() {
					oViewModel.setProperty("/isNew", isNew);
					oViewModel.setProperty("/isEdit", !isNew);
					this._setEditMode(isNew);
					this.showAllSmartFields(this.oForm); 
					
					if(isNew){
						var oContext = oDataModel.createEntry("/PMNotifications");
						this.getView().unbindElement();
						this.getView().setBindingContext(oContext);
						this._isEditable(oContext);
						
						var oBundle = this.getModel("i18n").getResourceBundle();
						oViewModel.setProperty("/Title", oBundle.getText("newNotificationTitle"));
						oViewModel.setProperty("/showAdd", false);
						oViewModel.setProperty("/busy", false);
					}else{
						var sObjectPath = this.getModel().createKey("PMNotifications", {
							MaintenanceNotification :  sObjectId
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
				var oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel();
					
				this.getView().bindElement({
					path: sObjectPath,
					parameters: {
						expand: "to_PMNotificationItem,to_PMNotificationTask,to_PMNotificationActivity"	
					},
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								// Busy indicator on view should only be set if metadata is loaded,
								// otherwise there may be two busy indications next to each other on the
								// screen. This happens because route matched handler already calls '_bindView'
								// while metadata is loaded.
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
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding(),
					oContext = oElementBinding.getBoundContext();
					
				// No data for the binding
				if (!oContext) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}
				
				if(this.oForm){
					this.oForm.setEditable(false);
				}
				
				//to_PMNotificationTask
				this.generateHelperJsonModel(oContext, "to_PMNotificationTask", "Tasks");
				
				//to_PMNotificationActivity
				this.generateHelperJsonModel(oContext, "to_PMNotificationActivity", "Activities");
				
				// Everything went fine.
				this._setNewHeaderTitle();
				this._isEditable(oContext);
				oViewModel.setProperty("/busy", false);
			},
			
			_setEditMode : function(isEdit){
				this.getModel("objectView").setProperty("/editable", !isEdit);
				this.getModel("objectView").setProperty("/editMode", isEdit);
				this.getModel("objectView").setProperty("/showStatus", isEdit);
			},
			
			_isEditable : function(oContext){
				var data = this.getModel().getProperty(oContext.sPath);
				if(data && (data.IsCompleted || data.IsDeleted) || this.getModel("objectView").getProperty("/editMode")){
					this.getModel("objectView").setProperty("/editable", false);
					this.getModel("objectView").setProperty("/showAdd", false);
				}else{
					this.getModel("objectView").setProperty("/editable", true);
					this.getModel("objectView").setProperty("/showAdd", true);
				}
			},
			
			_setNewHeaderTitle : function(){
				var oContext = this.getView().getBindingContext();
				this.getModel("objectView").setProperty("/Title", this.getModel().getProperty(oContext.sPath+"/NotificationText"));
			}
			
		});
	}
);