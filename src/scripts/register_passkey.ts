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
    if (!(submitForm instanceof HTMLFormElement))
        throw new Error("The submit form is not a form.");

    const token = new URL(window.location.href).searchParams.get("token");
    if (!token)
        throw new Error("No token in the URL");

    const tokenParts = token.split(".")
    if (tokenParts.length !== 3)
        throw new Error("Invalid JWT structure");

    const payload = JSON.parse(atob(tokenParts[1]));
    if (!payload.sub)
        throw new Error("No subject in the JWT payload");

    (accountNameInput as HTMLInputElement).value = payload.sub.split(":", 2).at(1);

    submitForm.addEventListener("submit", async event => {
        event.preventDefault();

        const optionsResponse = await fetch(
            "/api/register/passkey/options",
            {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include"
            }
        );
        if (!optionsResponse.ok) {
            // TODO: Show something to the user? Check problem detail format?
            throw new Error("The fetch passkey options response has an erroneous status code.");
        }

        const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(
            await optionsResponse.json()
        );
        publicKey.user.displayName = (new FormData(submitForm) as any).get("display_name") as string;

        const credential = await navigator.credentials.create({publicKey});
        if (!(credential instanceof PublicKeyCredential))
            throw new Error("Credential is not a public key credential.")

        // TODO: Check excluded credentials?

        const registerResponse = await fetch(
            "/api/register/passkey",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(credential.toJSON()),
                credentials: "include"
            }
        )
        if (!registerResponse.ok) {
            if ("signalUnknownCredential" in PublicKeyCredential)
                (PublicKeyCredential as any).signalUnknownCredential(credential.id);

            // TODO: Show something to the user? Check problem detail format?
            throw new Error("The fetch passkey register response has an erroneous status code.");
        }
    });
});


