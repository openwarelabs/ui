import { Badge, Button, cx, Menu, Text } from "@openwarelabs/ui";

import { BlockMenuItems } from "@blocks/shared/BlockMenuItems";
import { EllipsisIcon } from "@blocks/shared/icons";
import type { PageHeading01Props } from "./PageHeading01.types";

/**
 * The top of a page on a raised panel: its name and state, one primary action and a menu for the rest, then a row
 * of facts. The page itself can carry on under it, on the same panel.
 */
export function PageHeading01({
    title,
    icon,
    status,
    description,
    primaryAction,
    menu,
    facts,
    children,
    labels = {},
    className,
    ...props
}: PageHeading01Props) {
    return (
        <div className={cx("ow-page-heading01", className)} {...props}>
            <div className="ow-page-heading01__panel">
                <header className="ow-page-heading01__header">
                    <div className="ow-page-heading01__identity">
                        {icon ? (
                            <span className="ow-page-heading01__tile" aria-hidden="true">
                                {icon}
                            </span>
                        ) : null}
                        <div>
                            <div className="ow-page-heading01__title-row">
                                <Text as="h1" variant="heading">
                                    {title}
                                </Text>
                                {status ? <Badge variant={status.tone ?? "neutral"}>{status.label}</Badge> : null}
                            </div>
                            {description ? (
                                <Text variant="copy" className="ow-page-heading01__lead">
                                    {description}
                                </Text>
                            ) : null}
                        </div>
                    </div>

                    {menu?.length || primaryAction ? (
                        <div className="ow-page-heading01__actions">
                            {menu?.length ? (
                                <Menu
                                    label={labels.menu ?? "Actions"}
                                    align="end"
                                    trigger={
                                        <Button iconOnly aria-label={labels.moreActions ?? "More actions"}>
                                            <EllipsisIcon size={16} />
                                        </Button>
                                    }
                                >
                                    <BlockMenuItems items={menu} />
                                </Menu>
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
                </header>

                {facts?.length ? (
                    <dl className="ow-page-heading01__facts">
                        {facts.map((fact, index) => (
                            <div key={index} className="ow-page-heading01__fact">
                                <Text as="dt" variant="caption">
                                    {fact.label}
                                </Text>
                                <Text as="dd" className="ow-page-heading01__value">
                                    {fact.value}
                                </Text>
                            </div>
                        ))}
                    </dl>
                ) : null}

                {children}
            </div>
        </div>
    );
}
