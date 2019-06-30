const express = require("express");
const session = require('express-session')
const axios = require("axios");
const config = require("./config.local");

const qs = require("qs");

function randomString(length) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function printUrl(url) {
    return url
        .replace(/&/g, "<br />&nbsp;&nbsp;&nbsp;&nbsp;&")
        .replace(/\?/g, "<br />&nbsp;&nbsp;&nbsp;&nbsp;?")
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = decodeURIComponent(Buffer.from(base64Url, 'base64').toString('utf-8').split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(base64);
};

const app = express()

app.use(express.static('public'))
app.use(session({
    'secret': 'snsdnknannaga',
    resave: true,
    saveUninitialized: true
}));


app.get("/user", (req, res) => {
    const userSessions = req.session.userSessions || [];
    res.setHeader("Content-Type", "text/javascript");
    res.send(`displayUser(${JSON.stringify(userSessions)})`);
});


app.get("/id/:provider/authenticate", (req, res) => {
    const provider = providers[req.params.provider];

    const { domain_hint } = req.query;
    const { authorization_endpoint } = provider;

    const state = randomString(50);
    req.session.state = state;

    const authorization_request = authorization_endpoint + "?" + qs.stringify({
    });

    res.setHeader("Content-Type", "text/html");
    res.send(
        `<html>
            <h2>Step 1: Redirect to authorization endpoint</h2>
            <div><a href='${authorization_request}'>authenticate at ${authorization_endpoint}</a></div>
            <div>
                Normally your app would redirect directly to the following URL: <br />
                <code>${printUrl(authorization_request)}</code>
            </div>
        </html>`);
});

app.get("/id/:provider/oauth2callback", (req, res) => {
    const provider = providers[req.params.provider];

    const { token_endpoint } = provider;
    const { state } = req.query;

    if (req.session.state !== state) {
        console.warn("Unexpected state in oauth2callback, XSRF attempt?");
    }

    const payload = qs.stringify({
    });

    const next_step = "/id/" + req.params.provider + "/token?" + payload;

    res.setHeader("Content-Type", "text/html");
    res.send(
        `<html>
            <h2>Step 2: Client received callback with code</h2></h2>
            <div><a href='${next_step}'>fetch token with post to ${token_endpoint}</a></div>
            <div>
            Normally your app would directly perform a POST to <code>${token_endpoint} with this payload:<br />
                <code>${printUrl(payload)}</code>
            </div>
        </html>`);
});

app.get("/id/:provider/token", async (req, res) => {
    const provider = providers[req.params.provider];

    const { token_endpoint } = provider;
    const payload = qs.stringify(req.query);
    console.log("PAYLOAD", payload);

    try {
        const response = await axios.post(token_endpoint, payload);

        console.log("DATA", response.data);
        const tokenResponse = response.data;
        req.session.tokenResponse = tokenResponse;
        res.setHeader("Content-Type", "text/html");
        res.send(
            `<html>
                <h2>Step 3: Process token</h2></h2>
                <div>This was the response from ${token_endpoint}</a></div>
                <pre>${JSON.stringify(tokenResponse)}</pre>
                <div>Normally you application will directly use the token to establish an application session</div>
                <div><a href="/id/${req.params.provider}/session">Create session</a></div>
                <div><a href="/">Front page</a></div>
            </html>`);
    } catch (error) {
        console.error("ERROR", error.response.data);
        res.send("An error occurred");
    }
});

app.get("/id/:provider/session", (req, res) => {
    const { tokenResponse } = req.session;

    const { access_token, id_token, refresh_token } = tokenResponse;

    const id_token_payload = parseJwt(id_token);
    console.log({ id_token_payload });

    const session = { access_token, refresh_token, id_token_payload };

    req.session.userSessions = req.session.userSessions || [];
    req.session.userSessions.push(session);

    res.redirect("/");
});


const port = 8080

const providers = {
};

async function setupProvider(provider, url) {
    const response = await axios.get(url);

    const { authorization_endpoint, token_endpoint, scopes_supported } = response.data;
    const { client_id, client_secret, redirect_uri } = config[provider];

    providers[provider] = {
        authorization_endpoint, token_endpoint, scopes_supported,
        client_id, client_secret, redirect_uri
    };
}

async function setup() {
    await setupProvider("google", "https://accounts.google.com/.well-known/openid-configuration");
    await setupProvider("microsoft", "https://login.microsoftonline.com/common/.well-known/openid-configuration");
    await setupProvider("idporten", "https://oidc-ver1.difi.no/idporten-oidc-provider");

    app.listen(port, () => console.log(`Listening on port ${port}!`))
}

setup();
