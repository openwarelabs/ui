import { SignIn02 } from "@openwarelabs/blocks";
import { Avatar, AvatarGroup, Badge, Link, toast } from "@openwarelabs/ui";
import { Bot, Check, GitBranch, GitPullRequest } from "lucide-react";

import "./SignInSplit.css";

const checks = ["Tests", "Types", "Preview"];

/** The product on the brand plate, drawn with Openware components. Swap it for a screenshot: <img src="…" alt="…" />. */
function ReviewVignette() {
    return (
        <div
            className="sign-in-split__vignette"
            role="img"
            aria-label="An Acme review: an agent's pull request on billing-api, Fix invoice dates in the EU, with its tests, types and preview passing, waiting for two reviewers. Below it, a notice that marketing-site is live."
        >
            <div className="sign-in-split__review">
                <div className="sign-in-split__review-head">
                    <span className="sign-in-split__review-icon">
                        <GitPullRequest size={15} />
                    </span>
                    <span className="sign-in-split__review-title">
                        <span className="sign-in-split__review-name">Fix invoice dates in the EU</span>
                        <span className="sign-in-split__review-meta">billing-api · fix/invoice-dates · 14 files</span>
                    </span>
                    <Badge size="sm" variant="active">
                        Ready
                    </Badge>
                </div>
                <div className="sign-in-split__diff">
                    <span className="sign-in-split__diff-line sign-in-split__diff-line--removed">- const due = addDays(issued, 30);</span>
                    <span className="sign-in-split__diff-line sign-in-split__diff-line--added">+ const due = addBusinessDays(issued, 30, region);</span>
                </div>
                <div className="sign-in-split__checks">
                    {checks.map((check) => (
                        <span key={check} className="sign-in-split__check">
                            <Check size={13} strokeWidth={2.5} />
                            {check}
                        </span>
                    ))}
                </div>
                <div className="sign-in-split__review-foot">
                    <span className="sign-in-split__agent">
                        <Bot size={14} />
                        Opened by an agent for Tomás Reyes
                    </span>
                    <AvatarGroup size="sm">
                        <Avatar name="Clara Novak" />
                        <Avatar name="Jonas Berg" />
                    </AvatarGroup>
                </div>
            </div>
            <div className="sign-in-split__deploy">
                <span className="sign-in-split__deploy-dot" />
                <span className="sign-in-split__deploy-text">marketing-site is live</span>
                <span className="sign-in-split__deploy-time">4 min ago</span>
            </div>
        </div>
    );
}

// Stands in for the real thing, which sends the browser to GitHub (or the form to your server) and back.
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function SignInSplit() {
    return (
        <SignIn02
            brand={{ name: "Acme", logo: <span className="sign-in-split__mark" aria-hidden="true" /> }}
            title="Create your account"
            description="Free for teams of up to five. No card needed."
            providers={[{ id: "github", label: "Sign up with GitHub", icon: <GitBranch size={16} /> }]}
            onProviderSelect={async () => {
                await wait(1200);
                toast.success("Signed up with GitHub");
            }}
            onSubmit={async ({ email }) => {
                await wait(900);
                toast.success("Account created", { description: `We sent a link to ${email} to confirm it's yours.` });
            }}
            terms={
                <>
                    By creating an account you agree to the{" "}
                    <Link href="#" variant="muted">
                        terms
                    </Link>{" "}
                    and the{" "}
                    <Link href="#" variant="muted">
                        privacy policy
                    </Link>
                    .
                </>
            }
            footer={
                <>
                    Already have an account? <Link href="#">Sign in</Link>
                </>
            }
            labels={{ plate: "About Acme" }}
            eyebrow="Agents that open their own pull requests"
            headline="Hand the routine work to agents. Review every change before it ships."
            visual={<ReviewVignette />}
            quote={{
                text: "“We give the dull fixes to agents now, and spend our reviews on the parts that need us.”",
                author: "Lena Fischer, Head of Platform at Halcyon",
                badge: "Sample quote",
            }}
        />
    );
}
