import {css, html, LitElement, svg} from "lit";
import {customElement, property} from "lit/decorators.js"
import "@altshiftab/web_components/button";


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


const passkeysIcon = svg`
    <svg viewBox="50 30 100 160">
        <g>
            <path fill="#E7AC22" fill-rule="evenodd" d="M172.32,96.79c0,13.78-8.48,25.5-20.29,29.78l7.14,11.83l-10.57,13l10.57,12.71l-17.04,22.87l-12.01-12.82v-25.9v-22.56c-10.68-4.85-18.15-15.97-18.15-28.91c0-17.4,13.51-31.51,30.18-31.51C158.81,65.28,172.32,79.39,172.32,96.79z M142.14,101.61c4.02,0,7.28-3.4,7.28-7.6c0-4.2-3.26-7.61-7.28-7.61s-7.28,3.4-7.28,7.61C134.85,98.21,138.12,101.61,142.14,101.61z"/>
            <path fill="#CF912A" fill-rule="evenodd" d="M172.41,96.88c0,13.62-8.25,25.23-19.83,29.67l6.58,11.84l-9.73,13l9.73,12.71l-17.03,23.05v-25.9v-32.77v-26.87c4.02,0,7.28-3.41,7.28-7.6c0-4.2-3.26-7.61-7.28-7.61V65.28C158.86,65.28,172.41,79.43,172.41,96.88z"/>
            <path fill="#FFFFFF" fill-rule="evenodd" d="M120.24,131.43c-9.75-8-16.3-20.3-17.2-34.27H50.8c-10.96,0-19.84,9.01-19.84,20.13v25.17c0,5.56,4.44,10.07,9.92,10.07h69.44c5.48,0,9.92-4.51,9.92-10.07V131.43z"/>
            <path fill="#FFFFFF" d="M73.16,91.13c-2.42-0.46-4.82-0.89-7.11-1.86C57.4,85.64,52.36,78.95,50.73,69.5c-1.12-6.47-0.59-12.87,2.03-18.92c3.72-8.6,10.39-13.26,19.15-14.84c5.24-0.94,10.46-0.73,15.5,1.15c7.59,2.82,12.68,8.26,15.03,16.24c2.38,8.05,2.03,16.1-1.56,23.72c-3.72,7.96-10.21,12.23-18.42,13.9c-0.68,0.14-1.37,0.27-2.05,0.41C78,91.13,75.58,91.13,73.16,91.13z"/>
        </g>
    </svg>`
;

@customElement("login-element")
export class LoginElement extends LitElement {
    @property({type: String, attribute: "google-client-id"})
    googleClientId: string = "";

    static styles = css`
        :host {
            display: block;

            > .buttons-container {
                display: flex;
                flex-direction: column;
                gap: 1rem;

                align-items: flex-start;

                > altshift-button {
                    width: auto;

                    > * {
                        padding: 0;
                    }

                    > div {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.703125rem;

                        padding: 0.703125rem 0.84375rem;

                        > svg {
                            width: 1.40625rem;
                            height: 1.40625rem;
                            flex-shrink: 0;
                            display: inline-block;
                        }

                        > span {
                            line-height: 1;
                        }
                    }
                }
            }
        }
    `;

    redirectLogin(provider: "google" | "microsoft") {
        window.location.href = `/api/login/${provider}`;
    }

    async loginWithGoogle() {
        const credential = await navigator.credentials.get({
            identity: {
                providers: [
                    {
                        configURL: "https://accounts.google.com/gsi/fedcm.json",
                        clientId: this.googleClientId
                    }
                ]
            },
        } as ExtendedCredentialRequestOptions);
        if (credential == null)
            return void this.redirectLogin("google");

        const response = await fetch(
            "/api/login/fedcm/google", {
                method: "POST",
                body: JSON.stringify({token: (credential as ExtendedCredential).token}),
                headers: {"Content-Type": "application/json"}
            }
        );

        // TODO: Revise
        if (String(response.status).startsWith("4")) {
            console.error("Unable to use FedCM: ", await response.text());
            return void this.redirectLogin("google");
        }

        return
    }

    render() {
        return html`
            <h2>Sign in</h2>

            <div class="buttons-container">
                <altshift-button @click=${() => this.loginWithGoogle()}>
                    <div>
                        <svg viewBox="0 0 20 20">
                            <g transform="translate(-10 -10)">
                                <path d="M29.6 20.2273C29.6 19.5182 29.5364 18.8364 29.4182 18.1818H20V22.05H25.3818C25.15 23.3 24.4455 24.3591 23.3864 25.0682V27.5773H26.6182C28.5091 25.8364 29.6 23.2727 29.6 20.2273Z" fill="#4285F4"/>
                                <path d="M20 30C22.7 30 24.9636 29.1045 26.6181 27.5773L23.3863 25.0682C22.4909 25.6682 21.3454 26.0227 20 26.0227C17.3954 26.0227 15.1909 24.2636 14.4045 21.9H11.0636V24.4909C12.7091 27.7591 16.0909 30 20 30Z" fill="#34A853"/>
                                <path d="M14.4045 21.9C14.2045 21.3 14.0909 20.6591 14.0909 20C14.0909 19.3409 14.2045 18.7 14.4045 18.1V15.5091H11.0636C10.3864 16.8591 10 18.3864 10 20C10 21.6136 10.3864 23.1409 11.0636 24.4909L14.4045 21.9Z" fill="#FBBC04"/>
                                <path d="M20 13.9773C21.4681 13.9773 22.7863 14.4818 23.8227 15.4727L26.6909 12.6045C24.9591 10.9909 22.6954 10 20 10C16.0909 10 12.7091 12.2409 11.0636 15.5091L14.4045 18.1C15.1909 15.7364 17.3954 13.9773 20 13.9773Z" fill="#E94235"/>
                            </g>
                        </svg>
                        <span>Google</span>
                    </div>
                </altshift-button>
                <altshift-button @click="${() => this.redirectLogin("microsoft")}">
                    <div>
                        <svg viewBox="0 0 21 21">
                            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                        </svg>
                        <span>Microsoft</span>
                    </div>
                </altshift-button>
                <altshift-button>
                    <div>
                        ${passkeysIcon}
                        <span>PassKey</span>
                    </div>
                </altshift-button>
            </div>

            <h2>Register</h2>

            <div class="buttons-container">
                <altshift-button>
                    <div>
                        ${passkeysIcon}
                        <span>PassKey</span>
                    </div>
                </altshift-button>
            </div>
        `;
    }
}
