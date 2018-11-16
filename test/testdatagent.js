var textin=document.getElementById("textin");
var textout=document.getElementById("textout");

function process(){
	textout.value="";
	var rowsin=(textin.value).split("\n");
	for(var i=0;i<rowsin.length;i++){
		if(rowsin[i].length>0){
            var rowspl=rowsin[i].split(/\s+/);
			var id=rowspl[0];
			genpoint(id);
		}
	}
	
}

function genpoint(id){
    for(var i=0;i<6;i++){
                var str_out=id+','+(i+1);
                for(var j=0;j<6;j++){
                    var point = (getRandomInt(12));
                    if(point==0){
                        str_out+=','+"M";
                    }
                    else if(point ==11){
                        str_out+=','+"X";
                    }
                    else{
                        str_out+=','+point;
                    }
                }
                str_out+="\n";
                textout.value+=str_out;
            }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}