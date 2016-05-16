const AWS = require('aws-sdk');

AWS.config.update({
  region: "eu-west-1",
});

const dynamodbClient = new AWS.DynamoDB.DocumentClient();
const dynamoTableName = "tracker-data-store-config-PROD";

module.exports = function (key) {
    
    const params = {
        TableName: dynamoTableName,
        Key: {
            "key": key
        }
    }
    
    return new Promise((resolve, reject) => {
        dynamodbClient.get(params, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            
            if (!data.Item || !data.Item.value) {
                reject("No config found for key: " + key);
                return;
            }
            
            resolve(data.Item.value);
        });
    });
}