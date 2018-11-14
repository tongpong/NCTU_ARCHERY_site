var textin=document.getElementById("textin");
var textout=document.getElementById("textout");

function process(){
	textout.value="";
	var rowsin=(textin.value).split("\n");
	var list={};
	for(var i=0;i<rowsin.length;i++){
		if(rowsin[i].length>0){
			var rowspl=rowsin[i].split(/\s+/);
			var id=rowspl[0];
			var group=rowspl[1];
			var school=rowspl[3];
			if(list.hasOwnProperty(group)){
				list=pushid(list,group,id,school);
			}
			else{
				list[group]={};
				list=pushid(list,group,id,school);
			}
		}
	}
	console.log(list);
	gengroup(list)
	
}

function gengroup(list){
	var groups=Object.keys(list);
	for(var i=0;i<groups.length;i++){
		var schools=Object.keys(list[groups[i]]);
		for(var j=0;j<schools.length;j++){
			var ids=list[groups[i]][schools[j]];
			if(ids.length>=3){
				var strout=groups[i]+"\t"+schools[j];
				
				for(var k=0;k<3;k++){
					strout+="\t"+ids[k]
				}
				textout.value+=strout+"\n";
			}
		}
	}
}

function pushid(list,group,id,school){
	if(list[group].hasOwnProperty(school)){
		list[group][school].push(id);
	}
	else{
		list[group][school]=[];
		list[group][school].push(id);
	}
	return list;
				
}
