import { Card, Skeleton, SkeletonRows, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Skeleton",
    category: "Feedback",
    description:
        "Grey pulsing bars that hold a layout's shape while it loads, so nothing jumps when it arrives.",
    source: "components/Skeleton/Skeleton.tsx",
    imports: ["Skeleton", "SkeletonRows"],
    props: ["SkeletonProps", "SkeletonRowsProps"],
    notes: [
        "SkeletonRows waits 150ms before showing, so fast loads never flash it, and is announced as “Loading”.",
        "Match the real layout closely. If it loads in under a second, show nothing.",
    ],
    related: ["Spinner", "SettingsRow"],
};

/** Bars shaped like what's coming: an avatar, a name, a line. */
export function Bars() {
    return (
        <Stack direction="row" gap="md" align="center" style={{ width: 320, maxWidth: "100%" }}>
            <Skeleton width={36} height={36} />
            <Stack gap="xs" style={{ flex: 1 }}>
                <Skeleton width="45%" />
                <Skeleton width="80%" height={12} soft />
            </Stack>
            <Skeleton width={72} height={32} soft shape="block" />
        </Stack>
    );
}

/** SkeletonRows: the shape of settings rows, for a settings panel that's loading. */
export function Rows() {
    return (
        <Card padding="none" style={{ width: 460, maxWidth: "100%", padding: "0 16px" }}>
            <SkeletonRows rows={3} delayMs={0} label="Loading settings" />
        </Card>
    );
}
Rows.layout = { ground: "canvas" as const };
