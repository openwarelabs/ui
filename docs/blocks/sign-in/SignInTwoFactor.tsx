import { SignIn04 } from "@openwarelabs/blocks";
import { Link, toast } from "@openwarelabs/ui";

export function SignInTwoFactor() {
    return (
        <SignIn04
            title="Enter your code"
            description="Open your authenticator app and enter the six-digit code for Acme."
            // In this sample any code works except 000000, which shows what a wrong code looks like.
            onVerify={async ({ code, trust }) => {
                await new Promise((resolve) => window.setTimeout(resolve, 700));
                if (code === "000000") return false;
                toast.success("Signed in", { description: trust ? "We won't ask for a code on this device for 30 days." : undefined });
                return true;
            }}
            footer={
                <>
                    Signing in as maya@example.com. <Link href="#">Not you?</Link>
                </>
            }
        />
    );
}
