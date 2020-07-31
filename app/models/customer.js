const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const quickBookCustomerSchema = new Schema({
    DisplayName: String, // The name of the person or organization as displayed. max character: maximum of 500 chars
    Title: String, // Title of the person. max character: maximum of 16 chars
    MiddleName: String, // Middle name of the person. max character: maximum of 100 chars
    FamilyName: {
        type: String,
        default: ''
    }, // Family name or the last name of the person. max character: maximum of 100 chars
    GivenName: {
        type: String,
        default: ''
    }, // Given name or first name of a person. max character: maximum of 100 chars
    quickBookCustId: String,
    PrimaryEmailAddr: {
        Address: String
    },
    PrimaryPhone: {
        FreeFormNumber: String
    },
    trno: {
        type: Number,
        default: Date.now()
    }
});

quickBookCustomerSchema.statics.addCust = async function addCust (data) {
    try {
        let foundCustomer = await this.findOne({DisplayName:{ $regex:  data.DisplayName, $options: 'i'}});
        if(foundCustomer) {
            return {
                exist: true,
                customerDetails: foundCustomer
            };
        } else {
            let Customer = mongoose.model('cust_info', quickBookCustomerSchema);
            let newCustomer = new Customer();

            newCustomer.DisplayName = data.DisplayName;
            newCustomer.Title = data.Title;
            newCustomer.MiddleName = data.MiddleName;
            // newCustomer.FamilyName = data.FamilyName;
            // newCustomer.GivenName = data.GivenName;
            newCustomer.PrimaryEmailAddr = data.PrimaryEmailAddr;
            newCustomer.PrimaryPhone = data.PrimaryPhone;

            let savedCustomer = await newCustomer.save();
            return {
                exist: false,
                customerDetails: savedCustomer
            };
        }
    } catch (error) {
        throw new Error(error.message)
    }
}


module.exports = mongoose.model('cust_info', quickBookCustomerSchema);