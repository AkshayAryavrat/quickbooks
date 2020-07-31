const apiList = require('./quick-books-api-list').apiList;
const axios = require('axios');

const apiCalling = module.exports;

apiCalling.postApi = async function(postData) {
    try {
        let requestBodyData = JSON.stringify(postData.bodyData);
        let postApiFunc = apiList[postData.module][postData.subModule][postData.functionName];
        let postApiUrl = postApiFunc(postData);

        var config = {
            method: 'post',
            url: postApiUrl,
            headers: {
              'accept': 'application/json',
              'authorization': `Bearer ${postData.authDetails}`,
              'content-type': 'application/json',
            },
            data: requestBodyData
          };

          let getPostResponse = await axios(config);
          return getPostResponse;


    } catch (error) {
        throw new Error(error)
    }

}

apiCalling.getApi = async function(getData) {
    try {
        let getApiFun = apiList[getData.module][getData.subModule][getData.functionName];
        let getApiUrl = getApiFun(getData);

          var config = {
            method: 'get',
            url: getApiUrl,
            headers: {
              'accept': 'application/json',
              'authorization': `Bearer ${getData.authDetails}`,
              'content-type': 'application/json',
            }
          };

          let getResponse = await axios(config);
          return getResponse;

    } catch (error) {
        throw new Error(error.message);
    }
}

