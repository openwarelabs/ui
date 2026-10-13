import { useId, useState, type FormEvent } from "react";

import { Avatar, AvatarGroup, Badge, Button, Field, Input, Link, Separator, toast } from "@openwarelabs/ui";
import { Bot, Check, GitBranch, GitPullRequest } from "lucide-react";

import "./SignInSplit.css";

interface Errors {
    email?: string;
    password?: string;
}

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

export function SignInSplit() {
    const id = useId();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [busy, setBusy] = useState<"github" | "email" | null>(null);

    const fieldId = (name: string) => `${id}-${name}`;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const found: Errors = {};
        if (!email.trim()) found.email = "Enter your work email.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) found.email = "That doesn't look like an email address.";
        if (password.length < 12) found.password = password ? `Add ${12 - password.length} more characters.` : "Choose a password.";
        setErrors(found);
        if (found.email || found.password) {
            document.getElementById(fieldId(found.email ? "email" : "password"))?.focus();
            return;
        }
        setBusy("email");
        window.setTimeout(() => {
            setBusy(null);
            toast.success("Account created", { description: `We sent a link to ${email.trim()} to confirm it's yours.` });
        }, 900);
    }

    return (
        <main className="sign-in-split">
            <div className="sign-in-split__form-side">
                <span className="sign-in-split__brand">
                    <span className="sign-in-split__mark" aria-hidden="true" />
                    Acme
                </span>

                <div className="sign-in-split__form-wrap">
                    <h1 className="sign-in-split__title">Create your account</h1>
                    <p className="sign-in-split__lead">Free for teams of up to five. No card needed.</p>

                    <Button
                        fullWidth
                        startIcon={<GitBranch size={16} />}
                        loading={busy === "github"}
                        disabled={busy === "email"}
                        className="sign-in-split__provider"
                        onClick={() => {
                            // The real thing sends the browser to GitHub and back; here it waits a moment instead.
                            setBusy("github");
                            window.setTimeout(() => {
                                setBusy(null);
                                toast.success("Signed up with GitHub");
                            }, 1200);
                        }}
                    >
                        Sign up with GitHub
                    </Button>

                    <Separator label="or" spacing="3xl" />

                    <form className="sign-in-split__form" noValidate onSubmit={submit}>
                        <Field label="Work email" error={errors.email}>
                            <Input
                                id={fieldId("email")}
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setErrors((current) => ({ ...current, email: undefined }));
                                }}
                                placeholder="maya@example.com"
                                autoComplete="email"
                            />
                        </Field>
                        <Field label="Password" hint={errors.password ? undefined : "At least 12 characters."} error={errors.password}>
                            <Input
                                id={fieldId("password")}
                                type="password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setErrors((current) => ({ ...current, password: undefined }));
                                }}
                                autoComplete="new-password"
                            />
                        </Field>
                        <Button type="submit" variant="primary" fullWidth loading={busy === "email"} disabled={busy === "github"}>
                            Create account
                        </Button>
                    </form>

                    <p className="sign-in-split__terms">
                        By creating an account you agree to the{" "}
                        <Link href="#" variant="muted">
                            terms
                        </Link>{" "}
                        and the{" "}
                        <Link href="#" variant="muted">
                            privacy policy
                        </Link>
                        .
                    </p>
                </div>

                <p className="sign-in-split__switch">
                    Already have an account? <Link href="#">Sign in</Link>
                </p>
            </div>

            <aside className="sign-in-split__plate" aria-label="About Acme">
                <div className="sign-in-split__plate-inner">
                    <p className="sign-in-split__eyebrow">
                        <span className="sign-in-split__brass" aria-hidden="true" />
                        Agents that open their own pull requests
                    </p>
                    <p className="sign-in-split__headline">Hand the routine work to agents. Review every change before it ships.</p>
                    <ReviewVignette />
                    <figure className="sign-in-split__quote">
                        <blockquote className="sign-in-split__quote-text">
                            “We give the dull fixes to agents now, and spend our reviews on the parts that need us.”
                        </blockquote>
                        <figcaption className="sign-in-split__quote-by">
                            Lena Fischer, Head of Platform at Halcyon <span className="sign-in-split__sample">Sample quote</span>
                        </figcaption>
                    </figure>
                </div>
            </aside>
        </main>
    );
}
