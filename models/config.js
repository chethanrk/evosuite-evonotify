/**
 * Created by Michaela 29.12.2015
 */

jQuery.sap.declare("models.Config");

models.Config = {

    VIEW_NAME: "sap.ui.evora.en.view.",

    // Enumerations for Services
    ENUM_WORKORDER : 0,
    ENUM_NOTIFICATION : 1,
    ENUM_EQUIPMENT : 2,
    ENUM_FUNCTION_LOCATION : 3,
    ENUM_MEASURING_DOCUMENT : 4,

    // Enumerations for Service Entity Collections
    ENUM_HEADER : 0,
    ENUM_ITEMS : 1,
    ENUM_BOTH : 2,
    ENUM_PARAMETER : 3,

    // Enumerations for CRUD Actions
    ENUM_ACTION_READ : 0,
    ENUM_ACTION_CREATE : 1,
    ENUM_ACTION_UPDATE : 2,
    ENUM_ACTION_DELETE : 3,

    // SAP Demo User Credentials
    LOGIN_USERNAME : "DEMOUSER",
    LOGIN_PASSWORD : "Mobile01",

    // SAP System Static Endpoints & Entity paths
    PATH_SAP_ED1_HOST : "https://ed1.evorait.net:50103",
    PATH_SAP_ED1_ODATA : "/sap/opu/odata/sap/",

    // SAP OData Services Endpoints
    PATH_NO_ENDPOINT : "ZEVO_LIGHT_NOTIFICATION_GEN_SRV",

    // SAP OData Collections Entity paths
    PATH_NO_HDR_ENTITY : "NotificationHdrCollection",
    PATH_NO_ITM_ENTITY : "NotificationItemCollection",
    PATH_EQ_HDR_ENTITY : "EquipmentCollection",
    PATH_FL_HDR_ENTITY : "FunctionalLocCollection",
    PATH_MD_CRT_ENTITY : "MeasuringdocCollection",
    PATH_WO_EXPAND_ENTITY : "HeaderItemNav",
    PATH_NO_EXPAND_ENTITY : "NotifHeadertoItem",
    PATH_EQ_EXPAND_ENTITY : "EquipMeasurNav",
    PATH_FL_EXPAND_ENTITY : "FlocMpointNav",

    // Constants for OData Filters
    CONST_FILTER_FORMAT : "?$format=json",
    CONST_FILTER_EXPAND : "$expand=",
    CONST_SAP_CLIENT : "sap-client=800",
    CONST_SYM_SEPERATOR : "/",
    CONST_SYM_CONCAT : "&",
    CONST_SYM_OPENBRACE : "('",
    CONST_SYM_CLOSEBRACE : "')",

    // Odata Model for global usage
    MODEL_NO : null,
    MODEL_EQ : null,

    // Busy Dialog Variable
    DIALOG_BUSY : null,

    PAGES : {
        LOGIN: "Login",
        HOME: "Dashboard",
        FORM: "NotificationForm",
        LIST: "NotificationList",
        DETAILS: "NotificationDetail"
    },

    POPOVER : {
        MENU: "subviews.PopoverMenu",
        TIME_FILTER: "subviews.P2"
    }
};

(function () {
        var methodCall = jQuery.sap.getUriParameters().get("call");
        if("" == methodCall){
            models.Config.isMock = true;
        } else {
            models.Config.isMock = false;
        }
    }
)();

models.Config.getServiceEndPoint = function(argFor,argSingleCall) {
    return getEndpointUrl(argFor,argSingleCall);
};

models.Config.getUser = function () {
    return models.Config.LOGIN_USERNAME;
};

models.Config.getPwd = function () {
    return models.Config.LOGIN_PASSWORD;
};

models.Config.getHost = function () {
    return models.Config.PATH_SAP_ED1_HOST;
};

models.Config.getEntityPath = function (argFor, argCollection, aValue) {
    return getEntityUrl(argCollection,argFor,aValue);
};

models.Config.getNotificationHeaderOdataUrl = function () {
    return (models.Config.PATH_SAP_ED1_HOST +
    models.Config.PATH_NO_HDR_ENTITY +
    models.Config.CONST_FILTER_FORMAT +
    models.Config.CONST_SYM_CONCAT +
    models.Config.CONST_SAP_CLIENT);
};

models.Config.getNotificationItemOdataUrl = function () {
    return (models.Config.PATH_SAP_ED1_HOST +
    models.Config.PATH_NO_ITM_ENTITY +
    models.Config.CONST_FILTER_FORMAT +
    models.Config.CONST_SYM_CONCAT +
    models.Config.CONST_SAP_CLIENT);
};

models.Config.makeODataCall = function (oAction, pEntity, oModel, jModel, oCData) {
    switch (oAction) {
        case models.Config.ENUM_ACTION_READ :
            oModel.read(pEntity,null, null, false, function(pData, pResponse){
                jModel.setData(pData);
            }, function(pError){
                console.log(pError.message);
            });
            break;
        case models.Config.ENUM_ACTION_CREATE :
            /*oModel.create(pEntity, oCData, null, function(pData, pResponse){
             console.log("Create successful");
             },function(pError) {
             console.log(pError.message);
             });*/

            // De-Activated X-CSRF-Token in SAP SICF. SO below POST works without X-CSRF-Token. Else need to implement
            // X-CSRF-Token Fetch using GET and then use it for POST
            OData.request({
                requestUri : "https://ed1.evorait.net:50103/sap/opu/odata/sap/ZEVO_LIGHT_MEASURING_DOCUMENT_SRV/MeasuringdocCollection?sap-client=800",
                user : models.Config.getUser(),
                password : models.Config.getPwd(),
                method : "POST",
                data : oCData,
                headers : {
                    "X-Requested-With": "X",
                    "Content-Type": "application/atom+xml",
                    "DataServiceVersion": "2.0",
                }
            }, function(pData, pResponse){
                console.log("Create successful");
            }, function(pError){
                console.log(pError.message);
            });
            break;
        case models.Config.ENUM_ACTION_UPDATE :
            break;
        case models.Config.ENUM_ACTION_DELETE :
            break;
    }
};

models.Config.makeAjaxCall = function (pEntity, jModel) {
    $.ajax({
        type: "GET",
        async: false,
        url: pEntity,
        data: {username: models.Config.getUser(), password: models.Config.getPwd()},
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            //var obj = JSON.stringify(data);
            jModel.setData(data);
            models.Config.jWOCount = data.results.length;
        },
        error: function (xhr, textStatus, errorMessage) {
            console.log(xhr);
            console.log(textStatus);
            console.log(errorMessage);
        }
    });
};

