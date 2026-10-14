import { SignIn01 } from "@openwarelabs/blocks";
import { Link, toast } from "@openwarelabs/ui";
import { GitBranch } from "lucide-react";

import "./SignInCard.css";

// Stands in for the real thing, which sends the browser to the provider (or your server) and back.
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const providers = [
    { id: "GitHub", label: "Continue with GitHub", icon: <GitBranch size={16} /> },
    {
        id: "Google",
        label: "Continue with Google",
        icon: (
            <span className="sign-in-card__glyph" aria-hidden="true">
                G
            </span>
        ),
    },
];

export function SignInCard() {
    return (
        <SignIn01
            logo={<span className="sign-in-card__mark" aria-hidden="true" />}
            title="Sign in to Acme"
            description="Welcome back. Your team's reviews are waiting."
            providers={providers}
            onProviderSelect={async (provider) => {
                await wait(1200);
                toast.success(`Signed in with ${provider}`);
            }}
            onSubmit={async ({ email }) => {
                await wait(900);
                toast.success(`Signed in as ${email}`);
            }}
            forgotPasswordHref="#"
            footer={
                <>
                    New to Acme? <Link href="#">Create an account</Link>
                </>
            }
        />
    );
}
