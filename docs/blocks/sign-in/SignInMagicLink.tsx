import { SignIn03 } from "@openwarelabs/blocks";
import { toast } from "@openwarelabs/ui";

import "./SignInMagicLink.css";

export function SignInMagicLink() {
    return (
        <SignIn03
            brand={{ name: "Acme", logo: <span className="sign-in-magic-link__mark" aria-hidden="true" /> }}
            link={{ label: "Sign in with a password", href: "#" }}
            title="Sign in with email"
            description="We'll email you a link that signs you in. There's no password to remember."
            // Stands in for the request that sends the link.
            onSubmit={() => new Promise((resolve) => window.setTimeout(resolve, 800))}
            onResend={(email) => {
                toast.success("Sent another link", { description: `To ${email}. The first one still works too.` });
            }}
            sentNote="Can't see it? Look in your spam folder, or search your inbox for “Acme”."
        />
    );
}
