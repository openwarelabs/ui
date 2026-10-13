import { Link, SectionHeading } from "@openwarelabs/ui";
import { Bot, Command, GitPullRequest, ListTodo, Rocket, ShieldCheck } from "lucide-react";

import "./FeaturesColumns.css";

const features = [
    {
        icon: ListTodo,
        title: "Plans that keep up",
        text: "Issues move themselves as pull requests open and merge, so the board shows where the work really is.",
    },
    {
        icon: Bot,
        title: "Agents for the routine work",
        text: "Hand off dependency bumps, flaky tests and copy fixes. Every agent run ends in a pull request you review.",
    },
    {
        icon: GitPullRequest,
        title: "One queue for every review",
        text: "Diffs, previews and checks side by side, with the issue that asked for the change a click away.",
    },
    {
        icon: Rocket,
        title: "A preview for every branch",
        text: "Each branch deploys to its own address. Promote it when it's approved, and roll back just as fast.",
    },
    {
        icon: Command,
        title: "Made for the keyboard",
        text: "Press ⌘K to reach any project, run, review or setting without leaving what you're doing.",
    },
    {
        icon: ShieldCheck,
        title: "Access that fits your organisation",
        text: "Roles, single sign-on and an audit log on Business, and API keys that only reach one project.",
    },
];

export function FeaturesColumns() {
    return (
        <section className="features-columns" aria-labelledby="features-columns-title">
            <div className="features-columns__inner">
                <SectionHeading
                    align="center"
                    eyebrow="What's in Acme"
                    title={<span id="features-columns-title">Everything between the idea and the deploy</span>}
                    intro="Planning, agents, review and deploys in one workspace, so nothing falls between tools and nobody has to ask where things stand."
                />

                <ul className="features-columns__grid">
                    {features.map(({ icon: Icon, title, text }) => (
                        <li key={title} className="features-columns__item">
                            <span className="features-columns__icon" aria-hidden="true">
                                <Icon size={16} />
                            </span>
                            <h3 className="features-columns__title">{title}</h3>
                            <p className="features-columns__text">{text}</p>
                        </li>
                    ))}
                </ul>

                <p className="features-columns__more">
                    Plus webhooks, a command-line tool and a public API. <Link href="#">Read the docs</Link>
                </p>
            </div>
        </section>
    );
}
