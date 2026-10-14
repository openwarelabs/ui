import { SignIn05 } from "@openwarelabs/blocks";

import "./SignInReset.css";

// Stands in for the requests to your server.
const wait = () => new Promise<void>((resolve) => window.setTimeout(resolve, 800));

export function SignInReset() {
    return (
        <SignIn05
            brand={{ name: "Acme", logo: <span className="sign-in-reset__mark" aria-hidden="true" /> }}
            backLink={{ label: "Back to sign in", href: "#" }}
            title="Reset your password"
            description="Enter the email you use for Acme, and we'll send you a link to choose a new password."
            // The real flow emails a link, and the link opens the next page. Here the next page follows straight on.
            onRequestLink={wait}
            onSavePassword={wait}
            doneDescription="You're signed in. To be safe, we've signed you out of Acme on every other device."
            // In an app "Continue" opens the workspace; without onContinue it starts the sample again.
            labels={{ emailEmpty: "Enter the email you use for Acme.", continue: "Continue to Acme" }}
        />
    );
}
