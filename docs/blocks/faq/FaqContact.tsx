import { Faq03 } from "@openwarelabs/blocks";
import { CalendarDays, Mail } from "lucide-react";

const questions = [
    {
        question: "Do people who only review count as seats?",
        answer: "Anyone who can sign in counts. Guests who only comment on a preview deploy are free, up to 20 per workspace.",
    },
    {
        question: "Can we pay by invoice?",
        answer: "On yearly Business and Enterprise plans, by bank transfer within 30 days. Monthly plans pay by card, and every receipt carries your VAT number.",
    },
    {
        question: "Who at Acme can see our code?",
        answer: "Nobody, by default. If you ask support to look into a problem, you grant access to one project for 72 hours, and every view shows in your audit log.",
    },
    {
        question: "Can an agent use our production secrets?",
        answer: "Only if you say so. Secrets belong to an environment, and agents get the preview ones unless you grant a production secret by name.",
    },
    {
        question: "Does single sign-on cost extra?",
        answer: "No. SAML single sign-on comes with Business and Enterprise rather than as an add-on, and every plan can sign in with Google or GitHub.",
    },
    {
        question: "What happens when we cancel?",
        answer: "You keep your plan until the period you've paid for ends, then move to Free. Nothing is deleted; projects over the Free limit become read-only.",
    },
];

export function FaqContact() {
    return (
        <Faq03
            eyebrow="FAQ"
            title="Before you ask"
            description="The questions that land in our inbox most often, about seats, billing, access and security."
            questions={questions}
            contact={{
                title: "Still have a question?",
                description: "Ask Lena, Omar or Aiko. They work on Acme every day and reply within a working day.",
                status: "Most replies come within two hours",
                people: [{ name: "Lena Fischer" }, { name: "Omar Haddad" }, { name: "Aiko Tanaka" }],
                peopleLabel: "Lena, Omar and Aiko from support",
                primaryAction: { label: "Email support", href: "mailto:support@example.com", startIcon: <Mail size={16} /> },
                secondaryAction: { label: "Book a call", href: "#call", startIcon: <CalendarDays size={16} /> },
            }}
        />
    );
}
