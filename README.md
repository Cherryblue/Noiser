# 📣Noiser
`Current state : Not production ready. Started this Fall 2024.`
## 🎧 _A dead-simple music-player_
Noiser is a web-based music player client. It uses (only) Gonic (for now) as a music-server, following the [subsonic-api](https://subsonic.org/pages/api.jsp).<br>
What you can basically expect right now from this software :
- Browse your music collection (folder-navigation + statistical folders)
- Queue your music to listen to it
- Manage and listen to your favourite playlists

### Yet / Why another one ?
'Reasons :)
- Not satisfied with the existing ones
- I love crafting _things_
- Wanting to bring something different and sharing it with the community

> Intrinsically, Noiser comes as a personal replacement of [Jamstash](https://github.com/tsquillario/Jamstash), which I first [forked and massively modified](https://github.com/Cherryblue/Jamstash) to suit my needs.
Yet my fork was nowhere near perfect, and I grew tired of modifying something based on a framework that I feel is now too old and inefficient. Then you wonder : "Wouldn't it have been easier to start from scratch ..?" Thus came Noiser.

> Fun fact : _Noiser_ is named after my first real personal code-project during my initial formation, which was a very basic c-coded windows music player.

### What's different ?
- State of the art development framework : Noiser is [Svelte-Kit](https://svelte.dev/) based
- Storage is key : everything you do is recorded in **your** personal browser. Browser closed by mistake or bugged ? Your music-queue and progress are saved.
- Built in css grids for maximum adaptability/responsivity
- Less is more : minimal number of dependencies, selfmade icon font...

### Compare to the others..
I don't deny inspiration from [Jamstash](https://github.com/tsquillario/Jamstash), which I used for a long time.
| Compared to | + | - |
|-------------|---|---|
|Jamstash| See specific features below n°1,2,3. Also, more modern technologies | No podcast. For now. |
|Navidrome| Folder navigation, which is a must for me | Dunno much about Navidrome |
|Airsonic Advanced| Comparison TBD | Comparison TBD |
|...|||

## 🎶 Existing features and others to come
This is (up-to-now) a personal project ; update frequency _**will be**_ hectic, hazardous and........ hunpredictable.<br>
**Feature PR and ideas are always welcome**. _Simply do not expect rapid improvement or fixes, as this is me on my free time, **sometimes**._<br>
If it suits your needs or if you like it, don't hesitate to share your impressions one way or another :). **Knowing it helps someone else is highly motivating (at least to me).**
### Existing specific features
|N°| Feature | Description | Explanation or Example |
|--|-------- | -------------------- | ------- |
|1| Gapless playback | no "empty" time between songs | Song B begins exactly when song A stops. This allows for a perfect transition, useful to songs made for it |
|2| Path reconstruction | Player automatically finds a specific folder complete path if known one is partial | In a classic subsonic player, when you click on an album from a "special folder" (ex: Most Played, Recently added...), you don't get _**all**_ the parent-folders. Noiser automatically queries the backend (here gonic) to retrieve the complete path, allowing you to actually "browse" from any point, even from an album you stumbled upon. Works for songs/albums in playlists too |
|3| Browser Storage | Most of the data is saved for next launch | Queue, current song progress and other things are saved between reboot |
|4| Search categories | When searching, you choose if you search for a song, an artist, an album, or anything | This allows for more specific search |

### Other features
|N°| Feature | Description | Explanation or Example |
|--|-------- | -------------------- | ------- |
|101| Config file | At startup Noiser fetches a json file with a few parameters. | This allows for easy customization of the app when setting it up, without re-building it |
|102| Keyboard media control | Play/pause & Volume can be triggered from keyboard | This allows for quick access to essential media functions. Some others are still missing though |
|103| Selection Mechanism | Songs are selectable, be it from Queue, from Playlist, or from Folders/albums | This allows to choose selectively what you wish to do. Also move songs in playlist or queue. |
|104| Settings | Configure your personal way of things directly from the app | Only one setting available for now. Ideas are mentioned in orange |

### Current Roadmap
There are features I judge essential to do next. No priority order in these for now.

| Feature | Motivation & Context |
|-------- | -------------------- |
| HTML Notifications | Jamstash was able to send notification popup to the system through the browser. This is great and has to be done here too. |
| Dark theme and automatic adaptation | Will come once UI is stable |
| Better Caching System | Replacing the current "chain" of folders by a Set/Map, with a timestamp to decide when to refresh it. Should be way more efficient |
| Tests | Well... at some point.... yeah... :D |
| Upgrading to Svelte 5 | New major version came up in october 2024, with the rune-thingy |
| Mobile design & PWA | Usable web-interface on mobile and tablets. I don't plan on building another app. I want this app to be adaptive/responsive enough. |
| Sharing features | Being able to share a few musics or even playlists with people not familiar with the app. **This is server dependant**, so it will only be implemented an able-to backend is available. |
| Demonstration server | For easily showing things around here |

### Eventual / Possible features
These are features I'm aware of but not sure to implement at this time.
| Feature | Motivation & Context |
|-------- | -------------------- |
| Podcasting | this is possible in subsonic api, this was available in jamstash, but I simply don't use it everyday at this stage |
| Opening to other protocols | Often, web-music clients only do one protocol (here subsonic). But I see no reason to restrict the client to only one. For example, I could imagine adding webdav next. Or Jellyfin api |
| Drag'n'drop| While awesome, it **is** a pain to code. I don't feel like this is mandatory if the UI/UX allows you to do the same in simpler ways. This will come after the other features, *it it comes*. |
| Better Auth System (SSO ?)| Well this [feels like a WIP on subsonic protocols](https://github.com/opensubsonic/open-subsonic-api/discussions/25) and [backends](https://github.com/sentriz/gonic/pull/346). But I'm all for making it work, once one standard has been designed for the subsonic protocol. |

## 📈 Evolution / Development Historic
I always find it interesting showing where we came, and where we are at one point in time.
See these few pictures below describing UI/UX iterations and visible features.
TBD

## 🙏 Special thanks
- To the users, if any
- To the [Svelte (Kit)](https://svelte.dev/) Team
- To [HowlerJs](https://howlerjs.com/) Author, library here used for sound playback
- To [CryptoJS](https://www.npmjs.com/package/crypto-js) for its easy to use lib. Shall be replaced with native browser crypto since it's discontinued.
- To the [NucleoApp](https://nucleoapp.com/application) Team allowing me to easily create my own icon font (while not using their icons here, only my own creations)
- To all other authors that shared their hard work to the community 🫡, and from which I directly or indirectly borrowed help by importing their libraries. (See `package.json`, or the dependency tree)
- To my girlfriend, for patiently not throwing me out by the window 🤦‍♀️🙇‍♂️🪟

## 📖 License
AGPLv3

[//]: #
   [svelte]: <https://svelte.dev>
   [howler-js]: <https://howlerjs.com/>
