const config = require('../../config');

const quickBookApiList = module.exports;
const baseUrl = config.quickbooks.mode.type === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://api.intuit.com';

quickBookApiList.apiList = {
    company: {
        companyDetail: {
            returnComDetUrl: function (data) {
                return `${baseUrl}/v3/company/${data.companyId}/companyinfo/${data.companyId}`
            }
        },
    },
    customer: {
        createCustomer: {
            returnCreCustUrl: function (data) {
                return `${baseUrl}/v3/company/${data.companyId}/customer`
            }
        },
        createCusItm: {
            returnCreCusItm: function(data) {
                return `${baseUrl}/v3/company/${data.companyId}/item`
            }
        },
        createCusInvoice: {
            returnCreCusInv: function(data) {
                return `${baseUrl}/v3/company/${data.companyId}/invoice`
            }
        },
        sendInvMail: {
            returnSendInvMail: function(data) {
                return `${baseUrl}/v3/company/${data.companyId}/invoice/${data.invoiceId}/send?sendTo=${data.email}`
            }
        },
    },
}