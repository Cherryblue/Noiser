import { triggerPlay, changeVol, changeSong } from "$stores/global.js";

// Manages music control based on classic keyboard keys
function keyTriggered(ev){
	switch(ev?.code){
		case "Space":
			triggerPlay.set(new Date());
			ev.preventDefault();
			break;
			
		case "NumpadSubtract":
			changeVol.set({direction : -1});
			ev.preventDefault();
			break;
			
		case "NumpadAdd":
			changeVol.set({direction : 1});
			ev.preventDefault();
			break;

		case "Home":
			changeSong.set('first');
			ev.preventDefault();
			break;

		case "End":
			changeSong.set('last');
			ev.preventDefault();
			break;

		case "PageUp":
			changeSong.set('previous');
			ev.preventDefault();
			break;

		case "PageDown":
			changeSong.set('next');
			ev.preventDefault();
			break;

		default:
	}
}

let mediaSession = null;

// Manages music control based on special media keys
function initMedia(){
	if (navigator && "mediaSession" in navigator) {
		mediaSession = navigator.mediaSession;

		mediaSession.setActionHandler("play", () => {
			triggerPlay.set(new Date());
			mediaSession.playbackState = 'playing';
		});
		
		mediaSession.setActionHandler("pause", () => {
			triggerPlay.set(new Date());
			mediaSession.playbackState = 'paused';
		});
		
		mediaSession.setActionHandler("stop", () => {
			triggerPlay.set(new Date());
			mediaSession.playbackState = 'paused';
		});
		
		mediaSession.setActionHandler("previoustrack", () => {
			changeSong.set('previous');
			mediaSession.playbackState = 'playing';
		});
		
		mediaSession.setActionHandler("nexttrack", () => {
			changeSong.set('next');
			mediaSession.playbackState = 'playing';
		});
	}
}

initMedia();

function updateMediaSession(currentLegend){	
	if(mediaSession){
		console.log("Notifying System");
		mediaSession.metadata = new MediaMetadata({
			title : currentLegend.title,
			artist: currentLegend.artist,
			album: currentLegend.album,
			artwork: currentLegend.coverURL ? [{
				src: currentLegend.coverURL,
				size: '500x500',
				type: 'image/png'
			}] : []
		});
		
		notify(currentLegend);
	}
}

function notify(currentLegend){
	if(Notification){
		switch(Notification.permission){
			case 'granted':
				createNotification(currentLegend);
				break;
				
			case 'default':
				Notification.requestPermission().then(result => {
					createNotification(currentLegend);
				});
				break;
				
			case 'denied':
			default:
		}
	}
}

function createNotification(currentLegend){
	const pop = {};
	pop.body = '';
	
	// Artist
	if(![null, ''].includes(currentLegend.artist))
		pop.body += currentLegend.artist;
	
	// -
	if(![null, ''].includes(currentLegend.artist) && ![null, ''].includes(currentLegend.album))
		pop.body += ' - ';
	
	// Album
	if(![null, ''].includes(currentLegend.album))
		pop.body += currentLegend.album;
	
	// Artwork
	if(![null, ''].includes(currentLegend.coverURL))
		pop.icon = currentLegend.coverURL+'?filetype=file.png';
	
	const notification = new Notification("🎵 Playing : " + currentLegend.title, pop);
	/*console.log(notification);
	setTimeout(function(){ notification.close(); }, 5000);*/
}

export { keyTriggered, updateMediaSession, notify };