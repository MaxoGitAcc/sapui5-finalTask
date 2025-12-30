sap.ui.define([
    "project1/controller/BaseController",
    "sap/m/MessageToast",
    "project1/util/Validations",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/f/LayoutType",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox"
], (BaseController, MessageToast, Validations, Filter, FilterOperator, LayoutType, Sorter, MessageBox) => {
    "use strict";

    return BaseController.extend("project1.controller.Master", {
        onInit() {
        },

        //ADD BTN MAIN PAGE
        onAddProductBtnPress: function () {
            const oModel = this.getModel("oDataV2Model");
        
            const oContext = oModel.createEntry("/Products", {
                properties: {
                    Name: "",
                    Description: "",
                    ReleaseDate: null,
                    DiscontinuedDate: null,
                    Rating: null,
                    Price: null,
                    isEditMode: true
                }
            });
        
            this.getOwnerComponent()._createdProductPath = oContext.getPath();
            this.getOwnerComponent().getRouter().navTo("Detail", {productId: "new"});
        
            this.getView().getParent().getParent().setLayout(LayoutType.TwoColumnsMidExpanded);
        },


        //SEARCH FIELD MAIN PAGE
        onSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue");
            const oList = this.byId("productList");
            const oBinding = oList.getBinding("items");
        
            let aFilters = [];
        
            if (sQuery) {
                aFilters.push( 
                    new Filter({path: "Name", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false})
                );
            }
        
            oBinding.filter(aFilters);
        },


        
        //Filter
        _createFilterDialog: async function() {
            if (!this._oFilterDialog) {
                this._oFilterDialog = await this.loadFragment({
                    name: "project1.view.fragments.FilterDialog"
                });

                this.getView().addDependent(this._oFilterDialog);
            }

            return this._oFilterDialog;
        },

        onFilterBtnPress: async function() {
            const oDialog = await this._createFilterDialog();
            oDialog.open();
        },

        onFilterDialogCancel: function() {
            this._oFilterDialog.close();
        },

        onFilterDialogApply: function(oEvent) {
            const oDialog = oEvent.getSource().getParent();
            const oRadioGroup = oDialog.getContent()[0].getItems()[0];
            const iSelected = oRadioGroup.getSelectedIndex();        
            const oList = this.byId("productList");
            const oBinding = oList.getBinding("items");
        
            let oSorter;
            switch (iSelected) {
                case 0: oSorter = new Sorter("Price", false); break;
                case 1: oSorter = new Sorter("Price", true); break;
                case 2: oSorter = new Sorter("Name", false); break;
                case 3: oSorter = new Sorter("Name", true); break;
            }
        
            if (oSorter) oBinding.sort(oSorter);
        
            oDialog.close();
        },


        //NAVIGATION TO DETAIL PAGE
        onListProductPressed: function(oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext("oDataV2Model");
        
            const oFCL = this.getView().getParent().getParent();
            oFCL.setLayout(LayoutType.TwoColumnsMidExpanded);
        
            oRouter.navTo("Detail", {
                productId: oContext.getProperty("ID")
            });
        }
    });
});