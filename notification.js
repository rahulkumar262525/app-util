const axios = require('axios');
const appsec  = require('./appsec');
const dotenv = require('dotenv');
dotenv.config();

const notification = {

   sendNotification : async (mailNotificationDetails) => {

    if(!mailNotificationDetails.eventId || !mailNotificationDetails.notificationReqBody)
    {
        return 'eventId & notificationReqBody is required.'
    }

    // Notification API URL
    let api = process.env.NOTIFICATION_API
    const url = `${api}/api/notification/v1/notificationRequest`;

    // Get the encrypted key
    const encryptedKey = await appsec.encrptKey();

    const consume_User = {
        "eventTypeId": mailNotificationDetails.eventId,
        "tenantId": mailNotificationDetails.tenantId || '',
        "mailTo": mailNotificationDetails.recipientEmail || '',
        "mailCc": mailNotificationDetails.mailCC || '',
        "mailBcc": mailNotificationDetails.mailBCC || '',
        "mailBody": mailNotificationDetails.notificationReqBody
    }

    try {
        // Set headers with the encrypted key
        const headers = {
            'x-key': encryptedKey,
            'x-dtoken': JSON.stringify({ userid: mailNotificationDetails.recipientEmail || '' })
        };

        const response = await axios.post(url, consume_User, { headers });

        if (response.data.status === "success") {
            return true;
        }
    } catch (error) {

        return error;
    }
}
}

module.exports = notification;