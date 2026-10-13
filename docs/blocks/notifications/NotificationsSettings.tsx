import { useEffect, useRef, useState } from "react";

import { Select, SettingsRow, Switch, VisuallyHidden } from "@openwarelabs/ui";
import { Check, Mail, Smartphone } from "lucide-react";

import "./NotificationsSettings.css";

type Channel = "email" | "push";

interface Event {
    id: string;
    label: string;
    description?: string;
    /** Channels this event can't use at all. */
    unavailable?: Channel[];
}

const channels: Array<{ id: Channel; label: string; icon: typeof Mail }> = [
    { id: "email", label: "Email", icon: Mail },
    { id: "push", label: "Push", icon: Smartphone },
];

const groups: Array<{ id: string; label: string; events: Event[] }> = [
    {
        id: "reviews",
        label: "Reviews",
        events: [
            { id: "review-requested", label: "Someone asks for your review", description: "From a person or an agent." },
            { id: "review-result", label: "Your change is approved or needs work" },
            { id: "mention", label: "Someone mentions you", description: "In a comment, a review or a task." },
        ],
    },
    {
        id: "agents",
        label: "Agents",
        events: [
            { id: "agent-approval", label: "An agent needs your approval", description: "Before it pushes, deploys or goes over its budget." },
            { id: "agent-failed", label: "An agent run fails" },
            { id: "agent-finished", label: "An agent run finishes" },
        ],
    },
    {
        id: "deploys",
        label: "Deploys",
        events: [
            { id: "deploy-failed", label: "A deploy fails", description: "Only for projects you're a member of." },
            { id: "deploy-live", label: "A deploy goes live" },
        ],
    },
    {
        id: "workspace",
        label: "Workspace",
        events: [
            { id: "member-joined", label: "Someone joins the workspace" },
            { id: "weekly-summary", label: "Weekly summary", description: "What shipped, every Monday at 09:00.", unavailable: ["push"] },
        ],
    },
];

const initial: Record<string, Channel[]> = {
    "review-requested": ["email", "push"],
    "review-result": ["email"],
    mention: ["email", "push"],
    "agent-approval": ["push"],
    "agent-failed": ["email", "push"],
    "agent-finished": [],
    "deploy-failed": ["email", "push"],
    "deploy-live": [],
    "member-joined": ["email"],
    "weekly-summary": ["email"],
};

const digestOptions = [
    { value: "instant", label: "As they happen" },
    { value: "hourly", label: "Once an hour" },
    { value: "daily", label: "Once a day, at 09:00" },
];

export function NotificationsSettings() {
    const [settings, setSettings] = useState(initial);
    const [digest, setDigest] = useState("instant");
    const [quietHours, setQuietHours] = useState(true);
    const [saved, setSaved] = useState(false);
    const timer = useRef(0);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    // Each change saves at once; say so for a moment.
    const save = () => {
        setSaved(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setSaved(false), 2000);
    };

    const toggle = (event: string, channel: Channel, on: boolean) => {
        setSettings((current) => ({
            ...current,
            [event]: on ? [...current[event]!, channel] : current[event]!.filter((other) => other !== channel),
        }));
        save();
    };

    return (
        <section className="notifications-settings" aria-labelledby="notifications-settings-title">
            <div className="notifications-settings__panel">
                <div>
                    <div className="notifications-settings__header">
                        <h2 id="notifications-settings-title" className="notifications-settings__title">
                            Notifications
                        </h2>
                        <span className="notifications-settings__saved" role="status" data-hidden={saved ? undefined : ""}>
                            {saved ? (
                                <>
                                    <Check size={15} aria-hidden="true" />
                                    Saved
                                </>
                            ) : null}
                        </span>
                    </div>
                    <p className="notifications-settings__subtitle">
                        Choose what reaches you by email and on your phone. Everything still shows in your Acme inbox.
                    </p>
                </div>

                <div className="notifications-settings__card">
                    <table className="notifications-settings__grid">
                        <thead>
                            <tr>
                                <th scope="col" className="notifications-settings__corner">
                                    Event
                                </th>
                                {channels.map((channel) => (
                                    <th key={channel.id} scope="col" className="notifications-settings__channel" id={`notifications-settings-${channel.id}`}>
                                        <span className="notifications-settings__channel-label">
                                            <channel.icon size={15} aria-hidden="true" />
                                            {channel.label}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        {groups.map((group) => (
                            <tbody key={group.id}>
                                <tr className="notifications-settings__group">
                                    <th scope="colgroup" colSpan={channels.length + 1}>
                                        {group.label}
                                    </th>
                                </tr>
                                {group.events.map((event) => {
                                    const on = settings[event.id]!;
                                    const rowId = `notifications-settings-${event.id}`;
                                    return (
                                        <tr key={event.id}>
                                            <th scope="row" className="notifications-settings__event">
                                                <span className="notifications-settings__event-label">
                                                    <span id={rowId}>{event.label}</span>
                                                    {on.length === 0 ? <span className="notifications-settings__muted">Muted</span> : null}
                                                </span>
                                                {event.description ? (
                                                    <span className="notifications-settings__event-description">{event.description}</span>
                                                ) : null}
                                            </th>
                                            {channels.map((channel) => (
                                                <td key={channel.id}>
                                                    <span className="notifications-settings__cell">
                                                        {event.unavailable?.includes(channel.id) ? (
                                                            <span className="notifications-settings__unavailable">
                                                                <span aria-hidden="true">–</span>
                                                                <VisuallyHidden>Not sent by {channel.label.toLowerCase()}</VisuallyHidden>
                                                            </span>
                                                        ) : (
                                                            <Switch
                                                                checked={on.includes(channel.id)}
                                                                onChange={(checked) => toggle(event.id, channel.id, checked)}
                                                                aria-labelledby={`notifications-settings-${channel.id} ${rowId}`}
                                                            />
                                                        )}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        ))}
                    </table>
                </div>

                <div>
                    <h3 className="notifications-settings__section-title">Delivery</h3>
                    <div className="notifications-settings__rows">
                        <SettingsRow label="Send emails" description="Bundling sends fewer emails; anything that needs you still comes at once.">
                            <Select
                                aria-label="Send emails"
                                size="sm"
                                value={digest}
                                options={digestOptions}
                                onChange={(value) => {
                                    setDigest(value);
                                    save();
                                }}
                            />
                        </SettingsRow>
                        <SettingsRow label="Quiet hours" description="No push notifications from 19:00 to 08:00 or at weekends, except for failed deploys.">
                            <Switch
                                label="Quiet hours"
                                checked={quietHours}
                                onChange={(checked) => {
                                    setQuietHours(checked);
                                    save();
                                }}
                            />
                        </SettingsRow>
                    </div>
                </div>
            </div>
        </section>
    );
}
