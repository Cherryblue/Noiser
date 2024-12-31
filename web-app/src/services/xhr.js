function create(HTTP_METHOD, ROOT_URL, WS_METHOD){
	// Récupérer l'objet XHR
	let xhr;
	if (window.XMLHttpRequest || window.ActiveXObject) {
		if (window.ActiveXObject)
			try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } 
			catch(e) { xhr = new ActiveXObject("Microsoft.XMLHTTP"); }
		else xhr = new XMLHttpRequest();
		
		// Complétion de l'objet avec les paramètres d'entrée
		xhr.open(HTTP_METHOD, 'https://' + ROOT_URL + WS_METHOD, true);
		xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=utf-8');
		xhr.overrideMimeType("application/json");
	} else {
		// popin.stop('Votre navigateur n\'est pas compatible. Veuillez en utiliser un plus récent.');
		console.log('Votre navigateur n\'est pas compatible avec les requêtes XHR (JS HTTP REST).');
	}
	
	// Renvoi de l'objet pré-complèté (s'il existe, sinon null)
	return xhr;
}

function proceedOnPromise(xhr, logName = 'NO LOG NAME GIVEN', params = null){
	console.info(`WS - ${logName} Requested`);
	return new Promise(
		(resolve, reject) => {
			// Ce qui sera fait de la réponse
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4){ // == 0 if localhost
					switch(xhr.status){
						case 0:
						case 200:
						case 204:
							console.info(`WS - ${logName} - Answered by Server`);
							if(null != xhr.responseText && '' != xhr.responseText)
								resolve(JSON.parse(xhr.responseText));
							else
								resolve();
							break;
						
						case 401:
						default:
							console.warn(`WS - ${logName} - Failure: ${xhr.status}\n${xhr.responseText}`);
							reject({status: xhr.status, description: xhr.responseText});
					}
				}
			};
			
			// Envoi de la requête
			if(null == params)
				xhr.send();
			else
				xhr.send(params);
	});
}

export { create, proceedOnPromise }