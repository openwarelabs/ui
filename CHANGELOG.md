# Changelog

Every release of @openwarelabs/ui, @openwarelabs/blocks and @openwarelabs/ui-mcp. `npm run release` writes it from the commits, and the docs' Releases page shows it.

## 0.22.0 (2026-10-16)

3 new components.

### New components

- **[TimeRangeField](https://openwarelabs.github.io/ui/#/components/time-range-field)** and **[DurationField](https://openwarelabs.github.io/ui/#/components/duration-field)**: a start and an end time, and a length of time typed in segments ([#80](https://github.com/openwarelabs/ui/pull/80), [00ad9a8](https://github.com/openwarelabs/ui/commit/00ad9a87014df61e6bc81093532f59663aebad69))
- **[Marquee](https://openwarelabs.github.io/ui/#/components/marquee)**: a strip of logos, figures or tags that travel endlessly ([#81](https://github.com/openwarelabs/ui/pull/81), [05ea166](https://github.com/openwarelabs/ui/commit/05ea166a1a2a766e856a99501878e39ca3381b0d))

### Other changes

- tidy after the component batch, README count, duplicated AI line and size-limits formatting ([#92](https://github.com/openwarelabs/ui/pull/92), [f195a5b](https://github.com/openwarelabs/ui/commit/f195a5b1bec6308b642113651a96621508985055))
- show new components' previews and counts on Releases ([#91](https://github.com/openwarelabs/ui/pull/91), [4dcf7c8](https://github.com/openwarelabs/ui/commit/4dcf7c87bcd3e565cb2f1e14cf53de3046f0028b))

## 0.21.0 (2026-10-16)

3 new components.

### New components

- **[Portal](https://openwarelabs.github.io/ui/#/components/portal)** and **[FocusTrap](https://openwarelabs.github.io/ui/#/components/focus-trap)**: primitives for overlays of your own ([#88](https://github.com/openwarelabs/ui/pull/88), [4edc9fa](https://github.com/openwarelabs/ui/commit/4edc9fab620a7485ba17464226b56437ec477868))
- **[Affix](https://openwarelabs.github.io/ui/#/components/affix)**: an element that sticks to the top or bottom while you scroll ([#89](https://github.com/openwarelabs/ui/pull/89), [699dc4a](https://github.com/openwarelabs/ui/commit/699dc4af442b0574c3154fbc6f2c5a49f4683b8a))

## 0.20.0 (2026-10-16)

4 new components.

### New components

- **[Watermark](https://openwarelabs.github.io/ui/#/components/watermark)**: text or a logo tiled over drafts and previews ([#86](https://github.com/openwarelabs/ui/pull/86), [c047818](https://github.com/openwarelabs/ui/commit/c047818f1d374f5589569655f13ca25c831c6617))
- **[Callout](https://openwarelabs.github.io/ui/#/components/callout)**: a note set apart from the text in docs and articles ([#85](https://github.com/openwarelabs/ui/pull/85), [b37bfb0](https://github.com/openwarelabs/ui/commit/b37bfb0e8a73fd7faaa7c57e3ac2aeffbd1bedb9))
- **[LogViewer](https://openwarelabs.github.io/ui/#/components/log-viewer)**: streaming terminal output with ANSI colours that follows its newest line ([#83](https://github.com/openwarelabs/ui/pull/83), [ae201ae](https://github.com/openwarelabs/ui/commit/ae201ae2b093870e0b6a3af6854689e255cacf2d))
- **[CommentThread](https://openwarelabs.github.io/ui/#/components/comment-thread)**: comments nested by parentId with reply, edit, delete and reactions ([#82](https://github.com/openwarelabs/ui/pull/82), [563df49](https://github.com/openwarelabs/ui/commit/563df49139984d6ede4d5d7e66eac7d01e906ab5))

## 0.19.0 (2026-10-16)

5 new components.

### New components

- **[JsonViewer](https://openwarelabs.github.io/ui/#/components/json-viewer)**: a JSON document as a tree of rows to open, search and copy ([#78](https://github.com/openwarelabs/ui/pull/78), [515cf97](https://github.com/openwarelabs/ui/commit/515cf97dd439604c62dc707a4ba9c9826a505003))
- **[Gantt](https://openwarelabs.github.io/ui/#/components/gantt)**: a timeline of tasks with groups, progress, dependencies and bars moved by pointer or keyboard ([#87](https://github.com/openwarelabs/ui/pull/87), [bb9bc3d](https://github.com/openwarelabs/ui/commit/bb9bc3d130b3a1428d4f94204aeb9986a1a45981))
- **[Countdown](https://openwarelabs.github.io/ui/#/components/countdown)** and **[RelativeTime](https://openwarelabs.github.io/ui/#/components/relative-time)**: the time left until a moment and a moment as people say it ([#79](https://github.com/openwarelabs/ui/pull/79), [31dbd58](https://github.com/openwarelabs/ui/commit/31dbd58710ad28d82ac56edb18e3ad24ebf008df))
- **[Lightbox](https://openwarelabs.github.io/ui/#/components/lightbox)**: a fullscreen zoomable viewer for one image or a gallery ([#75](https://github.com/openwarelabs/ui/pull/75), [2ac4985](https://github.com/openwarelabs/ui/commit/2ac4985ed73545579dda659034506e9d55bb309a))

### Other changes

- ask for a git worktree per branch in CLAUDE.md ([#90](https://github.com/openwarelabs/ui/pull/90), [648d8c5](https://github.com/openwarelabs/ui/commit/648d8c518ab0f247329c8f81c6b324d3c36bbc91))

## 0.18.0 (2026-10-16)

11 new components and 1 fix.

### New components

- **[Truncate](https://openwarelabs.github.io/ui/#/components/truncate)**: text cut in the middle for file names, at the start for paths, or clamped to lines, with the full text in a Tooltip ([#84](https://github.com/openwarelabs/ui/pull/84), [08599c6](https://github.com/openwarelabs/ui/commit/08599c6c0e859961249e92aaa57575b8ea53ad22))
- **[MarkdownEditor](https://openwarelabs.github.io/ui/#/components/markdown-editor)**: a Markdown text box with a formatting toolbar and a preview ([#77](https://github.com/openwarelabs/ui/pull/77), [d97468a](https://github.com/openwarelabs/ui/commit/d97468a6e26934a60178a480ef71e24df3d0b210))
- **[AreaChart](https://openwarelabs.github.io/ui/#/components/area-chart)** and **[PieChart](https://openwarelabs.github.io/ui/#/components/pie-chart)** and **[ScatterChart](https://openwarelabs.github.io/ui/#/components/scatter-chart)**: stacked areas, a disc with shares on it and points on two numeric axes ([#73](https://github.com/openwarelabs/ui/pull/73), [d56ffb2](https://github.com/openwarelabs/ui/commit/d56ffb2f631aedccba9623748d6f6f6251ffd495))
- **[Collapsible](https://openwarelabs.github.io/ui/#/components/collapsible)**: show and hide content under your own trigger ([#69](https://github.com/openwarelabs/ui/pull/69), [27dc1e9](https://github.com/openwarelabs/ui/commit/27dc1e9a208140b582dd0da56074648da2cdcc3d))
- **[BottomSheet](https://openwarelabs.github.io/ui/#/components/bottom-sheet)**: a swipeable sheet from the bottom of the screen with snap points ([#72](https://github.com/openwarelabs/ui/pull/72), [52d7d17](https://github.com/openwarelabs/ui/commit/52d7d175efbad662a2d71f6a0df95631496d991b))
- **[ImageCropper](https://openwarelabs.github.io/ui/#/components/image-cropper)**: move and zoom a picture under a frame for an avatar or a banner ([#76](https://github.com/openwarelabs/ui/pull/76), [e12b2d6](https://github.com/openwarelabs/ui/commit/e12b2d6e7b0717fa93250635bd73d4f5e67093a2))
- **[Wizard](https://openwarelabs.github.io/ui/#/components/wizard)**: a form in pages with a Steps strip, checks per step and Back and Next ([#71](https://github.com/openwarelabs/ui/pull/71), [7bf86eb](https://github.com/openwarelabs/ui/commit/7bf86ebe49c157b0113c92121413ae8af639b94c))
- **[TableOfContents](https://openwarelabs.github.io/ui/#/components/table-of-contents)**: a page's headings as links that follow the scroll ([#70](https://github.com/openwarelabs/ui/pull/70), [1cc8722](https://github.com/openwarelabs/ui/commit/1cc8722f9af8a91c9fca85036249f457ac4d8666))
- **[ScrollArea](https://openwarelabs.github.io/ui/#/components/scroll-area)**: a scrolling area with thin theme-coloured scrollbars that show on hover or while scrolling ([#68](https://github.com/openwarelabs/ui/pull/68), [d5f63c8](https://github.com/openwarelabs/ui/commit/d5f63c8e46eed1dd76cd7bf5b4937cbdd5014a0e))

### Fixes

- stop two-line options overlapping in a scrolling list, and props tables squeezing the Type column ([#74](https://github.com/openwarelabs/ui/pull/74), [69cbdef](https://github.com/openwarelabs/ui/commit/69cbdefc356b2af61346182c504a263ad9669e5f))

## 0.17.1 (2026-10-16)

### Other changes

- fold the components sidebar into categories, with a filter and New pills ([#67](https://github.com/openwarelabs/ui/pull/67), [d0a71d4](https://github.com/openwarelabs/ui/commit/d0a71d420fca1f0bea2c45373b661bdca1e8208e))
- use an Irish cast of example names ([#66](https://github.com/openwarelabs/ui/pull/66), [b9c482e](https://github.com/openwarelabs/ui/commit/b9c482e171533263da1c7f0533a25dba91257d9e))

## 0.17.0 (2026-10-16)

2 new components and 1 fix.

### New components

- **[DataGrid](https://openwarelabs.github.io/ui/#/components/data-grid)** and **[Kanban](https://openwarelabs.github.io/ui/#/components/kanban)**: a table for thousands of rows and a board of cards to drag between columns ([#65](https://github.com/openwarelabs/ui/pull/65), [c649aa7](https://github.com/openwarelabs/ui/commit/c649aa706a8511d1ad790d77dcf809d19a0b5cf2))

### Fixes

- **tokens:** soften every bold weight so headings, buttons and labels look less thick ([#64](https://github.com/openwarelabs/ui/pull/64), [c60dea3](https://github.com/openwarelabs/ui/commit/c60dea33a9357445c60565b3470ae36b9be425a7))

## 0.16.3 (2026-10-16)

### Other changes

- hide the Blocks section for now ([#61](https://github.com/openwarelabs/ui/pull/61), [e73afff](https://github.com/openwarelabs/ui/commit/e73afff357674b2509161aeecd2fffa8f19a83a1))
- add a CLAUDE.md with the branch, commit and pull request rules ([#62](https://github.com/openwarelabs/ui/pull/62), [ec4b4de](https://github.com/openwarelabs/ui/commit/ec4b4de61c88155db186a7138d58e6bf6c105ccb))

## 0.16.2 (2026-10-15)

1 fix.

### Fixes

- **Badge:** use the small pill unless a size is asked for ([#60](https://github.com/openwarelabs/ui/pull/60), [cdf4ff7](https://github.com/openwarelabs/ui/commit/cdf4ff786d89e502767b962cdbb00bbc702193b8))

## 0.16.1 (2026-10-15)

1 performance change.

### Performance

- merge the ESM build's React imports into one statement per package ([#58](https://github.com/openwarelabs/ui/pull/58), [cbd00db](https://github.com/openwarelabs/ui/commit/cbd00dbcc9c9a8fb48f4ee4c4ec929db9969090d))

## 0.16.0 (2026-10-15)

10 new components.

### New components

- **[SignaturePad](https://openwarelabs.github.io/ui/#/components/signature-pad)**: a box to sign with a mouse, finger or pen ([#55](https://github.com/openwarelabs/ui/pull/55), [11816c6](https://github.com/openwarelabs/ui/commit/11816c6ce5f58657f2e56f09bdc7ac99776c8319))
- **[NotificationCenter](https://openwarelabs.github.io/ui/#/components/notification-center)**: a bell with an unread count that opens a popover inbox ([#53](https://github.com/openwarelabs/ui/pull/53), [d1172e3](https://github.com/openwarelabs/ui/commit/d1172e3d7d610a7eb359366989ae2b4e74df30d2))
- **[TransferList](https://openwarelabs.github.io/ui/#/components/transfer-list)**: two lists with buttons to move items between them ([#54](https://github.com/openwarelabs/ui/pull/54), [6312c70](https://github.com/openwarelabs/ui/commit/6312c70508a438e7d6ebd767ece54b4e06676b00))
- **[QRCode](https://openwarelabs.github.io/ui/#/components/qrcode)**: a QR code drawn as one SVG path, with its own encoder ([#56](https://github.com/openwarelabs/ui/pull/56), [c41cef2](https://github.com/openwarelabs/ui/commit/c41cef21d5d02035324b6fadfe333beaa05cc8f3))
- **[Markdown](https://openwarelabs.github.io/ui/#/components/markdown)**: a safe renderer for streaming answers ([#47](https://github.com/openwarelabs/ui/pull/47), [eefab46](https://github.com/openwarelabs/ui/commit/eefab4658b40e4c4db8544691ff380f391dbc79f))
- **[MentionInput](https://openwarelabs.github.io/ui/#/components/mention-input)**: @ mentions and / commands at the caret ([#48](https://github.com/openwarelabs/ui/pull/48), [ee48bf8](https://github.com/openwarelabs/ui/commit/ee48bf8da217136cef3c99a893047c472453e06b))
- **[UploadList](https://openwarelabs.github.io/ui/#/components/upload-list)**: the files being uploaded with their progress, retry and remove ([#50](https://github.com/openwarelabs/ui/pull/50), [f700e02](https://github.com/openwarelabs/ui/commit/f700e02589b513590051c2559985df86db0b63de))
- **[MediaPlayer](https://openwarelabs.github.io/ui/#/components/media-player)**: audio and video with the library's own controls ([#51](https://github.com/openwarelabs/ui/pull/51), [232b0e5](https://github.com/openwarelabs/ui/commit/232b0e5db7b577f45f7e48ccda43e9d92258555b))
- **[DiffViewer](https://openwarelabs.github.io/ui/#/components/diff-viewer)**: code diffs unified or side by side ([#49](https://github.com/openwarelabs/ui/pull/49), [3117cf6](https://github.com/openwarelabs/ui/commit/3117cf6fabbd3cbed0ecff1348c11b2f4f9f3971))
- **[ActivityHeatmap](https://openwarelabs.github.io/ui/#/components/activity-heatmap)**: a calendar of daily counts in shaded squares ([#52](https://github.com/openwarelabs/ui/pull/52), [6711fce](https://github.com/openwarelabs/ui/commit/6711fce70737b3a618a506d7e572025e88073c60))

## 0.15.0 (2026-10-15)

5 new components.

### New components

- **[SortableList](https://openwarelabs.github.io/ui/#/components/sortable-list)**: a list people reorder by dragging or with the keyboard ([#42](https://github.com/openwarelabs/ui/pull/42), [6849945](https://github.com/openwarelabs/ui/commit/6849945c5a40181da55a6953dae24397d0823acb))
- **[NavigationMenu](https://openwarelabs.github.io/ui/#/components/navigation-menu)**: a site's top nav with dropdown panels and mega-menus ([#43](https://github.com/openwarelabs/ui/pull/43), [5880d14](https://github.com/openwarelabs/ui/commit/5880d14e320e044f9f129b37b76bd3111305db38))
- **[TreeView](https://openwarelabs.github.io/ui/#/components/tree-view)**: rows that open, select or check, with children loaded on demand ([#44](https://github.com/openwarelabs/ui/pull/44), [bd2a16e](https://github.com/openwarelabs/ui/commit/bd2a16e330056b93fdd08c214c305e3f2eb844ed))
- **[VirtualList](https://openwarelabs.github.io/ui/#/components/virtual-list)**: a scrolling list that renders only the rows in view ([#45](https://github.com/openwarelabs/ui/pull/45), [31e22c2](https://github.com/openwarelabs/ui/commit/31e22c2e971737016cc7e68f7b8fddcec074fc29))
- **[InlineEdit](https://openwarelabs.github.io/ui/#/components/inline-edit)**: text you click to edit where it is ([#46](https://github.com/openwarelabs/ui/pull/46), [0fb6245](https://github.com/openwarelabs/ui/commit/0fb6245971f9cb4773d695a4e9f1ba5a842312e8))

## 0.14.1 (2026-10-15)

Maintenance only.

## 0.14.0 (2026-10-15)

12 new components and 1 improvement.

### New components

- **[Tour](https://openwarelabs.github.io/ui/#/components/tour)**: steps that point at parts of the page to show people around ([#40](https://github.com/openwarelabs/ui/pull/40), [913957f](https://github.com/openwarelabs/ui/commit/913957f593da56aafdb9baee98d8a3a2030daea2))
- **[PasswordInput](https://openwarelabs.github.io/ui/#/components/password-input)**: with a show/hide toggle and an optional strength meter ([#39](https://github.com/openwarelabs/ui/pull/39), [c9508b2](https://github.com/openwarelabs/ui/commit/c9508b2de14898929981a62202400a1debbc4c2a))
- **[ContextMenu](https://openwarelabs.github.io/ui/#/components/context-menu)**: a right-click menu that reuses Menu's items and keys ([#38](https://github.com/openwarelabs/ui/pull/38), [de88546](https://github.com/openwarelabs/ui/commit/de88546e25dbeef5c5a8f016289c0ecc8c7c0827))
- **[TagInput](https://openwarelabs.github.io/ui/#/components/tag-input)**: for several values typed or picked into one field ([#37](https://github.com/openwarelabs/ui/pull/37), [7b56766](https://github.com/openwarelabs/ui/commit/7b567668f57cd50d5a6bccc2fe113b2acaa58d78))
- **[Rating](https://openwarelabs.github.io/ui/#/components/rating)**: stars to pick a score or show one ([#36](https://github.com/openwarelabs/ui/pull/36), [b4531b4](https://github.com/openwarelabs/ui/commit/b4531b43374270ec95f2ebbaf6dccf541b386765))
- **[Banner](https://openwarelabs.github.io/ui/#/components/banner)**: a bar across the top for announcements and notices ([#35](https://github.com/openwarelabs/ui/pull/35), [68ec167](https://github.com/openwarelabs/ui/commit/68ec16706c1c25cabd9871bf638c04eee3644b76))
- **[Carousel](https://openwarelabs.github.io/ui/#/components/carousel)**: slides that scroll and snap, with arrows, dots and keys ([#33](https://github.com/openwarelabs/ui/pull/33), [c3c38c3](https://github.com/openwarelabs/ui/commit/c3c38c3480c6e2bb41cc2616367f98b848408903))
- **[DescriptionList](https://openwarelabs.github.io/ui/#/components/description-list)**: terms and their values for detail pages ([#32](https://github.com/openwarelabs/ui/pull/32), [aa2060e](https://github.com/openwarelabs/ui/commit/aa2060ebcc5d79a3636a4caf967bd6211ac598f9))
- **[HoverCard](https://openwarelabs.github.io/ui/#/components/hover-card)**: a preview that opens when the pointer rests on a link ([#31](https://github.com/openwarelabs/ui/pull/31), [befc945](https://github.com/openwarelabs/ui/commit/befc94541c2a217d58bd4f3c1b33e89b95c48509))
- **[Timeline](https://openwarelabs.github.io/ui/#/components/timeline)**: events down a line, for activity feeds and history ([#30](https://github.com/openwarelabs/ui/pull/30), [76319b3](https://github.com/openwarelabs/ui/commit/76319b3f2e319598dd76b7078a9b65d034e4673c))
- **[AspectRatio](https://openwarelabs.github.io/ui/#/components/aspect-ratio)** and **[Image](https://openwarelabs.github.io/ui/#/components/image)**: with a placeholder while it loads and a fallback if it fails ([#29](https://github.com/openwarelabs/ui/pull/29), [dff1bd6](https://github.com/openwarelabs/ui/commit/dff1bd6843a0539f8fb4e055aa1c19182b382c69))

### Improvements

- add resizable panels, with handles you drag or move with the arrow keys ([#34](https://github.com/openwarelabs/ui/pull/34), [08850f4](https://github.com/openwarelabs/ui/commit/08850f46367a3df7da9d39c0cfadc752c5807f6b))

## 0.13.0 (2026-10-15)

1 improvement.

### Improvements

- give Table an inset style, its rows on a raised panel inside a tinted tray ([#28](https://github.com/openwarelabs/ui/pull/28), [d4896c1](https://github.com/openwarelabs/ui/commit/d4896c1153fee82e57f144acd9e7727fb9284655))

## 0.12.2 (2026-10-15)

Maintenance only.

## 0.12.1 (2026-10-15)

Maintenance only.

## 0.12.0 (2026-10-15)

5 new components.

### New components

- **[LineChart](https://openwarelabs.github.io/ui/#/components/line-chart)** and **[BarChart](https://openwarelabs.github.io/ui/#/components/bar-chart)** and **[DonutChart](https://openwarelabs.github.io/ui/#/components/donut-chart)** and **[Sparkline](https://openwarelabs.github.io/ui/#/components/sparkline)**: with a chart palette ([#24](https://github.com/openwarelabs/ui/pull/24), [93fa28b](https://github.com/openwarelabs/ui/commit/93fa28b28919055e807264e5362d4e6d9fc1f7fc))
- **[AppShell](https://openwarelabs.github.io/ui/#/components/app-shell)**: a sidebar and page frame that folds into a drawer on narrow screens ([#23](https://github.com/openwarelabs/ui/pull/23), [d4c4a37](https://github.com/openwarelabs/ui/commit/d4c4a377bb65d95a0d86a70073b41674d98b704f))

## 0.11.1 (2026-10-15)

1 fix.

### Fixes

- make the range slider's handles big enough to tap ([#22](https://github.com/openwarelabs/ui/pull/22), [cd2c51e](https://github.com/openwarelabs/ui/commit/cd2c51ed8da0a601b83d8681e0af8aa4b267d6de))

## 0.11.0 (2026-10-15)

2 new components and 1 fix.

### New components

- **[Container](https://openwarelabs.github.io/ui/#/components/container)** and **[Section](https://openwarelabs.github.io/ui/#/components/section)**: for page width and margins that line up with the blocks ([#21](https://github.com/openwarelabs/ui/pull/21), [39a8bd3](https://github.com/openwarelabs/ui/commit/39a8bd3fdb261b2167522a0bb90e5595b3bbe320))

### Fixes

- **blocks:** fix what building Leak Report on Openware found ([#20](https://github.com/openwarelabs/ui/pull/20), [d56530e](https://github.com/openwarelabs/ui/commit/d56530ee220fd2a86530049fe58e6d7a15206f5c))

## 0.10.1 (2026-10-14)

1 fix.

### Fixes

- fix 40 of the 42 known accessibility problems ([#16](https://github.com/openwarelabs/ui/pull/16), [10ce344](https://github.com/openwarelabs/ui/commit/10ce34477133fd3944266c35ce28c8f0c0e23090))

## 0.10.0 (2026-10-14)

1 new set of blocks and 1 fix.

### New blocks

- add the remaining 67 blocks as components ([#9](https://github.com/openwarelabs/ui/pull/9), [62f14bc](https://github.com/openwarelabs/ui/commit/62f14bc431db4f565e97ab3eaa9ee0f0e0291bbb))

### Fixes

- let apps tree-shake unused components, and check accessibility and bundle size ([#10](https://github.com/openwarelabs/ui/pull/10), [9dd2668](https://github.com/openwarelabs/ui/commit/9dd2668738a9b47a03bbbb5f74337ed955879aef))

## 0.9.0 (2026-10-14)

1 new set of blocks.

### New blocks

- add Cta01 to Cta03 ([#7](https://github.com/openwarelabs/ui/pull/7), [a75ff4a](https://github.com/openwarelabs/ui/commit/a75ff4a2f72073ee3233d4158f338abe9476a3cd))

## 0.8.0 (2026-10-14)

4 new sets of blocks.

### New blocks

- add Footer01 to Footer04 ([#6](https://github.com/openwarelabs/ui/pull/6), [23df25e](https://github.com/openwarelabs/ui/commit/23df25e2c5f550de2fc767ad02778d12e1426822))
- add Features01 to Features05 ([#5](https://github.com/openwarelabs/ui/pull/5), [329ef87](https://github.com/openwarelabs/ui/commit/329ef878a87f08ab2085b5c8658264d3007c4967))
- add Pricing01 to Pricing05 ([#4](https://github.com/openwarelabs/ui/pull/4), [ad61515](https://github.com/openwarelabs/ui/commit/ad61515fb0caa3b407232d6aa8b665cba1e53681))
- add Header01 to Header05 ([#3](https://github.com/openwarelabs/ui/pull/3), [963b199](https://github.com/openwarelabs/ui/commit/963b199041b6d212b194611bc8761fa2ee8fec25))

## 0.7.0 (2026-10-14)

1 new set of blocks.

### New blocks

- add @openwarelabs/blocks with Hero01 to Hero06 ([#2](https://github.com/openwarelabs/ui/pull/2), [95f693b](https://github.com/openwarelabs/ui/commit/95f693b1779cf067c24d36dbf6a31e5b4c820a19))

## 0.6.0 (2026-10-14)

1 improvement.

### Improvements

- release both packages with one command ([c93e784](https://github.com/openwarelabs/ui/commit/c93e784914bf1a9ca7a5ee6687174f96d77bbc24))

### Other changes

- Let the MCP server's version run ahead of the library's ([d44c577](https://github.com/openwarelabs/ui/commit/d44c57751b919e343668b00ae3757ab34fcca523))
- Add an MCP server and Copy for AI ([776e351](https://github.com/openwarelabs/ui/commit/776e3514b1bba3f6a61bcde4c6d4d0db9fb1596d))
