// This a Subscription Manager App where you can manage all your online subscription
const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, 'Please provide company name'],
        maxlength: 50
    },
    //Note that the default date format YYYY-MM-DD
    dueDate: {
        type: Date,
        required: [true, 'Please provide due date']
    },
    monthlyPayment: {
        type: Number,
        required: [true, 'Please provide monthly payment']
    },
    status: {
        type: String,
        enum: ['free trial', 'active', 'canceled'],
        default: 'free trial'
    },
    category: {
        type: String,
        enum: ['Entertainment & Liesure', 'Health & Fitness', 'Finance','Food', 'Clothing'],
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user']
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
