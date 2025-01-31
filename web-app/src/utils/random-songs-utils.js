function selectNewSong(differentThanArray, maxNb){
    console.log("randomizing...");
    let tmp = Math.floor(Math.random() * maxNb);
    while(differentThanArray.includes(tmp))
        tmp = Math.floor(Math.random() * maxNb);

    console.log('found number is : ' + tmp);

    return tmp;
}

export {selectNewSong}
