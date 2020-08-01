const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const cusInvoiceSchema = new Schema({
    itemId: ObjectId,
    customerId: ObjectId,
    trno: {
        type: Number,
        default: Date.now()
    },
    custInvId: String
});

cusInvoiceSchema.statics.addCustInv = async function addCustInv(data) {
    try {

        let CustInv = mongoose.model('cust_inv', cusInvoiceSchema);
        let newCusInv = new CustInv();

        newCusInv.itemId = data.itemId;
        newCusInv.customerId = data.customerId;

        let savedCustInv = await newCusInv.save();
        return savedCustInv;

    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = mongoose.model('cust_inv', cusInvoiceSchema);