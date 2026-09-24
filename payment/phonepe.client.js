const { StandardCheckoutPayRequest } = require("@phonepe-pg/pg-sdk-node");
const { phonePeClient } = require("./config/phonepe.config");
const crypto = require("crypto");
const dotenv = require('dotenv');
dotenv.config();


const paymentService = {

    /**
    * Maps PhonePe order state into internal payment state.
    * Extend this mapping if PhonePe introduces additional states.
    */
    async mapPaymentStatus(phonePeState) {
        switch ((phonePeState || "").toUpperCase()) {
            case "COMPLETED":
                return "SUCCESS";

            case "FAILED":
                return "FAILED";

            case "PENDING":
                return "PENDING";

            case "EXPIRED":
                return "EXPIRED";

            default:
                return "UNKNOWN";
        }
    },

    /**
     * Generates a unique merchant transaction id. Example: PHN_20260705_6A8E5F01D2B7
    */
    async generateMerchantOrderId() {

        const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomValue = crypto.randomUUID().toUpperCase();

        return `PHN_${currentDate}_${randomValue}`;
    },

    // Verifies the latest payment status from PhonePe.
    async verifyPaymentStatus(merchantOrderId) {
        if (!merchantOrderId) {
            throw new Error("Merchant Order Id is required.");
        }
        return phonePeClient.getOrderStatus(merchantOrderId);
    },

    // Creates payment order on PhonePe.
    async createPhonePeOrder(paymentRecord, price, modulePath) {
        // Convert price in ₹ rupee in paise.
        const amountInPaise = Math.round(price * 100);
        const redirectURL = `${process.env.NAVIGATE_URL}/${modulePath}/payment-success`;

        const paymentRequest = StandardCheckoutPayRequest.builder()
            .merchantOrderId(paymentRecord.merchant_order_id)
            .amount(amountInPaise)
            .redirectUrl(redirectURL)
            .build();

        return phonePeClient.pay(paymentRequest);
    },

    //Validate webhook signature.
    async validatePhonePeCallback(headers, body) {
        const callbackResponse = phonePeClient.validateCallback(
            process.env.PHONEPE_WEBHOOK_USERNAME, process.env.PHONEPE_WEBHOOK_PASSWORD,
            headers.authorization, JSON.stringify(body)
        );
        return callbackResponse;
    }

};


module.exports = paymentService;