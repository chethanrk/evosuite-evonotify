/*global location*/
sap.ui.define([
		"com/evorait/evolite/evonotify/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"com/evorait/evolite/evonotify/model/formatter"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter
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
						delay : 0
					});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				// Store original busy indicator delay, so it can be restored later on
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						// Restore original busy indicator delay for the object view
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
				
				// Model used to manipulate control states
				oViewModel = new JSONModel({
					itemsTableTitle : this.getResourceBundle().getText("itemsTableTitle"),
					saveAsTileTitle: this.getResourceBundle().getText("itemsViewTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("itemsViewTitle"),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "itemsView");
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

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", {}, true);
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
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				
				this.getModel().setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("PMNotifications", {
						MaintenanceNotification :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));
				
				/*this.getModel().attachRejectChange(this,function(oEv){
				 	console.log(oEv);
				});*/
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
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding(),
					boundObject = oView.getModel().getProperty(oElementBinding.sPath);

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				// Everything went fine.
				oViewModel.setProperty("/busy", false);
				this._getListObjects(boundObject.to_PMNotificationItem);
			},
			
			
			_getListObjects : function(oNode){
				var oView = this.getView(),
					itemsView = this.getModel("itemsView");
				var results = [];
				
				itemsView.setProperty("/busy", true);
			
				if (oNode.__ref) {
					oNode = this.oData[oNode.__ref];
				} else if (oNode.__list) {
					oNode = oNode.__list;
				} else if (oNode.__deferred) {
					oNode = null;
				}
				
				if(oNode){
					for (var i = 0; i < oNode.length; i++) {
			            oView.getModel().read("/"+oNode[i],{
		                    success: function(data){
		                        results.push(data);
		                    }
		                });
			        }
				}
				
				// on successfull batch sent
	             oView.getModel().attachBatchRequestCompleted(function(){
	                itemsView.setProperty("/items", results);
	                itemsView.setProperty("/busy", false);
	            });
	
	            // on sent error of batch request
	             oView.getModel().attachBatchRequestFailed(function(){
	                itemsView.setProperty("/busy", false);
	            });
				
			},
			
			/**
			 * table item row select
			 * navigate to notification item
			 */
			onPressItem : function(oEvent) {
				// The source is the list item that got pressed
				var oParameters = oEvent.getParameters();
				var sBinding = sap.ui.getCore().byId(oParameters.id).getBindingContext("itemsView");
				var obj =sBinding.getObject();
				
				this.getRouter().navTo("item", {
					objectId: obj.MaintenanceNotification,
					itemId: obj.MaintenanceNotificationItem
				});
			},
			
			onPressEdit : function(oEvent) {
				var oParameters = oEvent.getParameters();
				//var sBinding = this.getView().getBindingContextPath();
				
				if(!oParameters.editable){
					this.getView().getModel().submitChanges(function(){
		 				alert("Update successful");
	 				},function(){
	 					alert("Update failed");
					});
					
					/*oModel.update(sBinding.sPath, oData, {
						success: function(){}, 
						error: function(){}
					});*/
				}
				
			}

		});

	}
);