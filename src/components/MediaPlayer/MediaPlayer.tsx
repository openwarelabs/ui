import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

import { AspectRatio } from "@/components/AspectRatio/AspectRatio";
import { Button } from "@/components/Button/Button";
import { Menu, MenuItem } from "@/components/Menu/Menu";
import { Slider } from "@/components/Slider/Slider";
import { CheckIcon, PauseIcon, PlayIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { MediaPlayerHandle, MediaPlayerProps } from "./MediaPlayer.types";

export type { MediaPlayerHandle, MediaPlayerLabels, MediaPlayerProps, MediaPlayerSource, MediaPlayerTrack } from "./MediaPlayer.types";

// Lucide shapes (ISC licence), each drawn as one path: volume-2, volume-x, maximize, minimize, captions, picture-in-picture-2.
const paths = {
    volume: "M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6a1.4 1.4 0 0 1-1 .4H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5zM16 9a5 5 0 0 1 0 6M19.4 18.4a9 9 0 0 0 0-12.8",
    muted: "M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6a1.4 1.4 0 0 1-1 .4H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5zM22 9l-6 6M16 9l6 6",
    expand: "M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3",
    shrink: "M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3",
    captions: "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM7 15h4M15 15h2M7 11h2M13 11h4",
    pip: "M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M14 13h6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z",
};
const glyph = (d: string) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d={d} />
    </svg>
);

const two = (n: number) => String(n).padStart(2, "0");
/** 65 → "1:05", 3725 → "1:02:05". */
const clock = (seconds: number) => {
    const s = Math.floor(seconds) || 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor(s / 60) % 60;
    return `${h ? `${h}:${two(m)}` : m}:${two(s % 60)}`;
};
const audioFile = /^audio\/|\.(mp3|m4a|aac|wav|flac|oga|opus)([?#]|$)/i;

const defaultLabels = {
    play: "Play",
    pause: "Pause",
    seek: "Seek",
    volume: "Volume",
    mute: "Mute",
    unmute: "Unmute",
    speed: "Playback speed",
    captions: "Captions",
    captionsOff: "Off",
    fullscreen: "Full screen",
    exitFullscreen: "Exit full screen",
    pictureInPicture: "Picture in picture",
    position: (time: string, duration: string) => `${time} of ${duration}`,
};

/**
 * Plays audio or video with controls built from the library's own buttons, sliders and menu: play, a timeline that shows
 * what's loaded, volume, speed, captions, picture in picture and full screen. The native `<video>` or `<audio>` does the
 * playing; the keys a video site uses work while focus is in the player.
 */
export const MediaPlayer = forwardRef<MediaPlayerHandle, MediaPlayerProps>(function MediaPlayer(
    {
        src,
        kind,
        poster,
        title,
        tracks = [],
        autoPlay = false,
        loop = false,
        muted = false,
        playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2],
        ratio = 16 / 9,
        controls = "full",
        preload = "metadata",
        onTimeUpdate,
        onPlayingChange,
        onEnded,
        labels: labelsProp,
        "aria-label": ariaLabel,
        id,
        className,
        style,
    },
    ref,
) {
    const sources = typeof src === "string" ? [{ src }] : src;
    const video = (kind ?? (sources.every((source) => audioFile.test(source.type ?? source.src)) ? "audio" : "video")) === "video";
    const labels = { ...defaultLabels, player: video ? "Video player" : "Audio player", ...labelsProp };
    const full = controls === "full";
    const rootRef = useRef<HTMLDivElement>(null);
    const mediaRef = useRef<HTMLVideoElement>(null);
    const idleTimer = useRef(0);
    // A recording made with MediaRecorder has no length until it's been read to the end; see onLoadedMetadata.
    const findingLength = useRef(false);
    const lastCaptions = useRef(Math.max(0, tracks.findIndex((track) => track.default)));
    const [state, setState] = useState({ playing: false, time: 0, duration: 0, buffered: 0, volume: 1, muted, rate: 1 });
    const [captions, setCaptions] = useState(() => tracks.findIndex((track) => track.default));
    const [screen, setScreen] = useState({ canFull: false, canPip: false, full: false, pip: false });
    const [idle, setIdle] = useState(false);
    const [controlsFocused, setControlsFocused] = useState(false);
    const { playing, time, duration, volume, rate } = state;
    const silent = state.muted || volume === 0;

    const sync = () => {
        const el = mediaRef.current;
        if (!el) return;
        const length = Number.isFinite(el.duration) ? el.duration : 0;
        let buffered = 0;
        for (let i = 0; i < el.buffered.length; i++) if (el.buffered.start(i) <= el.currentTime + 0.5) buffered = el.buffered.end(i);
        setState({ playing: !el.paused, time: el.currentTime, duration: length, buffered, volume: el.volume, muted: el.muted, rate: el.playbackRate });
    };

    const seek = (to: number) => {
        const el = mediaRef.current;
        if (el) el.currentTime = Math.max(0, Math.min(to, el.duration || 0));
    };
    const toggle = () => {
        const el = mediaRef.current;
        if (el?.paused) el.play().catch(() => undefined);
        else el?.pause();
    };
    const setVolume = (next: number) => {
        const el = mediaRef.current;
        if (!el) return;
        el.volume = Math.max(0, Math.min(1, next));
        el.muted = el.volume === 0;
    };
    const toggleMute = () => {
        const el = mediaRef.current;
        if (!el) return;
        if (silent && el.volume === 0) el.volume = 0.5;
        el.muted = !silent;
    };
    const toggleFullscreen = () => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
        else rootRef.current?.requestFullscreen().catch(() => undefined);
    };
    const togglePip = () => {
        if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => undefined);
        else mediaRef.current?.requestPictureInPicture().catch(() => undefined);
    };
    const showCaptions = (index: number) => {
        if (index >= 0) lastCaptions.current = index;
        setCaptions(index);
    };

    useImperativeHandle(
        ref,
        () => ({
            play: () => mediaRef.current?.play() ?? Promise.resolve(),
            pause: () => mediaRef.current?.pause(),
            seek,
            get media() {
                return mediaRef.current;
            },
        }),
        [],
    );

    // The chosen captions show; the browser draws them. The rest stay loaded but hidden.
    useEffect(() => {
        const list = mediaRef.current?.textTracks;
        for (let i = 0; list && i < list.length; i++) list[i]!.mode = i === captions ? "showing" : "hidden";
    }, [captions, tracks.length]);

    // What the browser can do (only known in it), and whether this player is full screen or in picture in picture.
    useEffect(() => {
        const el = mediaRef.current;
        const update = () =>
            setScreen({
                canFull: video && Boolean(document.fullscreenEnabled),
                canPip: video && Boolean(document.pictureInPictureEnabled),
                full: Boolean(rootRef.current) && document.fullscreenElement === rootRef.current,
                pip: Boolean(el) && document.pictureInPictureElement === el,
            });
        update();
        document.addEventListener("fullscreenchange", update);
        el?.addEventListener("enterpictureinpicture", update);
        el?.addEventListener("leavepictureinpicture", update);
        return () => {
            document.removeEventListener("fullscreenchange", update);
            el?.removeEventListener("enterpictureinpicture", update);
            el?.removeEventListener("leavepictureinpicture", update);
        };
    }, [video]);

    useEffect(() => () => window.clearTimeout(idleTimer.current), []);

    // Any movement or key shows a video's controls again, until it's been still for a while.
    const wake = () => {
        setIdle(false);
        window.clearTimeout(idleTimer.current);
        idleTimer.current = window.setTimeout(() => setIdle(true), 2500);
    };

    function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const target = event.target as HTMLElement;
        if (event.altKey || event.ctrlKey || event.metaKey || target.closest('[role="menu"]')) return;
        const onButton = target.tagName === "BUTTON";
        // The volume slider keeps its own arrow keys; the timeline's are taken over to move by 5 seconds.
        const onVolume = Boolean(target.closest(".ow-media__volume")) && event.key.startsWith("Arrow");
        const actions: Record<string, () => void> = {
            " ": toggle,
            k: toggle,
            ArrowLeft: () => seek(time - 5),
            ArrowRight: () => seek(time + 5),
            j: () => seek(time - 10),
            l: () => seek(time + 10),
            ArrowUp: () => setVolume(volume + 0.1),
            ArrowDown: () => setVolume(volume - 0.1),
            m: toggleMute,
            f: () => screen.canFull && toggleFullscreen(),
            c: () => tracks.length && showCaptions(captions < 0 ? lastCaptions.current : -1),
        };
        const action = actions[event.key.length === 1 ? event.key.toLowerCase() : event.key];
        if (!action || onVolume || (onButton && event.key === " ")) return;
        event.preventDefault();
        action();
        wake();
    }

    const hidden = video && playing && idle && !controlsFocused;
    const pct = (n: number) => `${duration ? (n / duration) * 100 : 0}%`;
    const iconButton = (label: string, icon: ReactNode, onClick: () => void, pressed?: boolean, className?: string) => (
        <Button variant="ghost" size="sm" iconOnly aria-label={label} aria-pressed={pressed} onClick={onClick} className={className}>
            {icon}
        </Button>
    );
    const choice = (key: string | number, label: string, checked: boolean, onSelect: () => void) => (
        <MenuItem key={key} role="menuitemradio" aria-checked={checked} icon={checked ? <CheckIcon size={15} /> : <span className="ow-media__blank" />} onSelect={onSelect}>
            {label}
        </MenuItem>
    );

    // <video> or <audio>: they take the same props here, so one element type keeps the ref and the handlers simple.
    const Media = (video ? "video" : "audio") as "video";
    const media = (
        <Media
            ref={mediaRef}
            className="ow-media__element"
            src={typeof src === "string" ? src : undefined}
            poster={video ? poster : undefined}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            preload={preload}
            playsInline={video || undefined}
            onClick={toggle}
            onLoadStart={sync}
            onLoadedMetadata={(event) => {
                if (event.currentTarget.duration === Infinity) {
                    // Reading to the end makes the browser work out the length; durationchange then goes back to the start.
                    findingLength.current = true;
                    event.currentTarget.currentTime = 1e101;
                }
                sync();
            }}
            onDurationChange={(event) => {
                if (findingLength.current && Number.isFinite(event.currentTarget.duration)) {
                    findingLength.current = false;
                    event.currentTarget.currentTime = 0;
                }
                sync();
            }}
            onProgress={sync}
            onVolumeChange={sync}
            onRateChange={sync}
            onSeeking={sync}
            onEmptied={sync}
            onTimeUpdate={(event) => {
                sync();
                const el = event.currentTarget;
                if (!findingLength.current) onTimeUpdate?.(el.currentTime, Number.isFinite(el.duration) ? el.duration : 0);
            }}
            onPlay={() => {
                sync();
                wake();
                onPlayingChange?.(true);
            }}
            onPause={() => {
                sync();
                onPlayingChange?.(false);
            }}
            onEnded={() => onEnded?.()}
        >
            {typeof src === "string" ? null : sources.map((source) => <source key={source.src} src={source.src} type={source.type} />)}
            {video ? tracks.map((track) => <track key={track.src} kind="captions" src={track.src} srcLang={track.srcLang} label={track.label} default={track.default} />) : null}
        </Media>
    );

    return (
        <div
            ref={rootRef}
            id={id}
            role="group"
            aria-label={ariaLabel ?? title ?? labels.player}
            tabIndex={-1}
            className={cx(
                "ow-media",
                video ? "ow-media--video" : "ow-media--audio",
                hidden && "ow-media--idle",
                screen.full && "ow-media--fullscreen",
                className,
            )}
            style={style}
            onKeyDown={onKeyDown}
            onPointerMove={video ? wake : undefined}
            onPointerLeave={video ? () => setIdle(true) : undefined}
        >
            {video ? (
                <AspectRatio ratio={ratio} className="ow-media__screen">
                    {media}
                </AspectRatio>
            ) : (
                <>
                    {media}
                    {title ? <div className="ow-media__title">{title}</div> : null}
                </>
            )}
            <div
                className="ow-media__controls"
                onFocus={() => setControlsFocused(true)}
                onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setControlsFocused(false);
                }}
            >
                {iconButton(playing ? labels.pause : labels.play, playing ? <PauseIcon /> : <PlayIcon />, toggle)}
                <div className="ow-media__seek" style={{ "--ow-media-buffered": pct(state.buffered) } as CSSProperties}>
                    <Slider
                        aria-label={labels.seek}
                        min={0}
                        max={duration || 1}
                        step={0.1}
                        value={Math.min(time, duration || 1)}
                        onChange={seek}
                        disabled={!duration}
                        showValue={false}
                        formatValue={(value) => labels.position(clock(value), clock(duration))}
                    />
                </div>
                <span className="ow-media__time" aria-hidden="true">
                    {clock(time)} / {clock(duration)}
                </span>
                {full ? (
                    <>
                        {iconButton(silent ? labels.unmute : labels.mute, glyph(silent ? paths.muted : paths.volume), toggleMute, undefined, "ow-media__mute")}
                        <div className="ow-media__volume">
                            <Slider
                                aria-label={labels.volume}
                                min={0}
                                max={1}
                                step={0.05}
                                value={silent ? 0 : volume}
                                onChange={setVolume}
                                showValue={false}
                                formatValue={(value) => `${Math.round(value * 100)}%`}
                            />
                        </div>
                        {playbackRates.length ? (
                            <Menu
                                label={labels.speed}
                                align="end"
                                above
                                width={120}
                                trigger={
                                    <Button variant="ghost" size="sm" aria-label={`${labels.speed} ${rate}×`} className="ow-media__rate">
                                        {rate}×
                                    </Button>
                                }
                            >
                                {playbackRates.map((option) =>
                                    choice(option, `${option}×`, option === rate, () => {
                                        if (mediaRef.current) mediaRef.current.playbackRate = option;
                                    }),
                                )}
                            </Menu>
                        ) : null}
                        {video && tracks.length === 1
                            ? iconButton(labels.captions, glyph(paths.captions), () => showCaptions(captions < 0 ? 0 : -1), captions === 0)
                            : null}
                        {video && tracks.length > 1 ? (
                            <Menu label={labels.captions} align="end" above trigger={iconButton(labels.captions, glyph(paths.captions), () => undefined, undefined, cx(captions >= 0 && "ow-media__on"))}>
                                {choice(-1, labels.captionsOff, captions < 0, () => showCaptions(-1))}
                                {tracks.map((track, index) => choice(track.src, track.label, index === captions, () => showCaptions(index)))}
                            </Menu>
                        ) : null}
                        {screen.canPip ? iconButton(labels.pictureInPicture, glyph(paths.pip), togglePip, screen.pip, "ow-media__pip") : null}
                        {screen.canFull
                            ? iconButton(screen.full ? labels.exitFullscreen : labels.fullscreen, glyph(screen.full ? paths.shrink : paths.expand), toggleFullscreen)
                            : null}
                    </>
                ) : null}
            </div>
        </div>
    );
});
