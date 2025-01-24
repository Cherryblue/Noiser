function sortDirectoriesFirst(a,b){
	if(a.isDir && !b.isDir)
		return -1;
	
	if(!a.isDir && b.isDir)
		return 1;
	
	return 0;
}

function sortByName(a,b){
  if(a.interpretedTitle < b.interpretedTitle)
    return -1;

  if(a.interpretedTitle > b.interpretedTitle)
    return 1;

  return 0;
}

function sortByNameReverse(a,b){
  if(a.interpretedTitle < b.interpretedTitle)
    return 1;

  if(a.interpretedTitle > b.interpretedTitle)
    return -1;

  return 0;
}

function sortByYear(a,b){
	if(a.interpretedYear != null && (a.interpretedYear < b.interpretedYear || b.interpretedYear == null))
		return -1;
	
	if(b.interpretedYear != null && (a.interpretedYear > b.interpretedYear || a.interpretedYear == null))
		return 1;
	
	return 0;
}

function sortByYearReverse(a,b){
	if(a.interpretedYear != null && (a.interpretedYear < b.interpretedYear || b.interpretedYear == null))
		return 1;
	
	if(b.interpretedYear != null && (a.interpretedYear > b.interpretedYear || a.interpretedYear == null))
		return -1;
	
	return 0;
}

function sortByTrackNb(a,b){
	if(a.tags.track < b.tags.track)
		return -1;
	
	if(a.tags.track > b.tags.track)
		return 1;
	
	return 0;
}

function sortByTrackNbReverse(a,b){
	if(a.tags.track > b.tags.track)
		return -1;
	
	if(a.tags.track < b.tags.track)
		return 1;
	
	return 0;
}

const convert = {
	"az"            : sortByName,
	"za"            : sortByNameReverse,
	"date"          : sortByYear,
	"dateReversed"  : sortByYearReverse,
	"track"         : sortByTrackNb,
	"trackReversed" : sortByTrackNbReverse
};

export { sortDirectoriesFirst, sortByName, sortByNameReverse, sortByYear, sortByYearReverse, sortByTrackNb, sortByTrackNbReverse, convert }
