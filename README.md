# 📣Noiser
`Current state : Not production ready. Started this Fall 2024.`
## 🎧 _A dead-simple music-player_
Noiser is a web-based music player client. It uses (only) Gonic (for now) as a music-server, following the [subsonic-api](https://subsonic.org/pages/api.jsp).
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
Yet my fork was nowhere near perfect, and I grew tired of trying to modify something based on a framework I judge too old and inefficient. Then, after massively modifying something already existing, you wonder : "Wouldn't it have been easier to start from scratch ..?" Thus came Noiser.

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
|Navidrome| Folder navigation, which is a must have for me | Dunno much about Navidrome |
|Airsonic Advanced| Comparison TBD | Comparison TBD |
|...|||



## 🎶 Existing features and others to come
This is (up-to-now) a personal project ; update frequency _**will be**_ hectic, hazardous and........ hunpredictable. 
**Feature and enhancement propositions Pull Requests are always welcome**. 
_Simply do not expect rapid improvement or fixes, as this is me on my free time, **sometimes**._
If it suits your needs or if you like it, don't hesitate to share your impressions one way or another :). **Knowing it helps someone is a motivating machine.**
### Existing specific features
|N°| Feature | Description | Explanation or Example |
|--|-------- | -------------------- | ------- |
|1| Gapless playback | no "empty" time between songs | For songs made for this, having a pause in-between is disturbing |
|2| Path reconstruction | Player automatically finds a specific folder complete path if known one is partial | Useful for "Most-played" or playlists |
|3| Browser Storage | Most of the data is saved for next launch | Queue, current song progress and other things are saved between reboot |


### Current Roadmap
There are features I judge essential to do next. No priority order in these for now.

| Feature | Motivation & Context |
|-------- | -------------------- |
| Dartk theme and automatic adaptation | Will come once UI is stable |
| Better Caching System | Replacing the current "chain" of folders by a Set/Map, with a timestamp to decide when to refresh it. Should be way more efficient |
| Tests | Well... at some point.... yeah... :D |
| Upgrading to Svelte 5 | New major version came up in october 2024, with the rune-thingy |
| Mobile design & PWA | Usable web-interface on mobile and tablets. I don't plan on building another app. I want this app to be adaptive/responsive enough. |
| Sharing features | Being able to share a few musics or even playlists with people not familiar with the app. **This is server dependant**, so it will only be implemented an able-to backend is available. |
| Demonstration server | For easily showing things around here |
| Settings | Being able to configure things directly from the app, kind of the jamstash way, but maybe with more specific things like regexes... We'll see |

### Eventual / Possible features
These are features I'm aware of but not sure to implement at this time.
| Feature | Motivation & Context |
|-------- | -------------------- |
| Podcasting | this is possible in subsonic api, this was available in jamstash, but I simply don't use it everyday at this stage |
| Opening to other protocols | Often, web-music clients only do one protocol (here subsonic). But I see no reason to restrict the client to only one. For example, I could imagine adding webdav next. Or Jellyfin api |



## 📈 Evolution / Development Historic
I always find it interesting showing where we came, and where we are at one point in time.
See these few pictures below describing UI/UX iterations and visible features.
TBD



## 📖 License
AGPLv3

[//]: #
   [svelte]: <https://svelte.dev>
   [howler-js]: <https://howlerjs.com/>
