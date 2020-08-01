const OAuthClient = require('intuit-oauth');
const config = require('../../config');
const url = require('url');
const BookAuth = require('../../../app/models/auth');
const quickBookApi = require('./quick-books-api');
const Customer = require('../../../app/models/customer');
const ObjectID = require('mongodb').ObjectID;
const CusItem = require('../../../app/models/item');
const CusInv = require('../../../app/models/invoice');

var OAuth = module.exports;

const oauthClient = new OAuthClient(config.quickbooks.mode.type === 'sandbox' ? config.quickbooks.sandbox : config.quickbooks.production);

// AuthorizationUri

const authUri = oauthClient.authorizeUri({
        scope: [OAuthClient.scopes.Payment, OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
        state: 'testState',
      });

OAuth.requestAccessToken = function requestAccessToken (res) {
    res.redirect(authUri);
}

OAuth.getOAuth2Token = function getOAuth2Token (parsedToken, res) {
    try {
        oauthClient
        .createToken(parsedToken)
        .then(async(authResponse) => {
                let query = url.parse(parsedToken, true);
                let addAuthCred = {
                    oAuth2Token: JSON.parse(JSON.stringify(authResponse.getToken())),
                    redirectRes: query.query
                }
                await BookAuth.addAuthCred(addAuthCred);
                return res.send({status: 'success', message: 'Auth Key Generated Successfully'});
        })
        .catch((err) => {
            return res.send({status: 'error', message: err.message});
        })
    } catch (error) {
        return res.send({status: 'error', message: err.message});
    }

}

function getValidToken(relamId) {
    try {
        let authDetails = BookAuth.findOne({'redirectRes.realmId': relamId});

        return authDetails.then((foundAuthDetails) => {
            if(!foundAuthDetails) throw new Error(`Company Not Registered To QuickBooks`);

            oauthClient.setToken(foundAuthDetails.oAuth2Token);

            if(oauthClient.isAccessTokenValid()) {
                return {
                    authDetails: foundAuthDetails,
                    valid: true
                };
            }

            if(!oauthClient.isAccessTokenValid()) {
                return {
                    authDetails: foundAuthDetails,
                    valid: false
                };
            }
            })
            .catch((error) => {
                throw new Error(error.message)
            })

    } catch (error) {
        throw new Error(error.message)
    }
}

async function refreshToken(expiredData) {
    try {
    oauthClient.setToken(expiredData.oAuth2Token);

    let refreshedToken = await oauthClient.refresh(expiredData.oAuth2Token.refresh_token);
    let parsedRefreshedToken = JSON.parse(JSON.stringify(refreshedToken.getToken()))
    let updatedAuthCred = await BookAuth.findOneAndUpdate({'redirectRes.realmId': config.quickbooks.mode.type === 'sandbox' ? config.quickbooks.relamId.sandbox : config.quickbooks.relamId.production},
    {
        'oAuth2Token.x_refresh_token_expires_in': parsedRefreshedToken.x_refresh_token_expires_in,
        'oAuth2Token.refresh_token': parsedRefreshedToken.refresh_token,
        'oAuth2Token.access_token': parsedRefreshedToken.access_token,
        'oAuth2Token.token_type': parsedRefreshedToken.token_type,
        'oAuth2Token.expires_in': parsedRefreshedToken.expires_in,
        'oAuth2Token.createdAt': parsedRefreshedToken.createdAt,


    },{new: true, useFindAndModify: false});
    return updatedAuthCred;

    } catch (error) {
        throw new Error(error)
    }
}

OAuth.companyDetails = async function companyDetails() {
    try {
        return getValidToken(config.quickbooks.mode.type === 'sandbox' ? config.quickbooks.relamId.sandbox : config.quickbooks.relamId.production)
        .then(async(vaildTokenDetails) => {
            let validToken = vaildTokenDetails.valid ? vaildTokenDetails.authDetails : await refreshToken(vaildTokenDetails.authDetails);
            let getData = {
                module: 'company',
                subModule: 'companyDetail',
                functionName: 'returnComDetUrl',
                companyId: validToken.redirectRes.realmId,
                authDetails: validToken.oAuth2Token.access_token
            }
            let compDetRes = await quickBookApi.getApi(getData);
            return compDetRes.data
        })
        .catch((error)=> {
            throw new Error(error.message);
        })
    } catch (error) {
        throw new Error(error.message)
    }
}

OAuth.addCustomer = function addCustomer() {
    try {
        return getValidToken(config.quickbooks.mode.type === 'sandbox' ? config.quickbooks.relamId.sandbox : config.quickbooks.relamId.production)
        .then(async(vaildTokenDetails) => {

            let validToken = vaildTokenDetails.valid ? vaildTokenDetails.authDetails : await refreshToken(vaildTokenDetails.authDetails);
            let postData = {
                module: 'customer',
                subModule: 'createCustomer',
                functionName: 'returnCreCustUrl',
                companyId: validToken.redirectRes.realmId,
                authDetails: validToken.oAuth2Token.access_token
            }
            let customerDetails = await Customer.addCust(config.customerDumy);

            if(customerDetails.exist) {
                throw new Error('Customer Already Created')
            }

            if(!customerDetails.exist) {
                postData.bodyData = {
                    'DisplayName': customerDetails.customerDetails.DisplayName,
                    'Title': customerDetails.customerDetails.Title,
                    'MiddleName': customerDetails.customerDetails.MiddleName,
                    'PrimaryEmailAddr': customerDetails.customerDetails.PrimaryEmailAddr,
                    'PrimaryPhone': customerDetails.customerDetails.PrimaryPhone,
                };
                let quickbookCust = await quickBookApi.postApi(postData);
                await Customer.findByIdAndUpdate({_id: ObjectID(customerDetails.customerDetails._id)},{quickBookCustId: quickbookCust.data.Customer.Id},{useFindAndModify: false});
                return quickbookCust;
            }

        })
        .catch((error)=> {
            throw new Error(error.message);
        })

    } catch (error) {

        throw new Error(error.message)
    }
}

OAuth.createItem = function createItem(customerId) {
    try {
        return getValidToken(config.quickbooks.mode.type === 'sandbox' ? config.quickbooks.relamId.sandbox : config.quickbooks.relamId.production)
        .then(async(vaildTokenDetails) => {

            let validToken = vaildTokenDetails.valid ? vaildTokenDetails.authDetails : await refreshToken(vaildTokenDetails.authDetails);
            let postData = {
                module: 'customer',
                subModule: 'createCusItm',
                functionName: 'returnCreCusItm',
                companyId: validToken.redirectRes.realmId,
                authDetails: validToken.oAuth2Token.access_token,
            }
            config.itemDummy.customerId = customerId;
            let custItmDetails = await CusItem.addCusItm(config.itemDummy);


            if(custItmDetails.exist) {
                throw new Error('Customer Item Already Added')
            }

            if(!custItmDetails.exist) {
                postData.bodyData = {
                    'Name': custItmDetails.itemDetails.Name,
                    'IncomeAccountRef': custItmDetails.itemDetails.IncomeAccountRef,
                    'Type': custItmDetails.itemDetails.Type,
                    "Description": custItmDetails.itemDetails.Description
                };
                let quickbookCustItm = await quickBookApi.postApi(postData);
                await CusItem.findByIdAndUpdate({_id: ObjectID(custItmDetails.itemDetails._id)},{
                    quickBookItemId: quickbookCustItm.data.Item.Id,
                    Active: quickbookCustItm.data.Item.Active,
                    FullyQualifiedName: quickbookCustItm.data.Item.FullyQualifiedName,
                    Taxable: quickbookCustItm.data.Item.Taxable,
                    UnitPrice: quickbookCustItm.data.Item.UnitPrice,
                    PurchaseCost: quickbookCustItm.data.Item.PurchaseCost,
                    TrackQtyOnHand: quickbookCustItm.data.Item.TrackQtyOnHand,
                    domain: quickbookCustItm.data.Item.domain,
                    MetaData: quickbookCustItm.data.Item.MetaData,
                },{useFindAndModify: false});
                return quickbookCustItm;
            }
        })
        .catch((error)=> {
            throw new Error(error.message);
        })

    } catch (error) {
        throw new Error(error.message)
    }
}

OAuth.createInvoice = async function createInvoice(customerId, itemId) {
    try {
        return getValidToken(config.quickbooks.mode.type === 'sandbox' ? config.quickbooks.relamId.sandbox : config.quickbooks.relamId.production)
        .then(async(vaildTokenDetails) => {

            let validToken = vaildTokenDetails.valid ? vaildTokenDetails.authDetails : await refreshToken(vaildTokenDetails.authDetails);
            let postData = {
                module: 'customer',
                subModule: 'createCusInvoice',
                functionName: 'returnCreCusInv',
                companyId: validToken.redirectRes.realmId,
                authDetails: validToken.oAuth2Token.access_token,
                bodyData: config.invoiceDumy
            }
            let cusInvDetails = await CusInv.addCustInv({itemId: itemId, customerId: customerId});
            let quickBookInv = await quickBookApi.postApi(postData);

            if(quickBookInv.data) {
                await CusInv.findByIdAndUpdate({_id: ObjectID(cusInvDetails._id)},{
                    custInvId: quickBookInv.data.Invoice.Id
                },{upsert: true, useFindAndModify: false})
            }
            sendInvoiceEmail(cusInvDetails._id, validToken.redirectRes.realmId, validToken.oAuth2Token.access_token)
            return quickBookInv;

        })
        .catch((error)=> {
            throw new Error(error.message);
        })

    } catch (error) {
        throw new Error(error.message)
    }
}


async function sendInvoiceEmail(invoiceId, companyId, authDetails) {
    try {
        let invDetails = await CusInv.findById({_id: ObjectID(invoiceId)});
        let customerDetails = await Customer.findById({_id: ObjectID(invDetails.customerId)});

        let sendInvEmail = {
            module: 'customer',
            subModule: 'sendInvMail',
            functionName: 'returnSendInvMail',
            companyId: companyId,
            authDetails: authDetails,
            invoiceId: invDetails.custInvId,
            email: customerDetails.PrimaryEmailAddr.Address,
            contentType: 'email',
            bodyData: {},
        }

        await quickBookApi.postApi(sendInvEmail)


    } catch (error) {
        throw new Error(error.message);
    }
}

