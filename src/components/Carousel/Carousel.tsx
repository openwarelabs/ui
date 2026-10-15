import {
    Children,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type FocusEvent,
    type KeyboardEvent,
} from "react";

import { Button } from "@/components/Button/Button";
import { useControllableState } from "@/hooks/useControllableState";
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { CarouselProps, CarouselSlideProps } from "./Carousel.types";

export type { CarouselLabels, CarouselProps, CarouselSlideProps } from "./Carousel.types";

/** Each slide's default name, "2 of 5", from the Carousel around it. */
const SlideLabelContext = createContext<string | undefined>(undefined);

const reducedMotion = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
const slideName = (n: number, count: number) => `Slide ${n} of ${count}`;
const positionName = (n: number, count: number) => `${n} of ${count}`;

/**
 * Slides in a row that scroll and snap into place: swipe them, or use the previous and next buttons, the dots or the
 * arrow keys. It's the browser's own scrolling, so it follows a finger or a trackpad exactly.
 */
export function Carousel({
    label,
    children,
    slidesPerView,
    gap,
    align = "start",
    index,
    defaultIndex = 0,
    onIndexChange,
    loop = false,
    autoplay = false,
    arrows = "overlay",
    indicators = true,
    labels = {},
    className,
    style,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    ...props
}: CarouselProps) {
    const slides = Children.toArray(children).filter(isValidElement);
    const count = slides.length;
    const trackRef = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useControllableState(index, defaultIndex, onIndexChange);
    // The last place it can rest: with several slides in view, the end comes before the last slide reaches the start.
    const [last, setLast] = useState(Math.max(0, count - 1));
    const active = Math.max(0, Math.min(current, last));
    // The slide the track is resting on (or heading to), so a change of `current` from a swipe doesn't scroll again.
    const restingRef = useRef(-1);

    const target = useCallback(
        (i: number) => {
            const track = trackRef.current;
            const slide = track?.children[i] as HTMLElement | undefined;
            if (!track || !slide) return 0;
            const offset = align === "center" ? (track.clientWidth - slide.offsetWidth) / 2 : 0;
            return Math.max(0, Math.min(slide.offsetLeft - offset, track.scrollWidth - track.clientWidth));
        },
        [align],
    );

    // Measure where it can rest whenever the size or the slides change.
    useLayoutEffect(() => {
        const track = trackRef.current;
        if (!track) return undefined;
        const measure = () => {
            const end = track.scrollWidth - track.clientWidth;
            let i = 0;
            while (i < count - 1 && target(i) < end - 1) i += 1;
            setLast(i);
        };
        measure();
        const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
        observer?.observe(track);
        return () => observer?.disconnect();
    }, [count, target, slidesPerView, gap]);

    // Scroll to the current slide when it changes from outside the track: a button, a dot, a key, the `index` prop.
    useLayoutEffect(() => {
        const track = trackRef.current;
        if (!track || active === restingRef.current) return;
        const first = restingRef.current === -1;
        restingRef.current = active;
        track.scrollTo({ left: target(active), behavior: first || reducedMotion() ? "auto" : "smooth" });
    }, [active, target]);

    // When a swipe, a drag or a scroll comes to rest, the slide nearest the start (or centre) becomes current.
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return undefined;
        let timer = 0;
        const settle = () => {
            let nearest = 0;
            for (let i = 1; i <= last; i += 1) {
                if (Math.abs(target(i) - track.scrollLeft) < Math.abs(target(nearest) - track.scrollLeft)) nearest = i;
            }
            restingRef.current = nearest;
            setCurrent(nearest);
        };
        const onScroll = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(settle, 120);
        };
        const native = "onscrollend" in window;
        track.addEventListener(native ? "scrollend" : "scroll", native ? settle : onScroll, { passive: true });
        return () => {
            window.clearTimeout(timer);
            track.removeEventListener(native ? "scrollend" : "scroll", native ? settle : onScroll);
        };
    }, [last, target, setCurrent]);

    const go = useCallback(
        (i: number, wrap = loop) => {
            const next = wrap ? (i + last + 1) % (last + 1) : Math.max(0, Math.min(i, last));
            restingRef.current = -2; // scroll even if it's already current but was swiped part way
            setCurrent(next);
            const track = trackRef.current;
            if (next === active && track) {
                restingRef.current = next;
                track.scrollTo({ left: target(next), behavior: reducedMotion() ? "auto" : "smooth" });
            }
        },
        [loop, last, active, setCurrent, target],
    );

    // Autoplay: moves on every `interval` ms unless paused, hovered or focused. Reduced motion starts it paused.
    const interval = autoplay === true ? 5000 : autoplay || 0;
    const [stopped, setStopped] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    useEffect(() => {
        if (reducedMotion()) setStopped(true);
    }, []);
    const playing = interval > 0 && last > 0 && !stopped && !hovered && !focused;
    useEffect(() => {
        if (!playing) return undefined;
        const timer = window.setTimeout(() => go(active + 1, true), interval);
        return () => window.clearTimeout(timer);
    }, [playing, interval, active, go]);

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return;
        const to = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: last }[event.key];
        if (to === undefined) return;
        event.preventDefault();
        go(to);
    };

    const name = labels.slide ?? slideName;
    const controls = last > 0;
    const vars = {
        ...(slidesPerView === undefined ? {} : { "--ow-carousel-per-view": slidesPerView }),
        ...(gap === undefined ? {} : { "--ow-carousel-gap": gap === "none" ? "0px" : `var(--ow-space-${gap})` }),
        ...style,
    } as CSSProperties;

    return (
        <section
            aria-roledescription="carousel"
            aria-label={label}
            className={cx("ow-carousel", `ow-carousel--${align}`, arrows && controls && `ow-carousel--arrows-${arrows}`, className)}
            style={vars}
            onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setHovered(true);
                onPointerEnter?.(event);
            }}
            onPointerLeave={(event) => {
                setHovered(false);
                onPointerLeave?.(event);
            }}
            onFocus={(event: FocusEvent<HTMLElement>) => {
                setFocused(true);
                onFocus?.(event);
            }}
            onBlur={(event: FocusEvent<HTMLElement>) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
                onBlur?.(event);
            }}
            {...props}
        >
            <div className="ow-carousel__viewport">
                {interval > 0 && controls ? (
                    <Button
                        variant="secondary"
                        size="sm"
                        iconOnly
                        className="ow-carousel__play"
                        aria-label={stopped ? (labels.play ?? "Play slides") : (labels.pause ?? "Pause slides")}
                        onClick={() => setStopped((previous) => !previous)}
                    >
                        {stopped ? <PlayIcon size={14} /> : <PauseIcon size={14} />}
                    </Button>
                ) : null}
                {arrows && controls ? (
                    <>
                        <Button
                            variant="secondary"
                            size="sm"
                            iconOnly
                            className="ow-carousel__arrow ow-carousel__arrow--previous"
                            aria-label={labels.previous ?? "Previous slide"}
                            disabled={!loop && active === 0}
                            onClick={() => go(active - 1)}
                        >
                            <ChevronLeftIcon size={16} />
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            iconOnly
                            className="ow-carousel__arrow ow-carousel__arrow--next"
                            aria-label={labels.next ?? "Next slide"}
                            disabled={!loop && active === last}
                            onClick={() => go(active + 1)}
                        >
                            <ChevronRightIcon size={16} />
                        </Button>
                    </>
                ) : null}
                <div ref={trackRef} className="ow-carousel__track" tabIndex={controls ? 0 : undefined} onKeyDown={onKeyDown}>
                    {slides.map((slide, i) => (
                        <SlideLabelContext.Provider key={slide.key ?? i} value={(labels.position ?? positionName)(i + 1, count)}>
                            {slide}
                        </SlideLabelContext.Provider>
                    ))}
                </div>
            </div>
            {indicators && controls ? (
                <div className="ow-carousel__dots" role="group" aria-label={labels.indicators ?? "Choose a slide"}>
                    {Array.from({ length: last + 1 }, (_, i) => (
                        <button
                            key={i}
                            type="button"
                            className="ow-carousel__dot"
                            aria-label={name(i + 1, count)}
                            aria-current={i === active ? "true" : undefined}
                            onClick={() => go(i, false)}
                        />
                    ))}
                </div>
            ) : null}
            <span className="ow-visually-hidden" aria-live={playing ? "off" : "polite"} aria-atomic="true">
                {controls ? name(active + 1, count) : null}
            </span>
        </section>
    );
}

/** One slide of a Carousel. Screen readers hear it as a slide, named "2 of 5" unless you give it a `label`. */
export function CarouselSlide({ label, className, ...props }: CarouselSlideProps) {
    const position = useContext(SlideLabelContext);
    return <div role="group" aria-roledescription="slide" aria-label={label ?? position} className={cx("ow-carousel__slide", className)} {...props} />;
}
