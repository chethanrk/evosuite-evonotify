sap.ui.define([
    "com/evorait/evolite/evonotify/controller/BaseController",
    "com/evorait/evolite/evonotify/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (BaseController, formatter, Filter, FilterOperator, MessageToast) {
    "use strict";

    return BaseController.extend("com.evorait.evolite.evonotify.controller.StatusChangeDialog", {

        formatter: formatter,

        sNodeName: null,

        oView: null,

        oStatusModel: null,

        /**
         *
         * @param oView
         */
        open: function (oView, sNodeName, oFilter) {
            this.oView = oView;

            if(this.oView){
                var oDialog = this.getDialog();
                this.oStatusModel = this.oView.getModel("StatusVH");

                if(!sNodeName || !this.oStatusModel.getProperty("/"+sNodeName)){
                    return;
                }

                this.sNodeName = sNodeName;
                this.oStatusModel.setProperty("/selectedNode", this.oStatusModel.getProperty("/"+sNodeName));
                //reset searchfield
                if(!oFilter){
                    var oBinding = oDialog.getBinding("items");
                    var oFilter = new Filter("StatusCode", FilterOperator.Contains, "");
                }
                oBinding.filter([oFilter]);
                oDialog.open();
            }
        },

        /**
         * return instance of dialog
         * @returns {*}
         */
        getDialog: function () {
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("com.evorait.evolite.evonotify.view.fragments.StatusChangeDialog", this);
            }
            this.oView.addDependent(this._oDialog);
            return this._oDialog;
        },

        /**
         * get selected status
         * @param oEvent
         */
        onPressClose: function (oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem");

            if(selectedItem){
                var sPath = selectedItem.getBindingContext("StatusVH").getPath(),
                    sStatusCode = this.oStatusModel.getProperty(sPath+"/StatusCode");
                this.saveStatus(sStatusCode);
            }

            oEvent.getSource().getBinding("items").filter([]);
        },

        /**
         * send new status to backend by FunctionImport
         * @param oForm
         * @param statusCode
         */
        saveStatus: function(statusCode){
            var oViewContext = this.oView.getBindingContext(),
                oObjectViewModel = this.oView.getModel("objectView"),
                sRequestName = "/UpdateHeaderStatus";

            oObjectViewModel.setProperty("/busy", true);

            var obj = {
                "MaintNotification": oViewContext.getProperty("MaintenanceNotification"),
                "MaintStatus": statusCode
            };

            if(this.sNodeName === "TaskStatus"){
                obj["MaintNotifTask"] = oViewContext.getProperty("MaintenanceNotificationTask");
                sRequestName = "/UpdateTaskStatus";
            }


            this.oView.getModel().callFunction(sRequestName, {
                method: "POST",
                urlParameters: obj,
                success: function (oData, response) {
                    oObjectViewModel.setProperty("/busy", false);
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
                    oObjectViewModel.setProperty("/busy", false);
                    this.showSaveErrorPrompt(oError);
                }.bind(this)
            });
        }

    });
});