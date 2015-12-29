/**
 * Created by Michaela 29.12.2015
 */

jQuery.sap.declare("evora.en.model.config");

model.config = {
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

    PAGES :{
        LOGIN: "Login",
        HOME: "Dashboard",
        FORM: "NotificationForm",
        LIST: "NotificationList",
        DETAILS: "NotificationDetail"
    }
};

(function () {
        var methodCall = jQuery.sap.getUriParameters().get("call");
        if("" == methodCall){
            model.config.isMock = true;
        } else {
            model.config.isMock = false;
        }
    }
)();

model.config.getServiceEndPoint = function(argFor,argSingleCall) {
    return getEndpointUrl(argFor,argSingleCall);
};

model.config.getUser = function () {
    return model.config.LOGIN_USERNAME;
};

model.config.getPwd = function () {
    return model.config.LOGIN_PASSWORD;
};

model.config.getHost = function () {
    return model.config.PATH_SAP_ED1_HOST;
};

model.config.getEntityPath = function (argFor, argCollection, aValue) {
    return getEntityUrl(argCollection,argFor,aValue);
};

model.config.getNotificationHeaderOdataUrl = function () {
    return (model.config.PATH_SAP_ED1_HOST +
    model.config.PATH_NO_HDR_ENTITY +
    model.config.CONST_FILTER_FORMAT +
    model.config.CONST_SYM_CONCAT +
    model.config.CONST_SAP_CLIENT);
};

model.config.getNotificationItemOdataUrl = function () {
    return (model.config.PATH_SAP_ED1_HOST +
    model.config.PATH_NO_ITM_ENTITY +
    model.config.CONST_FILTER_FORMAT +
    model.config.CONST_SYM_CONCAT +
    model.config.CONST_SAP_CLIENT);
};

model.config.makeODataCall = function (oAction, pEntity, oModel, jModel, oCData) {
    switch (oAction) {
        case model.config.ENUM_ACTION_READ :
            oModel.read(pEntity,null, null, false, function(pData, pResponse){
                jModel.setData(pData);
            }, function(pError){
                console.log(pError.message);
            });
            break;
        case model.config.ENUM_ACTION_CREATE :
            /*oModel.create(pEntity, oCData, null, function(pData, pResponse){
             console.log("Create successful");
             },function(pError) {
             console.log(pError.message);
             });*/

            // De-Activated X-CSRF-Token in SAP SICF. SO below POST works without X-CSRF-Token. Else need to implement
            // X-CSRF-Token Fetch using GET and then use it for POST
            OData.request({
                requestUri : "https://ed1.evorait.net:50103/sap/opu/odata/sap/ZEVO_LIGHT_MEASURING_DOCUMENT_SRV/MeasuringdocCollection?sap-client=800",
                user : model.config.getUser(),
                password : model.config.getPwd(),
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
        case model.config.ENUM_ACTION_UPDATE :
            break;
        case model.config.ENUM_ACTION_DELETE :
            break;
    }
};

model.config.makeAjaxCall = function (pEntity, jModel) {
    $.ajax({
        type: "GET",
        async: false,
        url: pEntity,
        data: {username: model.config.getUser(), password: model.config.getPwd()},
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            //var obj = JSON.stringify(data);
            jModel.setData(data);
            model.config.jWOCount = data.results.length;
        },
        error: function (xhr, textStatus, errorMessage) {
            console.log(xhr);
            console.log(textStatus);
            console.log(errorMessage);
        }
    });
};

