const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');
        const { username, password } = body;

        if (!username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Username and password are required' })
            };
        }

        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password
            }
        };

        const authResult = await cognito.initiateAuth(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Login successful',
                idToken: authResult.AuthenticationResult.IdToken,
                accessToken: authResult.AuthenticationResult.AccessToken
            })
        };
    } catch (err) {
        const errorMessage =
            err.code === 'NotAuthorizedException' || err.code === 'UserNotFoundException'
                ? 'Invalid username or password'
                : err.message;

        return {
            statusCode: 401,
            body: JSON.stringify({ error: errorMessage })
        };
    }
};