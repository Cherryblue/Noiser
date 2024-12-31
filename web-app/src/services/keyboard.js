import { triggerPlay, changeVol, changeSong } from "$stores/global.js";

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

export { keyTriggered };