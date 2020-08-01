const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const quickBookCusItmSchema = new Schema({
    customerId: ObjectId,
    Name: String,
    Description: String,
    Active: Boolean,
    FullyQualifiedName: String,
    Taxable: Boolean,
    UnitPrice: Number,
    Type: String,
    IncomeAccountRef: {
        value: Number,
        name: String
    },
    PurchaseCost: Number,
    TrackQtyOnHand: Boolean,
    domain: String,
    quickBookItemId: String,
    SyncToken: String,
    MetaData: {
        CreateTime: Date,
        LastUpdatedTime: Date
    },
    trno: {
        type: Number,
        default: Date.now()
    }
});

quickBookCusItmSchema.statics.addCusItm = async function addCusItm(data) {
    try {
        let findItm = await this.findOne({customerId: ObjectID(data.customerId),
             Name: { $regex:  data.Name, $options: 'i'},
             Type: { $regex:  data.Type, $options: 'i'}
            });

        if(findItm) return {exist: true, itemDetails: findItm}

        let Item = mongoose.model('cust_itm', quickBookCusItmSchema);
        let newItem = new Item();

        newItem.customerId = data.customerId;
        newItem.Name = data.Name;
        newItem.IncomeAccountRef = data.IncomeAccountRef;
        newItem.Type = data.Type;
        newItem.Description = data.Description;

        let savedCusItm = await newItem.save();
        return {exist: false, itemDetails: savedCusItm}

    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = mongoose.model('cust_itm', quickBookCusItmSchema);