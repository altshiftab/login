import "@altshiftab/styles/common.css";
import "@altshiftab/styles/common_header_footer.css";

import {addErrorEventListeners} from "@altshiftab/http_service_utils_js";
import "@altshiftab/web_components/button";
import "@altshiftab/web_components/footer"
import "@altshiftab/web_components/header"

import "../styles/register_passkey.css";

addErrorEventListeners();

document.addEventListener("DOMContentLoaded", () => {
    const accountNameInput = document.getElementById("account-name-input")
    if (accountNameInput === null)
        throw new Error("The account name input was not found");

    const submitForm = document.getElementById("submit-form");
    if (submitForm === null)
        throw new Error("The submit form was not found");

    const token = new URL(window.location.href).searchParams.get("token");
    if (!token)
        throw new Error("No token in the URL");

    const tokenParts = token.split(".")
    if (tokenParts.length !== 3)
        throw new Error("Invalid JWT structure");

    const payload = JSON.parse(atob(tokenParts[1]));
    if (!payload.sub)
        throw new Error("No subject in the JWT payload");

    (accountNameInput as HTMLInputElement).value = payload.sub;

    submitForm.addEventListener("submit", async event => {
        event.preventDefault();

        const form = event.currentTarget as HTMLFormElement;
        if (form === null)
            throw new Error("The form element was not found");

        const optionsResponse = await fetch(
            "/api/register/passkey/options",
            {

                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(Object.fromEntries((new FormData(form) as any).entries())),
                credentials: "include"
            }
        );
        if (!optionsResponse.ok) {
            // TODO: Show something to the user? Check problem detail format?
            throw new Error("The fetch passkey options response has an erroneous status code.");
        }

        const credential = await navigator.credentials.create({
            publicKey: PublicKeyCredential.parseCreationOptionsFromJSON(await optionsResponse.json())
        });

        // TODO: Check excluded credentials?

        const registerResponse = await fetch(
            "/api/register/passkey",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify((credential as PublicKeyCredential).toJSON()),
                credentials: "include"
            }
        )
        if (!registerResponse.ok) {
            /*
                // Detect authentication failure due to lack of the credential
                if (response.status === 404) {
                  // Feature detection
                  if (PublicKeyCredential.signalUnknownCredential) {
                    await PublicKeyCredential.signalUnknownCredential({
                      rpId: "example.com",
                      credentialId: "vI0qOggiE3OT01ZRWBYz5l4MEgU0c7PmAA" // base64url encoded credential ID
                    });
                  } else {
                    // Encourage the user to delete the passkey from the password manager nevertheless.
                    ...
                  }
                }
             */
            // TODO: Show something to the user? Check problem detail format?
            throw new Error("The fetch passkey register response has an erroneous status code.");
        }
    });
})


