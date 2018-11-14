var page_now="qualification_result.html";
var index_now=0;
var selection=document.getElementById("mainselection");
var height=document.documentElement.clientHeight-40;

$("#main_frame").attr("height",height);
$("#main_frame").attr("width",document.documentElement.clientWidth);
function openTab(evt, value) {
    // Declare all variables
	document.getElementById("main_frame").setAttribute("data",value);
	$("#main_frame").attr("data",value); 
	//top.frames['main_frame'].location.href = value;
	if(selection.selectedIndex<3){
		page_now=value;
		index_now=selection.selectedIndex;
	}
	else{
		document.getElementById("mainselection").selectedIndex=index_now;
	}
	
}
document.getElementById("reloadicon").addEventListener("click",function(){
	 $("#main_frame").attr("data",page_now); 
});


