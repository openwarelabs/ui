import { Accordion, AccordionItem, Link, SectionHeading, Text } from "@openwarelabs/ui";

import "./FaqAccordion.css";

const questions = [
    {
        id: "runs",
        question: "What counts as an agent run?",
        answer: "One task you hand to an agent, from reading the issue to opening the pull request. Retries after a failed build don't count, and every run is listed under Usage with what it cost.",
    },
    {
        id: "access",
        question: "What can an agent see and change?",
        answer: "Only the projects you add it to. Each agent gets its own token, can't read secrets unless you allow it, and never merges or deploys: a person reviews and ships every change.",
    },
    {
        id: "data",
        question: "Where is our code and data kept?",
        answer: "In the EU, in Frankfurt and Dublin, encrypted at rest and in transit. We don't train models on your code, and the model providers we use are contracted not to either.",
    },
    {
        id: "sso",
        question: "Do you support single sign-on?",
        answer: "Every plan can sign in with Google or GitHub. Business adds SAML single sign-on with Okta, Entra ID or Google Workspace, and Enterprise adds SCIM, so people join and leave with your directory.",
    },
    {
        id: "billing",
        question: "How are we billed when people join or leave?",
        answer: "For the people in the workspace each month. Add someone mid-month and we charge for the days left; remove someone and the unused days come off your next invoice.",
    },
    {
        id: "cancel",
        question: "Can we cancel at any time?",
        answer: "Yes, from the Billing page in Settings. You keep your plan until the end of the period you've paid for, then move to Free. You can export every project and its history before or after.",
    },
];

export function FaqAccordion() {
    return (
        <section className="faq-accordion" aria-labelledby="faq-accordion-title">
            <div className="faq-accordion__inner">
                <SectionHeading
                    align="center"
                    eyebrow="FAQ"
                    title={<span id="faq-accordion-title">Questions we hear before teams sign up</span>}
                    intro="Short answers about agents, your data and billing."
                />

                <Accordion className="faq-accordion__list" defaultValue={["runs"]}>
                    {questions.map((item) => (
                        <AccordionItem key={item.id} value={item.id} title={item.question}>
                            <Text variant="copy" className="faq-accordion__answer">
                                {item.answer}
                            </Text>
                        </AccordionItem>
                    ))}
                </Accordion>

                <Text variant="body" tone="muted" align="center" className="faq-accordion__more">
                    Didn't find your question? <Link href="#">Read the docs</Link> or write to{" "}
                    <Link href="mailto:support@example.com">support@example.com</Link>.
                </Text>
            </div>
        </section>
    );
}
