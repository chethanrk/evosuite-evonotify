/*global location*/
sap.ui.define([
		"com/evorait/evolite/evonotify/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"com/evorait/evolite/evonotify/model/formatter",
	    "sap/m/MessageToast"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
		MessageToast
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
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0,
						isNew : false,
						isEdit : false,
						editable: false,
						editMode : false,
						showAdd : false,
						itemsTableTitle : this.getResourceBundle().getText("itemsTableTitle"),
						saveAsTileTitle: this.getResourceBundle().getText("itemsViewTitle"),
						shareOnJamTitle: this.getResourceBundle().getText("itemsViewTitle"),
						tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
						tableBusyDelay : 0
					});

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
				var sPreviousHash = History.getInstance().getPreviousHash();
				var isNew = this.getModel("objectView").getProperty("/isNew");
				var isEdit = this.getModel("objectView").getProperty("/isEdit");
				
				if(this.oForm){
					var isEditable = this.oForm.getEditable();
					var invalidFields = this.oForm.check();
					
					if(isNew){
						var oContext = this.getView().getBindingContext();
						//need to hide mandatory fields so validation will be skipped on toggle editable
						this._hideInvalidFields(invalidFields);
						this.oForm.setEditable(!isEditable);
						this.getModel().deleteCreatedEntry(oContext);
					}
					if(isEdit && isEditable){
						this.getView().getModel().resetChanges();
						this._hideInvalidFields(invalidFields);
						this.oForm.setEditable(!isEditable);
					}
				}
						
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
				// The source is the list item that got pressed
				var oParameters = oEvent.getParameters();
				var oRow = sap.ui.getCore().byId(oParameters.id);
				var sPath = oRow.getBindingContextPath();
				var obj = this.getModel().getProperty(sPath);
				
				this.onPressCancel();
				this.getRouter().navTo("item", {
					objectId: obj.MaintenanceNotification,
					itemId: obj.MaintenanceNotificationItem
				});
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
					var isEditable = this.oForm.getEditable();
					var invalidFields = this.oForm.check();
					var isNew = this.getModel("objectView").getProperty("/isNew");
					
					if(isEditable && !isNew){
						this.getView().getModel().resetChanges();
						this._hideInvalidFields(invalidFields);
						this.oForm.setEditable(!isEditable);
						this._showAllSmartFields();
					}
					if(isNew){
						var oContext = this.getView().getBindingContext();
						//need to hide mandatory fields so validation will be skipped on toggle editable
						this._hideInvalidFields(invalidFields);
						this.oForm.setEditable(!isEditable);
						this.getModel().deleteCreatedEntry(oContext);
						this.getRouter().navTo("worklist", {}, true);
					}
				}
			},
			
			/**
			 * validate and submit form data changes
			 */
			onPressSave : function() {
				if(this.oForm){
					var oViewModel = this.getModel("objectView");
					var isEditable = this.oForm.getEditable();
					var invalidFields = this.oForm.check();
					
					// validation ok when form editable triggered to false
					if(invalidFields.length === 0){
						this.getModel("objectView").setProperty("/busy", true);
						
						this.getView().getModel().submitChanges({
							success: function(){
								oViewModel.setProperty("/busy", false);
								this.oForm.setEditable(!isEditable);
								
								var sMsg = this.getModel("i18n").getResourceBundle().getText("saveSuccess");
								MessageToast.show(sMsg, {duration: 5000});
								
								oViewModel.setProperty("/isNew", false);
								oViewModel.setProperty("/isEdit", true);
								var oContext = this.getView().getBindingContext();
								oViewModel.setProperty("/Title", this.getModel().getProperty(oContext.sPath+"/NotificationText"));
							}.bind(this),
							
							error: function(oError){
								this.getModel("objectView").setProperty("/busy", false);
								this.getOwnerComponent().showSaveErrorPrompt(oError);
							}.bind(this)
						 });
					}else{
						this.oForm.setEditable(!isEditable);
					}
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
			 * fired edit toggle event from subsection block DetailsFormBlock
			 */
			onFiredEditMode : function(oEvent) {
				var oParameters = oEvent.getParameters();
				this._setEditMode(oParameters.editable);
				
				if(!this.oForm){
					this.oForm = sap.ui.getCore().byId(oParameters.id);
				}
			},
			
			onFiredChecked : function(oEvent) {
				var oParameters = oEvent.getParameters();
				//console.log(oParameters);
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
					this._showAllSmartFields();
					
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
						expand: "to_PMNotificationItem"
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
							oViewModel.setProperty("/Title", oDataModel.getProperty(sObjectPath+"/NotificationText"));
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

				// Everything went fine.
				this._isEditable(oContext);
				oViewModel.setProperty("/busy", false);
			},
			
			_setEditMode : function(isEdit){
				this.getModel("objectView").setProperty("/editable", !isEdit);
				this.getModel("objectView").setProperty("/editMode", isEdit);
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
			
			/**
			 * maybe on a last step there needed to hide some SmartFields
			 * so on Object view navigation all fields should visible again
			 */
			_showAllSmartFields : function(){
				if(this.oForm){
					var smarFields = this.oForm.getSmartFields();
					for(var i=0; smarFields.length > i; i++){
						smarFields[i].setVisible(true);
					}
				}
			},
			
			/**
			 * workaround for cancel a new entry
			 * mandatory and filled fields are always validated
			 * currently there is always a validation on change editable
			 * but when fields are invisible validation breaks
			 */
			_hideInvalidFields : function(invalidFields){
				if(invalidFields.length > 0 && this.oForm){
					var smarFields = this.oForm.getSmartFields();
					for(var i=0; smarFields.length > i; i++){
						if(invalidFields.indexOf(smarFields[i].sId) > -1){
							smarFields[i].setVisible(false);
						}
					}
				}
			}
			
		});
	}
);