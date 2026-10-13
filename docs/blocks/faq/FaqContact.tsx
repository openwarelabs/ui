import { Avatar, AvatarGroup, Card, SectionHeading, buttonClassName } from "@openwarelabs/ui";
import { CalendarDays, Mail } from "lucide-react";

import "./FaqContact.css";

const questions = [
    {
        id: "reviewers",
        question: "Do people who only review count as seats?",
        answer: "Anyone who can sign in counts. Guests who only comment on a preview deploy are free, up to 20 per workspace.",
    },
    {
        id: "invoice",
        question: "Can we pay by invoice?",
        answer: "On yearly Business and Enterprise plans, by bank transfer within 30 days. Monthly plans pay by card, and every receipt carries your VAT number.",
    },
    {
        id: "staff",
        question: "Who at Acme can see our code?",
        answer: "Nobody, by default. If you ask support to look into a problem, you grant access to one project for 72 hours, and every view shows in your audit log.",
    },
    {
        id: "secrets",
        question: "Can an agent use our production secrets?",
        answer: "Only if you say so. Secrets belong to an environment, and agents get the preview ones unless you grant a production secret by name.",
    },
    {
        id: "sso",
        question: "Does single sign-on cost extra?",
        answer: "No. SAML single sign-on comes with Business and Enterprise rather than as an add-on, and every plan can sign in with Google or GitHub.",
    },
    {
        id: "cancel",
        question: "What happens when we cancel?",
        answer: "You keep your plan until the period you've paid for ends, then move to Free. Nothing is deleted; projects over the Free limit become read-only.",
    },
];

const supportTeam = ["Lena Fischer", "Omar Haddad", "Aiko Tanaka"];

export function FaqContact() {
    return (
        <section className="faq-contact" aria-labelledby="faq-contact-title">
            <div className="faq-contact__inner">
                <SectionHeading
                    eyebrow="FAQ"
                    title={<span id="faq-contact-title">Before you ask</span>}
                    intro="The questions that land in our inbox most often, about seats, billing, access and security."
                />

                <div className="faq-contact__grid">
                    {questions.map((item) => (
                        <div key={item.id} className="faq-contact__item">
                            <h3 className="faq-contact__question">{item.question}</h3>
                            <p className="faq-contact__answer">{item.answer}</p>
                        </div>
                    ))}
                </div>

                <Card padding="none" className="faq-contact__card">
                    <AvatarGroup size="lg" label="Lena, Omar and Aiko from support" className="faq-contact__people">
                        {supportTeam.map((name) => (
                            <Avatar key={name} name={name} />
                        ))}
                    </AvatarGroup>
                    <div className="faq-contact__card-text">
                        <h3 className="faq-contact__card-title">Still have a question?</h3>
                        <p className="faq-contact__card-body">Ask Lena, Omar or Aiko. They work on Acme every day and reply within a working day.</p>
                        <p className="faq-contact__status">Most replies come within two hours</p>
                    </div>
                    <div className="faq-contact__actions">
                        <a href="mailto:support@example.com" className={buttonClassName({ variant: "primary", shape: "pill" })}>
                            <Mail size={16} aria-hidden="true" />
                            Email support
                        </a>
                        <a href="#" className={buttonClassName({ shape: "pill" })}>
                            <CalendarDays size={16} aria-hidden="true" />
                            Book a call
                        </a>
                    </div>
                </Card>
            </div>
        </section>
    );
}
