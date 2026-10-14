import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { Dashboard01 } from "@openwarelabs/blocks";
import { VisuallyHidden } from "@openwarelabs/ui";
import { Bot, CircleCheck, Rocket, Timer } from "lucide-react";

import "./DashboardChart.css";

interface Day {
    date: Date;
    deploys: number;
    failed: number;
    buildSeconds: number;
    byAgents: number;
}

/** A small seeded random number generator, so the sample data is the same on every load. */
function seeded(seed: number) {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const totalDays = 180;
const lastDay = Date.UTC(2026, 9, 12);
const dayMs = 86_400_000;

const projects = [
    { id: "marketing-site", perDay: 6, build: 48 },
    { id: "billing-api", perDay: 2.6, build: 160 },
    { id: "mobile-app", perDay: 1.3, build: 192 },
    { id: "docs", perDay: 0.9, build: 110 },
    { id: "design-system", perDay: 1.6, build: 65 },
];

// Six months of sample deploys per project: quieter at weekends, a little busier and faster each month.
const byProject: Record<string, Day[]> = Object.fromEntries(
    projects.map((project, index) => {
        const random = seeded(index + 7);
        const days = Array.from({ length: totalDays }, (_, day) => {
            const date = new Date(lastDay - (totalDays - 1 - day) * dayMs);
            const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
            const progress = day / totalDays;
            const mean = project.perDay * (0.75 + 0.5 * progress) * (weekend ? 0.2 : 1);
            const deploys = Math.max(0, Math.round(mean * (0.55 + random() * 0.9)));
            let failed = 0;
            let byAgents = 0;
            for (let n = 0; n < deploys; n++) {
                if (random() < 0.045) failed += 1;
                if (random() < 0.22 + 0.22 * progress) byAgents += 1;
            }
            const buildSeconds = project.build * (1 - 0.3 * progress) * (0.9 + random() * 0.2);
            return { date, deploys, failed, buildSeconds, byAgents };
        });
        return [project.id, days];
    }),
);

function allProjects(): Day[] {
    return byProject[projects[0]!.id]!.map((first, day) => {
        const days = projects.map((project) => byProject[project.id]![day]!);
        const deploys = days.reduce((sum, entry) => sum + entry.deploys, 0);
        return {
            date: first.date,
            deploys,
            failed: days.reduce((sum, entry) => sum + entry.failed, 0),
            byAgents: days.reduce((sum, entry) => sum + entry.byAgents, 0),
            buildSeconds: deploys ? days.reduce((sum, entry) => sum + entry.buildSeconds * entry.deploys, 0) / deploys : 0,
        };
    });
}

const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

function duration(seconds: number) {
    const rounded = Math.round(seconds);
    return rounded < 60 ? `${rounded} s` : `${Math.floor(rounded / 60)} min ${String(rounded % 60).padStart(2, "0")} s`;
}

function sign(value: number, unit: string) {
    if (Math.abs(value) < 0.05) return `0${unit}`;
    return `${value > 0 ? "+" : "−"}${Math.abs(value).toLocaleString("en-GB", { maximumFractionDigits: 1 })}${unit}`;
}

/** Totals for a run of days: what the stats show. */
function summarise(days: Day[]) {
    const deploys = days.reduce((sum, day) => sum + day.deploys, 0);
    const failed = days.reduce((sum, day) => sum + day.failed, 0);
    const byAgents = days.reduce((sum, day) => sum + day.byAgents, 0);
    const build = deploys ? days.reduce((sum, day) => sum + day.buildSeconds * day.deploys, 0) / deploys : 0;
    return { deploys, success: deploys ? (1 - failed / deploys) * 100 : 100, agents: deploys ? (byAgents / deploys) * 100 : 0, build };
}

/** A round step for the y axis: 1, 2 or 5 times a power of ten, giving four or five gridlines. */
function niceStep(max: number) {
    const rough = Math.max(max, 1) / 4;
    const power = 10 ** Math.floor(Math.log10(rough));
    return [1, 2, 5, 10].map((factor) => factor * power).find((step) => step >= rough)!;
}

function DeployChart({ days, label }: { days: Day[]; label: string }) {
    const plotRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [active, setActive] = useState<number | null>(null);

    useLayoutEffect(() => {
        const element = plotRef.current!;
        const measure = () => setSize({ width: element.clientWidth, height: element.clientHeight });
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const { width, height } = size;
    const margin = { top: 8, right: 8, bottom: 26, left: 34 };
    const plotWidth = Math.max(0, width - margin.left - margin.right);
    const plotHeight = Math.max(0, height - margin.top - margin.bottom);
    const max = Math.max(...days.map((day) => day.deploys));
    const step = niceStep(max);
    const top = Math.ceil(max / step) * step;
    const ticks = Array.from({ length: top / step + 1 }, (_, index) => index * step);
    // The first and last days sit a few pixels in from the ends, so their bars don't hang over the axis.
    const inset = 8;
    const gap = days.length > 1 ? (plotWidth - inset * 2) / (days.length - 1) : 0;
    const x = (index: number) => margin.left + inset + index * gap;
    const y = (value: number) => margin.top + plotHeight - (value / top) * plotHeight;

    const line = days.map((day, index) => `${index ? "L" : "M"}${x(index).toFixed(1)} ${y(day.deploys).toFixed(1)}`).join(" ");
    const area = `${line} L${x(days.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`;
    const barWidth = Math.max(2, Math.min(8, gap * 0.45));

    // About one date label per 110px, always including the latest day.
    const labelEvery = Math.max(1, Math.ceil(days.length / Math.max(3, Math.floor(plotWidth / 110))));
    const labelled = days.map((_, index) => index).filter((index) => (days.length - 1 - index) % labelEvery === 0);

    const peak = days.reduce((best, day) => (day.deploys > best.deploys ? day : best), days[0]!);
    const span = `${shortDate.format(days[0]!.date)} to ${shortDate.format(days[days.length - 1]!.date)}`;
    const summary = `${label}, ${span}. The busiest day was ${longDate.format(peak.date)} with ${peak.deploys} deploys.`;

    const pick = (event: PointerEvent<SVGRectElement>) => {
        const bounds = plotRef.current!.getBoundingClientRect();
        const index = Math.round((event.clientX - bounds.left - x(0)) / (gap || 1));
        setActive(Math.min(days.length - 1, Math.max(0, index)));
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const current = active ?? days.length - 1;
        const moves: Record<string, number> = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: days.length - 1 };
        if (event.key === "Escape") return setActive(null);
        if (!(event.key in moves)) return;
        event.preventDefault();
        setActive(Math.min(days.length - 1, Math.max(0, moves[event.key]!)));
    };

    const shown = active === null ? null : days[Math.min(active, days.length - 1)]!;
    const shownIndex = active === null ? 0 : Math.min(active, days.length - 1);
    const onRight = shown ? x(shownIndex) > width / 2 : false;

    return (
        <div
            ref={plotRef}
            className="dashboard-chart__plot"
            tabIndex={0}
            role="group"
            aria-label={`${summary} Use the left and right arrow keys to read each day.`}
            onKeyDown={onKeyDown}
            onFocus={() => setActive((current) => current ?? days.length - 1)}
            onBlur={() => setActive(null)}
        >
            {width > 0 ? (
                <svg width={width} height={height} aria-hidden="true">
                    {ticks.map((tick) => (
                        <g key={tick}>
                            <line
                                className={tick === 0 ? "dashboard-chart__baseline" : "dashboard-chart__grid"}
                                x1={margin.left}
                                x2={width - margin.right}
                                y1={y(tick)}
                                y2={y(tick)}
                            />
                            <text className="dashboard-chart__tick" x={margin.left - 10} y={y(tick)} dy="0.32em" textAnchor="end">
                                {tick}
                            </text>
                        </g>
                    ))}
                    {labelled.map((index) => (
                        <text
                            key={index}
                            className="dashboard-chart__tick"
                            x={x(index)}
                            y={height - 6}
                            textAnchor={index === 0 ? "start" : index === days.length - 1 ? "end" : "middle"}
                        >
                            {shortDate.format(days[index]!.date)}
                        </text>
                    ))}
                    <path className="dashboard-chart__area" d={area} />
                    {days.map((day, index) =>
                        day.failed ? (
                            <rect
                                key={index}
                                className="dashboard-chart__failed"
                                x={x(index) - barWidth / 2}
                                y={y(day.failed)}
                                width={barWidth}
                                height={y(0) - y(day.failed)}
                                rx={Math.min(2, barWidth / 2)}
                            />
                        ) : null,
                    )}
                    <path className="dashboard-chart__line" d={line} />
                    {shown ? (
                        <>
                            <line className="dashboard-chart__crosshair" x1={x(shownIndex)} x2={x(shownIndex)} y1={margin.top} y2={y(0)} />
                            <circle className="dashboard-chart__point" cx={x(shownIndex)} cy={y(shown.deploys)} r={4.5} />
                        </>
                    ) : null}
                    <rect
                        className="dashboard-chart__hit"
                        x={margin.left}
                        y={margin.top}
                        width={plotWidth}
                        height={plotHeight}
                        onPointerMove={pick}
                        onPointerDown={pick}
                        onPointerLeave={() => setActive(null)}
                    />
                </svg>
            ) : null}

            {shown ? (
                <div
                    className="dashboard-chart__readout"
                    style={onRight ? { right: width - x(shownIndex) + 12 } : { left: x(shownIndex) + 12 }}
                    aria-hidden="true"
                >
                    <span className="dashboard-chart__readout-date">{longDate.format(shown.date)}</span>
                    <span className="dashboard-chart__readout-row">
                        <span className="dashboard-chart__key-line" />
                        <strong>{shown.deploys}</strong> deploys
                    </span>
                    <span className="dashboard-chart__readout-row">
                        <span className="dashboard-chart__key-bar" />
                        <strong>{shown.failed}</strong> failed
                    </span>
                </div>
            ) : null}
            <VisuallyHidden aria-live="polite">
                {shown ? `${longDate.format(shown.date)}: ${shown.deploys} deploys, ${shown.failed} failed.` : ""}
            </VisuallyHidden>
        </div>
    );
}

const ranges = [
    { value: "7", label: "7 days" },
    { value: "30", label: "30 days" },
    { value: "90", label: "90 days" },
];

export function DashboardChart() {
    const [range, setRange] = useState("30");
    const [project, setProject] = useState("all");

    const series = useMemo(() => (project === "all" ? allProjects() : byProject[project]!), [project]);
    const length = Number(range);
    const current = series.slice(-length);
    const now = summarise(current);
    const before = summarise(series.slice(-length * 2, -length));
    const deployChange = before.deploys ? ((now.deploys - before.deploys) / before.deploys) * 100 : 0;
    const buildChange = Math.round(now.build - before.build);

    return (
        <Dashboard01
            title="Deploys"
            description="How often your team ships, and how well it goes."
            filters={[
                {
                    kind: "select",
                    label: "Project",
                    value: project,
                    onChange: setProject,
                    options: [{ value: "all", label: "All projects" }, ...projects.map((entry) => ({ value: entry.id, label: entry.id }))],
                },
                { kind: "segmented", label: "Time range", options: ranges, value: range, onChange: setRange },
            ]}
            stats={[
                {
                    icon: <Rocket size={14} />,
                    label: "Deploys",
                    value: now.deploys.toLocaleString("en-GB"),
                    change: sign(deployChange, "%"),
                    description: `vs the ${length} days before`,
                },
                {
                    icon: <CircleCheck size={14} />,
                    label: "Succeeded",
                    value: `${now.success.toFixed(1)}%`,
                    change: sign(now.success - before.success, " pts"),
                    description: "of deploys went live",
                },
                {
                    icon: <Timer size={14} />,
                    label: "Average build",
                    value: duration(now.build),
                    change: sign(buildChange, " s"),
                    changeTone: buildChange === 0 ? "neutral" : buildChange < 0 ? "positive" : "negative",
                    description: "from push to live",
                },
                {
                    icon: <Bot size={14} />,
                    label: "Shipped by agents",
                    value: `${Math.round(now.agents)}%`,
                    change: sign(now.agents - before.agents, " pts"),
                    changeTone: "neutral",
                    description: "of all deploys",
                },
            ]}
            chart={{
                title: "Deploys per day",
                description: (
                    <>
                        {now.deploys.toLocaleString("en-GB")} deploys in the last {length} days, {project === "all" ? "across five projects" : `to ${project}`}
                    </>
                ),
                legend: [
                    { label: "Deploys", swatch: <span className="dashboard-chart__key-line" aria-hidden="true" /> },
                    { label: "Failed", swatch: <span className="dashboard-chart__key-bar" aria-hidden="true" /> },
                ],
                content: <DeployChart days={current} label={`Deploys per day${project === "all" ? "" : ` to ${project}`}`} />,
            }}
        />
    );
}
