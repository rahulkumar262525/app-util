const { StandardCheckoutClient, Env } = require("@phonepe-pg/pg-sdk-node");
const dotenv = require('dotenv');
dotenv.config();

/**
 * Maps environment variable to PhonePe SDK Environment.
 */
function getPhonePeEnvironment() {

    switch (process.env.PAYMENT_MODE?.toUpperCase()) {

        case "PRODUCTION":
            return Env.PRODUCTION;

        default:
            return Env.UAT;
    }
}

/**
 * Singleton PhonePe Client :: Initialized once when application starts.
 */
const phonePeClient = StandardCheckoutClient.getInstance(

    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    Number(process.env.CLIENT_VERSION),
    getPhonePeEnvironment()
);

module.exports = { phonePeClient };