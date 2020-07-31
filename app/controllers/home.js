/*!
 * Module dependencies.
 */

 const OAuthToken = require('../../config/lib/quick-books/index');

exports.index = function(req, res) {
  res.render('home/index', {
    title: 'Node Express Mongoose'
  });
};

exports.requestOAut2Token = function requestOAut2Token (req, res) {
  OAuthToken.requestAccessToken(res);
}

exports.getOAuth2Token = function getOAuth2Token (req, res) {
  OAuthToken.getOAuth2Token(req.url, res);
}

exports.companyDetails = function(req, res) {
  try {
    OAuthToken.companyDetails()
    .then((companyDetails) => {
      return res.send({status: 'success', message: companyDetails})
    })
    .catch((error) => {
      return res.send({status: 'error', message: error.message})
    })
  } catch (error) {
    return res.send({status: 'error', message: error.message});
  }
}

exports.addCustomer = function addCustomer(req, res) {
  try {
    OAuthToken.addCustomer()
    .then((custAdded) => {
      return res.send({status: 'success', message: custAdded.data});
    })
    .catch((error) => {
      return res.send({status: 'error', message: error.message});
    })
  } catch (error) {
    return res.send({status: 'error', message: error.message});
  }
}

exports.sheetAlgo = function sheetAlgo(req, res) {

  let basicVertCellVal = {
    1: 'A',2: 'B',3: 'C',4: 'D',5: 'E',6: 'F',7: 'G',8: 'H',9: 'I',10: 'J',
    11: 'K',12: 'L',13: 'M',14: 'N',15: 'O',16: 'P',17: 'Q',18: 'R',19: 'S',20: 'T',
    21: 'U',22: 'V',23: 'W',24: 'X',25: 'Y',26: 'Z',
  }
  let value = Number(req.params.value);

  if(value > 26) {
    let remainder = (value % 26).toString();
    let quotient = parseInt(value / 26).toString()
    let returnCellValue = remainder === 0 ? `${basicVertCellVal[quotient -1]}Z` : `${basicVertCellVal[quotient]}${basicVertCellVal[remainder]}`;

    return res.send({status: 'success', message: 'Cell Value Exected', cellValue: returnCellValue});
  } else {
    return res.send({status: 'success', message: 'Cell Value Exected', cellValue: `${basicVertCellVal[req.params.value]}` });
  }
}

