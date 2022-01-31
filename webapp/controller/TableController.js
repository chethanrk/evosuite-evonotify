sap.ui.define([
	"com/evorait/evosuite/evonotify/controller/BaseController",
	"com/evorait/evosuite/evonotify/model/AnnotationHelper",
	"sap/ui/core/mvc/OverrideExecution",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, AnnotationHelper, OverrideExecution, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evonotify.controller.TableController", {

		metadata: {
			methods: {
				setDefaultUserVariant: {
					public: true,
					final: true
				},
				onInitializedSmartVariant: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				onBeforeRebindTable: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.After
				},
				getDefaultTableFiltersFromUrlParams: {
					public: true,
					final: true
				}
			}
		},

		/**
		 * sets default variant for user when it was set in backend customizing
		 * and only when not another default variant was selected from user
		 */
		setDefaultUserVariant: function (oControl) {
			if (!this.getOwnerComponent()) {
				return;
			}

			var oSmartVariant = oControl.getSmartVariant() || this.getView().byId(oControl.getId() + "-variant"),
				aControlVariantItems = oSmartVariant.getVariantItems();

			//set readonly of variants who are from other users
			this._setForeignVariantsReadOnly(aControlVariantItems);

			if (oSmartVariant.getCurrentVariantId() !== "" && oSmartVariant.getDefaultVariantKey() !== "*standard*") {
				return;
			}

			//wait for backend request
			this.getOwnerComponent().oDefaultUserVariantProm.then(function (aVariantNames) {
				if (!aVariantNames) {
					return;
				}
				//set default variant for this SmartFilterBar or SmartTable
				this._setDefaultSharedVariant(oSmartVariant, aVariantNames, oControl.getId());
			}.bind(this));
		},

		/**
		 * event when Variant mMnagment of SmartFilterBar or SmartTable was initialized
		 */
		onInitializedSmartVariant: function (oEvent) {
			this.setDefaultUserVariant(oEvent.getSource());
		},

		/**
		 * SmartTable before loading request
		 * set default SortOrder from annotations
		 */
		onBeforeRebindTable: function (oEvent) {
			this._setDefaultTableSorter(oEvent);
			this._setRequestAtLeastFields(oEvent);
		},

		/**
		 * collect all GET Url parameters
		 * and checks against entitySet if a porperty with parameter name exists
		 * when property exist is is allowed to filter create new filters
		 * returns Promise with array of filters
		 * @param sEntitySet
		 */
		getDefaultTableFiltersFromUrlParams: function (sEntitySet) {
			return new Promise(function (resolve) {
				var urlParams = this.getOwnerComponent().getLinkParameterByName(),
					aFilters = [];

				this.getModel().getMetaModel().loaded().then(function () {
					if (urlParams.entries) {
						var entries = this._getObjectEntries(urlParams);
						entries.forEach(function (pair) {
							var oFilter = this._getFilterable(pair[0], pair[1], sEntitySet);
							if (oFilter) {
								aFilters.push(oFilter);
							}
						}.bind(this));
					} else if (typeof urlParams === "object") {
						for (var key in urlParams) {
							if (urlParams.hasOwnProperty(key) && urlParams[key]) {
								var oFilter = this._getFilterable(key, urlParams[key][0], sEntitySet);
								if (oFilter) {
									aFilters.push(oFilter);
								}
							}
						}
					}
					resolve(aFilters);
				}.bind(this));
			}.bind(this));
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * set default SortOder from annotations for responsive tables
		 * For responsive table this annotation is not supported yet
		 */
		_setDefaultTableSorter: function (oEvent) {
			var oSource = oEvent.getSource(),
				mParams = oEvent.getParameters();

			if (oSource.getTableType() === sap.ui.comp.smarttable.TableType.ResponsiveTable) {
				var aSortItems = AnnotationHelper.getDefaultTableSorter(oSource, this.getModel());
				if (aSortItems.length > 0) {
					var aTableSorters = mParams.bindingParams.sorter;
					aSortItems.forEach(function (oSorter, index) {
						var hasProperty = aTableSorters.some(function (value) {
							return value.sPath === oSorter.sPath;
						});
						if (hasProperty) {
							aSortItems.splice(index, 1);
						}
					});
					mParams.bindingParams.sorter = aTableSorters.concat(aSortItems);
				}
			}
		},

		/**
		 * In some cases RequestAtLeast parameters from annotations are not set
		 * So this is workaround to set RequestAtLeast from annotations for SmartTable 
		 * @param oEvent
		 */
		_setRequestAtLeastFields: function (oEvent) {
			var oSource = oEvent.getSource(),
				mParams = oEvent.getParameters();
			var sRequestAtLeast = AnnotationHelper.getDefaultTableSelects(oSource, this.getModel(), mParams.bindingParams);
			if (sRequestAtLeast && sRequestAtLeast !== "") {
				mParams.bindingParams.parameters.select = sRequestAtLeast;
			}
		},

		/**
		 * @params oVMItems VariantManagment items
		 */
		_setForeignVariantsReadOnly: function (oVMItems) {
			//set readonly of variants who are from other users
			this.getOwnerComponent().oSystemInfoProm.then(function (oUser) {
				oVMItems.filter(function (oVariant) {
					return oVariant.getAuthor() !== oUser.Username;
				}).forEach(function (oForeignVariant) {
					oForeignVariant.setProperty("readOnly", true);
				});
			});
		},

		/**
		 * set default Variant based on page id and save variant names in customizing table
		 * @params oVm
		 * @param aSavedVNames
		 * @param sControlId
		 */
		_setDefaultSharedVariant: function (oVm, aSavedVNames, sControlId) {
			var aControlVariantItems = oVm.getVariantItems();

			//set default variant for this SmartFilterBar or SmartTable
			aSavedVNames.forEach(function (mSavedVName) {
				if (sControlId.indexOf(mSavedVName.PageId) >= 0) {
					var aDefaults = aControlVariantItems.filter(function (oVariant) {
						return oVariant.getText() === mSavedVName.DefaultVariant;
					});
					aDefaults.forEach(function (oDefaultVariant) {
						oVm.setCurrentVariantId(oDefaultVariant.getKey(), false);
						oVm.setDefaultVariantKey(oDefaultVariant.getKey());
						oVm.fireSave();
					});
					return false;
				}
				return false;
			});
		},

		/*
		 * Alternate function for Object.entries()
		 * @{obj} selected object entry
		 * returns object which has array of key and value
		 */
		_getObjectEntries: function (obj) {
			var aEntries = Object.keys(obj),
				aResArray = [];
			aEntries.forEach(function (avalue) {
				aResArray.push([avalue, obj[avalue][0]]);
			});
			return aResArray;
		},

		/**
		 * checks if key in metaModel is filterable true
		 * returns new filter
		 */
		_getFilterable: function (sKey, sValue, sEntitySet) {
			var oMetaModel = this.getModel().getMetaModel() || this.getModel().getProperty("/metaModel"),
				oEntitySet = oMetaModel.getODataEntitySet(sEntitySet),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
				oProperty = oMetaModel.getODataProperty(oEntityType, sKey);

			//is property found and allowed to filter?
			if (oProperty && (!oProperty.hasOwnProperty("sap:filterable") || oProperty["sap:filterable"] === "true")) {
				return new Filter(sKey, FilterOperator.EQ, sValue);
			}
			return null;
		}
	});
});