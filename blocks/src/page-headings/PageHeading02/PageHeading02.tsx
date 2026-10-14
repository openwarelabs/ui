import { Avatar, AvatarGroup, Breadcrumbs, Button, cx, Tab, TabList, TabPanel, Tabs, Text } from "@openwarelabs/ui";

import type { PageHeading02Props } from "./PageHeading02.types";

/** Breadcrumbs, the page's name and its action, then line tabs for its views that run edge to edge across the panel. */
export function PageHeading02({
    title,
    description,
    breadcrumbs,
    members,
    primaryAction,
    tabs,
    value,
    defaultValue,
    onValueChange,
    labels = {},
    className,
    ...props
}: PageHeading02Props) {
    const tabsLabel = labels.tabs ?? (typeof title === "string" ? title : "Views");
    return (
        <div className={cx("ow-page-heading02", className)} {...props}>
            <div className="ow-page-heading02__panel">
                <div className="ow-page-heading02__top">
                    {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
                    <div className="ow-page-heading02__header">
                        <div>
                            <Text as="h1" variant="heading">
                                {title}
                            </Text>
                            {description ? (
                                <Text variant="copy" className="ow-page-heading02__lead">
                                    {description}
                                </Text>
                            ) : null}
                        </div>
                        {members?.length || primaryAction ? (
                            <div className="ow-page-heading02__actions">
                                {members?.length ? (
                                    <AvatarGroup size="sm" max={4} label={labels.members?.(members.length) ?? `${members.length} people`}>
                                        {members.map((member, index) => (
                                            <Avatar key={index} name={member.name} src={member.avatar} label={member.name} />
                                        ))}
                                    </AvatarGroup>
                                ) : null}
                                {primaryAction ? (
                                    <Button
                                        variant="primary"
                                        startIcon={primaryAction.icon}
                                        loading={primaryAction.loading}
                                        disabled={primaryAction.disabled}
                                        onClick={primaryAction.onClick}
                                    >
                                        {primaryAction.label}
                                    </Button>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>

                <Tabs
                    variant="line"
                    value={value}
                    defaultValue={defaultValue ?? tabs[0]?.value}
                    onValueChange={onValueChange}
                    className="ow-page-heading02__tabs"
                >
                    <TabList aria-label={tabsLabel}>
                        {tabs.map((tab) => (
                            <Tab key={tab.value} value={tab.value}>
                                {tab.label}
                                {tab.count !== undefined ? (
                                    <Text variant="badge" tone="muted" className="ow-page-heading02__count">
                                        {tab.count}
                                    </Text>
                                ) : null}
                            </Tab>
                        ))}
                    </TabList>

                    {tabs.map((tab) => (
                        <TabPanel key={tab.value} value={tab.value} className="ow-page-heading02__tab-panel">
                            {tab.content}
                        </TabPanel>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}
