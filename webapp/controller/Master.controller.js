sap.ui.define([
    "project1/controller/BaseController",
    "sap/m/MessageToast",
    "project1/util/Validations",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/f/LayoutType",
    "sap/ui/model/Sorter"
], (BaseController, MessageToast, Validations, Filter, FilterOperator, LayoutType, Sorter) => {
    "use strict";

    return BaseController.extend("project1.controller.Master", {
        onInit() {
        },

        //ADD BTN MAIN PAGE
        _createAddDialog: async function() {
            if(!this._oAddDialog) {
                this._oAddDialog = await this.loadFragment({
                    name: "project1.view.fragments.AddProductDialog"
                });

                this.getView().addDependent(this._oAddDialog);
                this._setupLiveValidations();
            }

            return this._oAddDialog;
        },

        onAddProductBtnPress: async function () {
            const oDialog = await this._createAddDialog();
            const oModel = this.getModel("oDataV2Model");
            const oContext = oModel.createEntry("/Products", {
                properties: {
                    Name: "",
                    Description: "",
                    ReleaseDate: null,
                    DiscontinuedDate: null,
                    Rating: null,
                    Price: null
                }
            });

            oDialog.setBindingContext(oContext, "oDataV2Model");
            oDialog.open();
        },

        onSaveDialogBtnPress: function () {
            if(!this._validateRequiredFields()) {
                MessageToast.show("Please correct the errors before saving.");
                return;
            }

            const oDialog = this._oAddDialog;
            const oModel = this.getModel("oDataV2Model");

            oModel.submitChanges({
                success: () => {
                    oDialog.close();
                    oModel.refresh(true);
                    this._resetDialogFields();
                },
                error: () => {
                    MessageToast.show("Error saving changes");
                }  
            });
        },

        _setupLiveValidations: function() {
            this._validations = {
                "newProductName" : {fn: Validations.isNotEmpty, msg: "Name cannot be empty"},
                "newProductDescription" : {fn: Validations.isNotEmpty, msg: "Description cannot be empty"},
                "newProductReleaseDate" : {fn: Validations.isValidDate, msg: "Release Date is invalid"},
                "newProductDiscontinuedDate" : {fn: Validations.isValidDate, msg: "Discontinued Date is invalid"},
                "newProductRating" : {fn: Validations.isPositiveNumber, msg: "Rating must be a positive number"},
                "newProductPrice" : {fn: Validations.isPositiveNumber, msg: "Price must be a positive number"}
            }
        },

        onLiveValidationChange: function (oEvent) {
            const oInput = oEvent.getSource();
            const sInputId = oInput.getId().split("--").pop();
            const oValidation = this._validations[sInputId];

            if(oValidation) {
                oValidation.fn(oInput, oValidation.msg);
            }
        },

        _validateRequiredFields: function() {
            let bValid = true;
        
            for (let sId in this._validations) {
                const oControl = this.byId(sId);
                const validator = this._validations[sId];
        
                if (oControl && validator) {
                    if (!validator.fn(oControl, validator.msg)) {
                        bValid = false;
                    }
                }
            }
        
            return bValid;
        },

        onCancelDialogBtnPress: function () {
            const oModel = this.getModel("oDataV2Model");
            oModel.resetChanges();
            this._resetDialogFields();
            this._oAddDialog.close();
        },

        _resetDialogFields: function() {
            const oDialog = this._oAddDialog;
            const oControls = oDialog.getContent()[0].getItems();

            oControls.forEach(oControl => {
                if(oControl.setValueState) {
                    oControl.setValueState("None");
                }
            });
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

        onFilterDialogSave: function(oEvent) {
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