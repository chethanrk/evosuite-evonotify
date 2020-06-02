sap.ui.define(["sap/ui/model/odata/AnnotationHelper", "sap/base/Log"],
    function (oDataAnnotationHelper, Log) {
        "use strict";

        /**
         * resolve annotation path saved in JsonModel
         * @public
         */
        var resolveModelPath = function(oAnnotationPathContext) {
            var sAnnotationPath = oAnnotationPathContext.getObject();
            var oModel = oAnnotationPathContext.getModel();
            var oMetaModel = oModel.getProperty("/metaModel");
            var oEntitySet = oMetaModel.getODataEntitySet(oModel.getProperty("/entitySet"));
            var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
            var oMetaContext = oMetaModel.createBindingContext(oEntityType.$path + "/" + sAnnotationPath);
            return oMetaContext;
        };

        return {
            resolveModelPath: resolveModelPath
        };

    },
    /* bExport= */true);
