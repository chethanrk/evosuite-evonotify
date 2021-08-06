sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
    "use strict";
    var myBlock = BlockBase.extend("com.evorait.evosuite.evonotify.block.partnerdata.PartnerDataBlock", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.evorait.evosuite.evonotify.block.partnerdata.PartnerDataBlock",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.evorait.evosuite.evonotify.block.partnerdata.PartnerDataBlock",
                    type: "XML"
                }
            }
        }
    });
    return myBlock;
}, true);