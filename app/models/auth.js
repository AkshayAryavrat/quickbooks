const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authSchema = new Schema({
    oAuth2Token: {
        x_refresh_token_expires_in: Number,
        refresh_token: String,
        access_token: String,
        token_type: String,
        expires_in: Number,
        id_token: String,
        realmId: String,
        createdAt: Number
    },
    redirectRes: {
        code: String,
        state: String,
        realmId: String
    }
});

authSchema.statics.addAuthCred = function addAuthCred (data) {
    let promise = this.findOne({'redirectRes.realmId': data.redirectRes.realmId})
    return promise.then((foundAuthCred) => {
        if(!foundAuthCred) {
            let Auth = mongoose.model('auth_info', authSchema);
            let newAuthCred = new Auth ();

            // Add oAuth2Token
            newAuthCred.oAuth2Token = data.oAuth2Token;

            // Add Redirect Response Info
            newAuthCred.redirectRes = data.redirectRes;

            return newAuthCred
        }
        if(foundAuthCred) throw new Error('Company Already Registered');
    })
    .then((saveAuthCred) => {
        saveAuthCred.save().then((savedAuthCred) => {
            return {newAuth: savedAuthCred}
        })
    })
    .catch((err)=> {
        throw new Error(err.message);
    })
}

module.exports = mongoose.model('auth_info', authSchema);