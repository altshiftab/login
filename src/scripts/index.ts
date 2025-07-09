import "@altshiftab/styles/common.css";
import "@altshiftab/styles/common_header_footer.css";
import {addErrorEventListeners} from "@altshiftab/http_service_utils_js";
import "@altshiftab/web_components/button";
import "@altshiftab/web_components/footer"
import "@altshiftab/web_components/header"

import "../styles/index.css";

interface IdentityProvider {
    configURL: string;
    clientId: string;
    loginHint?: string;
    nonce?: string;
}

interface IdentityRequestOptions {
    context?: "continue" | "signin" | "signup" | "use"
    providers: IdentityProvider[];
}

interface ExtendedCredentialRequestOptions extends CredentialRequestOptions {
    identity?: IdentityRequestOptions;
}

interface ExtendedCredential extends Credential {
    token?: string;
}

addErrorEventListeners();

const googleClientId = "753322439415-noodo7tfs80q6aei9g5eqokc37ts1h3h.apps.googleusercontent.com"
const googleManifestUrl = "https://accounts.google.com/gsi/fedcm.json"

function redirectLogin(provider: "google" | "microsoft") {
    window.location.href = `/api/login/${provider}`;
}

async function loginWithGoogle() {
    let credential: ExtendedCredential | null = null;

    try {
        credential = await navigator.credentials.get({
            identity: {
                mode: "active",
                providers: [
                    {
                        configURL: googleManifestUrl,
                        clientId: googleClientId
                    }
                ],
            },
        } as ExtendedCredentialRequestOptions);
    } catch (err) {
        if (err instanceof DOMException && err.name === "NotSupportedError")
            return void redirectLogin("google");
        throw err;
    }

    if (!credential)
        return void redirectLogin("google");

    const response = await fetch(
        "/api/login/fedcm/google", {
            method: "POST",
            body: JSON.stringify({token: (credential as ExtendedCredential).token}),
            headers: {"Content-Type": "application/json"}
        }
    );

    // TODO: Revise
    if (String(response.status).startsWith("4")) {
        return void console.error("Unable to use FedCM: ", await response.text());
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const signInWithGoogleButton = document.getElementById("sign-in-with-google-button");
    if (signInWithGoogleButton === null)
        throw new Error("Sign in with Google button not found");

    const signInWithMicrosoftButton = document.getElementById("sign-in-with-microsoft-button");
    if (signInWithMicrosoftButton === null)
        throw new Error("Sign in with Microsoft button not found");

    const registerPasskeyButton = document.getElementById("register-passkey-button");
    if (registerPasskeyButton === null)
        throw new Error("Register passkey button not found");

    const registerPasskeyDialog = document.getElementById("register-passkey-dialog");
    if (registerPasskeyDialog === null)
        throw new Error("Register passkey dialog not found");

    const registerPasskeyForm = document.getElementById("register-passkey-form");
    if (registerPasskeyForm === null)
        throw new Error("Register passkey form not found");


    signInWithGoogleButton.addEventListener("click", () => loginWithGoogle());
    signInWithMicrosoftButton.addEventListener("click", () => redirectLogin("microsoft"));
    registerPasskeyButton.addEventListener("click", () => (registerPasskeyDialog as HTMLDialogElement).showModal());

    registerPasskeyForm.addEventListener("submit", async event => {
        event.preventDefault();

        const form = event.currentTarget as HTMLFormElement;
        if (form === null)
            throw new Error("The form element was not found");

        const response = await fetch(
            "/api/register/passkey/email-address",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(Object.fromEntries((new FormData(form) as any).entries()))
            }
        );

        if (!response.ok) {
            // TODO: Show something to the user?
            throw new Error("The fetch passkey register response has an erroneous status code.");
        }

        window.alert("An email was sent.");
        (registerPasskeyDialog as HTMLDialogElement).close();
    });
});