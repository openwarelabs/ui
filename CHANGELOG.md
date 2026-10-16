# Changelog

Every release of @openwarelabs/ui, @openwarelabs/blocks and @openwarelabs/ui-mcp. `npm run release` writes it from the commits, and the docs' Releases page shows it.

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
