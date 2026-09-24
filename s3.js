const { PutObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const logger = require("./logger");


const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_KEY,
        secretAccessKey: process.env.AWS_SECRET,
    },
});

const s3Service = {
    /**
     * Generate pre-signed upload URL
     */
    async getUploadUrl(data) {
        try {
            const { fileName, fileType, tenantId, path = "uploads", expiry } = data;

            if (!fileName || !fileType || !tenantId) {
                return { success: false, message: "fileName, fileType and tenantId are required.", };
            }

            // Example:
            // uploads/12/171497378-file.png
            const key = `${path}/${tenantId}/${Date.now()}-${fileName}`;

            const command = new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET,
                Key: key,
                ContentType: fileType,
            });

            const uploadURL = await getSignedUrl(s3Client, command, {
                expiresIn: expiry || 60, // 1 min
            });

            return { success: true, uploadURL, key };
        } catch (error) {
            logger.error(`Error occurred in getUploadUrl: ${error}`);
            return { success: false, message: "Oops! Something went wrong." };
        }
    },

    /**
     * Generate pre-signed view URL
     */
    async getViewUrl(key, expiry) {
        try {
            if (!key) {
                return { success: false, message: "Key is required." };
            }

            const command = new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET,
                Key: key,
            });

            const viewURL = await getSignedUrl(s3Client, command, {
                expiresIn: expiry || 600, // 3 min
            });

            return { success: true, viewURL, };
        } catch (error) {
            logger.error(`Error occurred in getViewUrl: ${error}`);
            return { success: false, message: "Oops! Something went wrong.", };
        }
    },
};

module.exports = s3Service;