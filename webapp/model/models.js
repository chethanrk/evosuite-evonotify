sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createHelperModel: function (obj) {
			var oModel = new JSONModel(obj);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createNotificationFunctionModel: function (User) {
			var oModel = new JSONModel(User);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createTaskFunctionModel: function (User) {
			var oModel = new JSONModel(User);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createInformationModel: function (oComponent) {
			var oMetadata = oComponent.getMetadata();
			var oManifest = oMetadata._oManifest;
			var oModel = new JSONModel();

			var oInformation = {
				appVersion: oManifest._oManifest["sap.app"].applicationVersion.version,
				ui5Version: sap.ui.getVersionInfo().version,
				language: sap.ui.getCore().getConfiguration().getLocale().getSAPLogonLanguage()
			};
			oModel.setData(oInformation);
			return oModel;
		},

		createUserModel: function (User) {
			var oModel = new JSONModel(User);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createNavLinksModel: function (NavLinks) {
			var oModel = new JSONModel(NavLinks);
			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		},

		createMessageManagerModel: function () {
			var oModel = new JSONModel({
				MandatoryInputValue: "",
				DateValue: null,
				IntegerValue: undefined,
				Dummy: ""
			});
			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		},

		createDefaultInformationModel: function (defaultValues) {
			var oModel = new JSONModel(defaultValues);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}
	};
});