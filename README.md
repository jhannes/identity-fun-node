# Identity fun

Training application to further understanding of OpenID Connect and Oauth2.

## Why should you care about OpenID Connect?

The advantage of OpenID Connect is the fact that it's standardized and widely adopted. This means that a library or tool designed to work with, e.g. Google accounts, can easily be adopted to work with e.g. Microsoft's Active Directory  or the Norwegian national ID provider ID-porten.

Different Identity providers can support different levels of trust between you and your users.

The protocol is perceived with an air of mystery by many developers, but it's surprisingly simple to master. As a developer, you owe yourself and your users to play with OpenID Connect before you ever implement a username+password.


## Assignment #1: Simulate an authentication flow with Postman

The following Postman collection has documentation and examples for you to follow: https://documenter.getpostman.com/view/1467877/RzZFDwaY


## Assignment 2: Create an Open ID Connect application (Java version)

### Task 0: Make sure the application runs

Run `npm start`. The server should start on port 8080 (change `start.js` if this port is unavailable). Go to http://localhost:8080. You should see a welcome page with the option of authorizing with several providers.

Try to select Login with Google. It will generate a link that is invalid. Your task is to fix this

### Task 1: Fix the authentication url

The authentication URL requires several HTTP parameters that are currently missing. Your task is to construct a correct request in `app.get("/id/:provider/authenticate"` in `start.js`.

### Task 2: Create a Open ID Connect application with your first provider

The file `config.local.js` should contain your credentials. Your first task is to get the necessary values for the Google authentication app. You need to find out what properties are needed for the authentication and token requests and where to find them in the [Google Developer Console](https://console.developers.google.com/apis/credentials)

config.local.js should look like this:

```
module.exports = {
    "google": {
        client_id: "...",
        client_secret: "...",
        redirect_uri: "..."
    },
    "microsoft": {
        client_id: "...",
        client_secret: "...",
        redirect_uri: "..."
    },
    "idporten": {
        client_id: "...",
        client_secret: "...",
        redirect_uri: "..."
    },
};
```

### Task 3: Complete the authentication flow

If you restart the application after Task 1 and Task 2, the application will let you get an authorization code. In order to actually authenticate the user, you need to exchange this code for a token. Add the necessary parameters to the payload in `app.get("/id/:provider/oauth2callback"` in `start.js`.

### Task 4: Try out a complete authorization flow

You can verify the contents to the id_token at https://jwt.io

### Task 5: Complete Microsoft provider

As with task 1, create Active Directory credentials in [Azure Portal](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal) - [App Registration Blade](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade) and put `client_id`, `client_secret` and `redirect_uri` into `config.local.js`.

Restart the server and verify that you can authenticate with Microsoft.

### Task 6: Setup ID-porten credentials

In order to setup ID-porten for test or production, you need to [Request credentials](https://difi.github.io/idporten-oidc-dokumentasjon/) for ID-porten and put `client_id`, `client_secret` and `redirect_id` in `config.local.js`.

Johannes also has available test credentials that can be used for proof-of-concept testing.
