const {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient();

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
    };

    // Handle preflight (OPTIONS) requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'CORS preflight handled' }),
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { username, password } = body;

        if (!username || !password) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Username and password are required' }),
            };
        }

        const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
            },
        });

        const response = await client.send(command);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: "Login successful",
                idToken: response.AuthenticationResult.IdToken,
                accessToken: response.AuthenticationResult.AccessToken,
            }),
        };
    } catch (err) {
        const errorMessage =
            err.name === "NotAuthorizedException" || err.name === "UserNotFoundException"
                ? "Invalid username or password"
                : err.message;

        return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: errorMessage }),
        };
    }
};
