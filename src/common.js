function _getid(id){
	return document.getElementById(id);
}

function _getfrmdoc(ifrm){
	return (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
}