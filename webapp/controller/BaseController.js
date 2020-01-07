sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/routing/History",
        "sap/m/Dialog",
        "sap/m/Button",
        "sap/m/Text",
        "sap/m/MessageToast"
    ], function (Controller, JSONModel, History, Dialog, Button, Text, MessageToast) {
        "use strict";

        return Controller.extend("com.evorait.evonotify.controller.BaseController", {
            /**
             * Convenience method for accessing the router.
             * @public
             * @returns {sap.ui.core.routing.Router} the router for this component
             */
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },

            /**
             * Convenience method for getting the view model by name.
             * @public
             * @param {string} [sName] the model name
             * @returns {sap.ui.model.Model} the model instance
             */
            getModel: function (sName) {
                if(this.getView().getModel){
                    return this.getView().getModel(sName);
                }
                return this.getOwnerComponent().getModel(sName);
            },

            /**
             * Convenience method for setting the view model.
             * @public
             * @param {sap.ui.model.Model} oModel the model instance
             * @param {string} sName the model name
             * @returns {sap.ui.mvc.View} the view instance
             */
            setModel: function (oModel, sName) {
                return this.getView().setModel(oModel, sName);
            },

            /**
             * navigate a history page back or to home page
             */
            navBack : function(){
                var sPreviousHash = History.getInstance().getPreviousHash();
                if (sPreviousHash !== undefined) {
                    history.go(-1);
                } else {
                    this.getRouter().navTo("worklist", {}, true);
                }
            },

            /**
             * Getter for the resource bundle.
             * @public
             * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
             */
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            /**
             * translate the stausKey from model to app lagunage
             * @param sValue
             * @returns {string|*}
             */
            translateStatusKey: function(sValue){
                if(sValue){
                    return this.getResourceBundle().getText(sValue);
                }
                return "";
            },

            /**
             * check if form is valid
             * @param oEvent
             */
            isFormValidation: function (oEvent) {
                var oParams = oEvent.getParameters(),
                    oContext = this.getView().getBindingContext();

                if (oParams.state === "success") {
                    this.getModel().setProperty(oContext.getPath() + "/Status", "");
                    return true;
                } else if (oParams.state === "error") {
                    return false;
                }
                return false;
            },

            /**
             * generates a json model with a list of expanded entity properties
             * helper for reuse table blockviews
             */
            generateHelperJsonModel: function (oContext, sPropertyName, sModelName) {
                var arr = [],
                    aPaths = oContext.getProperty(sPropertyName);
                if (aPaths) {
                    for (var i = 0; i < aPaths.length; i++) {
                        arr.push(this.getModel().getProperty("/" + aPaths[i]));
                    }
                }
                this.setModel(new JSONModel({
                    modelData: arr
                }), sModelName);
            },

            getTableRowObject: function (oParameters, sModelName) {
                var oRow = sap.ui.getCore().byId(oParameters.id);
                var sPath = oRow.getBindingContextPath();
                var oObj = this.getModel().getProperty(sPath);

                if (!oObj && sModelName) {
                    var sBinding = oRow.getBindingContext(sModelName);
                    return sBinding.getObject();
                }
                return this.getModel().getProperty(sPath);
            },

            /**
             * save error dialog
             */
            showSaveErrorPrompt: function (error) {
                var oBundle = this.getResourceBundle();
                var sTitle = oBundle.getText("tit.error");
                var sMsg = oBundle.getText("msg.errorText");
                var sBtn = oBundle.getText("btn.close");

                var dialog = new Dialog({
                    title: sTitle,
                    type: "Message",
                    state: "Error",
                    content: new Text({
                        text: sMsg
                    }),
                    beginButton: new Button({
                        text: sBtn,
                        press: this.close
                    }),
                    afterClose: this.destroy
                });
                dialog.open();
            },

            /**
             * saves a new status for notifcation header or task
             */
            saveNewStatus: function (sRequestName, obj) {
                var oViewModel = this.getModel("viewModel");

                this.getModel().callFunction(sRequestName, {
                    method: "POST",
                    urlParameters: obj,
                    success: function (oData, response) {
                        oViewModel.setProperty("/busy", false);
                        var sMsg = "";
                        var errMsg = sap.ui.getCore().getMessageManager().getMessageModel().getData();
                        for (var i = 0; i < errMsg.length; i++) {
                            sMsg = sMsg + errMsg[i].message;
                        }
                        if (sMsg === "") {
                            sMsg = oData.MaintenanceNotification + "/" + (oData.MaintenanceNotificationTask || "") + " "
                                + this.getResourceBundle().getText("msg.saveStatusSuccess");
                        }
                        MessageToast.show(sMsg, {
                            duration: 5000
                        });

                    }.bind(this), // callback function for success

                    error: function (oError) {
                        oViewModel.setProperty("/busy", false);
                        this.showSaveErrorPrompt(oError);
                    }.bind(this)
                });
            }

        });

    }
);