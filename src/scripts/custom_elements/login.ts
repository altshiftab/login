import {css, html, LitElement} from "lit";
import {customElement} from "lit/decorators.js"

@customElement("login-element")
export class LoginElement extends LitElement {
    static styles = css`
        :host {
            display: block;
        }
    `;

    startLogin(provider: "google" | "microsoft") {
        window.location.href = `/api/login?provider=${provider}`;
    }

    render() {
        return html`
            <button @click=${() => this.startLogin("google")}>Login with Google</button>
            <button @click=${() => this.startLogin("microsoft")}>Login with Microsoft</button>
        `;
    }
}
