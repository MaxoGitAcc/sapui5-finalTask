sap.ui.define([
    "project1/controller/BaseController",
    "project1/util/Validations",
    "project1/util/DateFormatter",
    "sap/f/LayoutType",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, Validations, DateFormatter, LayoutType, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("project1.controller.Detail", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("Detail")
                .attachPatternMatched(this._onRouteMatched, this);
        },        

        formatter: DateFormatter,

        _onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            const bIsNew = oArgs.productId === "new";
        
            let sPath;
        
            if (bIsNew) {
                sPath = this.getOwnerComponent()._createdProductPath;
            } else {
                sPath = "/Products(" + oArgs.productId + ")";
            }
        
            this.getView().bindElement({
                path: sPath,
                model: "oDataV2Model"
            });
        
            const oContext = this.getView().getBindingContext("oDataV2Model");
            oContext.setProperty("isEditMode", bIsNew);
        
            this.getView().getParent().getParent().setLayout(LayoutType.TwoColumnsMidExpanded);
        
            this._setupLiveValidations();
        },

        onCloseDetailScreen: function() {
            const oFCL = this.getView().getParent().getParent();
            oFCL.setLayout(LayoutType.OneColumn);
        
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteMain", {}, true);
        },


        //EDIT && ADD BTN
        onDetailEditBtnPress: function() {
            const oContext = this.getView().getBindingContext("oDataV2Model");
            oContext.setProperty("isEditMode", true);
        },

        onSaveProduct: function () {
            if (!this._validateRequiredFields()) {
                return;
            }
        
            const oModel = this.getModel("oDataV2Model");
            const oContext = this.getView().getBindingContext("oDataV2Model");
            const bIsNew = oContext.isTransient();
        
            if (bIsNew) {
                delete oContext.getObject().isEditMode;
            }
        
            oModel.submitChanges({
                success: () => {
                    this._resetDialogFields();
        
                    const oBundle = this.getModel("i18n").getResourceBundle();
        
                    if (bIsNew) {
                        this.getModel("oDataV2Model").refresh(true);

                        const sNewId = oContext.getProperty("ID");
        
                        delete this.getOwnerComponent()._createdProductPath;
        
                        MessageToast.show(oBundle.getText("productCreatedSuccessfullyAlert"));
        
                        this.getOwnerComponent().getRouter().navTo("Detail", {productId: sNewId}, true);
        
                        return;
                    }
        
                    MessageToast.show(oBundle.getText("productEditedSuccessfullyAlert"));
        
                    oContext.setProperty("isEditMode", false);
                },
                error: (oError) => {this._showODataErrorV2(oError, "errorWhenSavingProduct");}
            });
        },
        
        onCancelProduct: function () {
            const oModel = this.getModel("oDataV2Model");
            const oContext = this.getView().getBindingContext("oDataV2Model");
            const bIsNew = oContext.isTransient();
        
            if (bIsNew) {
                oModel.deleteCreatedEntry(oContext);
        
                delete this.getOwnerComponent()._createdProductPath;
                
                this._resetDialogFields();
                this.onCloseDetailScreen();
                return;
            }
        
            oModel.resetChanges([oContext.getPath()], true);
            oContext.setProperty("isEditMode", false);
        
            this._resetDialogFields();
        },
        
        _setupLiveValidations: function() {
            const oBundle = this.getModel("i18n").getResourceBundle();
            this._validations = {
                "EditedProductName" : {fn: Validations.isNotEmpty, msg: oBundle.getText("nameInputValidationMsg")},
                "EditedProductDescription" : {fn: Validations.isNotEmpty, msg: oBundle.getText("descriptionInputValidationMsg")},
                "EditedProductReleaseDate" : {fn: Validations.isValidDate, msg: oBundle.getText("releaseDateInputValidationMsg")},
                "EditedProductDiscontinuedDate" : {fn: Validations.isValidDate, msg: oBundle.getText("discontinuedDateInputValidationMsg")},
                "EditedProductRating" : {fn: Validations.isRaitngNumber, msg: oBundle.getText("ratingInputValidationMsg")},
                "EditedProductPrice" : {fn: Validations.isPositiveNumber, msg: oBundle.getText("priceInputValidationMsg")}
            };
        },

        onLiveValidationChangeEM: function(oEvent) {
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

        _resetDialogFields: function() {
            for (let sId in this._validations) {
                const oControl = this.byId(sId);
        
                if (oControl) {
                    oControl.setValueState("None");
                }
            }
        },

        //Delete BTN
        onDetailDeleteBtnPress: function() {
            const oModel = this.getModel("oDataV2Model");
            const sPath = this.getView().getBindingContext("oDataV2Model").getPath();
            const oBundle = this.getModel("i18n").getResourceBundle();

            oModel.remove(sPath, {
                success: () => {
                    MessageToast.show(oBundle.getText("productDeletedSuccessfullyAlert"));
                    this.onCloseDetailScreen();
                },
                error: (oError) => {this._showODataErrorV2(oError, "errorWhenDeletingProduct");}   
            });
        },

        _showODataError: function (oError, sI18nKey) {
            const oBundle = this.getModel("i18n").getResourceBundle();
            const sFallback = oBundle.getText(sI18nKey);
        
            let sMessage = "";
        
            try {
                if (oError?.responseText) {
                    const oErrObj = JSON.parse(oError.responseText);
                    sMessage = oErrObj?.error?.message?.value || "";
                } else if (oError?.message) {
                    sMessage = oError.message;
                }
            } catch (e) {
                console.warn("Error parsing backend response:", e);
            }
        
            MessageBox.error(sMessage || sFallback);
        }
    });
});
