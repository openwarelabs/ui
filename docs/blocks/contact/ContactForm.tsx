import { Contact01, type Contact01Detail } from "@openwarelabs/blocks";
import { Clock, LifeBuoy, Mail } from "lucide-react";

const topics = [
    { value: "plans", label: "Plans and pricing", team: "sales" },
    { value: "security", label: "A security review", team: "security" },
    { value: "migration", label: "Moving from another tool", team: "onboarding" },
    { value: "partners", label: "Partnerships", team: "partnerships" },
    { value: "other", label: "Something else", team: "support" },
];

const sizes = ["1 to 5", "6 to 20", "21 to 100", "101 to 500", "Over 500"].map((size) => ({ value: size, label: `${size} people` }));

const details: Contact01Detail[] = [
    {
        icon: <Mail size={16} />,
        label: "Sales",
        value: "sales@example.com",
        href: "mailto:sales@example.com",
        note: "Plans, invoices and security reviews",
    },
    {
        icon: <LifeBuoy size={16} />,
        label: "Support",
        value: "support@example.com",
        href: "mailto:support@example.com",
        note: "Help with a workspace you already have",
    },
    {
        icon: <Clock size={16} />,
        label: "Reply time",
        value: "Within one working day",
        note: "Usually the same morning. Monday to Friday, 08:00 to 18:00 CET.",
    },
];

export function ContactForm() {
    return (
        <Contact01
            eyebrow="Contact"
            title="Talk to the Acme team"
            description="A question about plans, a security review or moving your team across? Tell us a little and the right person will reply."
            details={details}
            topics={topics}
            sizes={sizes}
            // Stands in for the request to your backend.
            onSubmit={() => new Promise((resolve) => window.setTimeout(resolve, 900))}
            note="We use your details only to reply to you."
            successTitle={(values) => `Thanks, ${values.name.trim().split(" ")[0]}`}
            successDescription={(values) => {
                const team = topics.find((topic) => topic.value === values.topic)?.team ?? "support";
                return `Your message is with our ${team} team. We'll reply to ${values.email.trim()} within one working day.`;
            }}
        />
    );
}
