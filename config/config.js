var util = module.exports;

util.quickbooks = {
    sandbox: { // For Development
        clientId: 'ABbWZxEopYs0AbeMiK23UJMGfB5rwN7qvqPyI5Hv5zCkxa9XGx',
        clientSecret: 'EJSiwfpATWTkbasojxVxhaac5Rmn0SlWqwRFQFIC',
        environment: 'sandbox',
        redirectUri: 'http://localhost:3000/get/Oauth2Token',
    },

    production: { // For Production
        clientId: 'ABECtFQSwA4t15OpWhUBgSSY70wzvlx6OWDTMRAQVtdFSWdME5',
        clientSecret: 'sR58KXtUW5bpP2im9jNnze5uzSGFIL1ymBoFSC1g',
        environment: 'sandbox',
        redirectUri: 'http://localhost:3000/get/Oauth2Token',
    },

    mode: { // For Development
        type: 'sandbox' // sandbox || production
    },

    relamId: {
        sandbox: '4620816365074506790',
        production: ''
    }
}

util.customerDumy = {
    "DisplayName": "Grab a Bite",
    "Title": "Grab",
    "MiddleName": "Along",
    "PrimaryEmailAddr": {
        "Address": "grab@mailinator.com"
    },
    "PrimaryPhone": {
        "FreeFormNumber": "(91) 8956853562"
    }
}

util.itemDummy = {
    "Name": "BP Test",
    "Description": "Pay For BP",
    "IncomeAccountRef": {
      "value": "1",
      "name": "Services"
    },
    "Type": "Service"
}

util.invoiceDumy = {
    "Line": [
      {
        "Amount": 100.00,
        "DetailType": "SalesItemLineDetail",
        "SalesItemLineDetail": {
          "ItemRef": {
            "value": "24", // Customer Item Id
            "name": "BP Test" // Customer Item Name
          },
          "Qty": 2
        }
      }
    ],
    "CustomerRef": {
      "value": "68" // Customer Id
    }
  }