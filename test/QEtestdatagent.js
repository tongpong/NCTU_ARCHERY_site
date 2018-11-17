var start_target=document.getElementById("start_target");
var end_target=document.getElementById("end_target");
var textout=document.getElementById("textout");
var match=document.getElementById("match");
function process(){
	textout.value="";
	var start=start_target.value;
    var end=end_target.value;
	for(var i=start;i<=end;i+=2){
		genTargetpoint(i)
	}
	
}

function genTargetpoint(target){
    var match_val=match.value;
    var p_sumA=0;
    var p_sumB=0;
    var set=1;
    while(p_sumA<5&&p_sumB<5){
        var dataoutA=genpoint();
        var dataoutB=genpoint();
        var point_strA=dataoutA[0];
        var point_strB=dataoutB[0];
        if(dataoutA[1]>dataoutB[1]){
            p_sumA+=2;
        }
        else if(dataoutA[1]<dataoutB[1]){
            p_sumB+=2;
        }
        else{
            p_sumA+=1;
            p_sumB+=1;
        }
        var str_out=target+","+match_val+","+set+point_strA+point_strB+"\n";
        set++;
        textout.value+=str_out;
    }
}
function genpoint(){
    var str_out="";
    var p_sum=0;
    for(var j=0;j<3;j++){6
        var point = (getRandomInt(12));
        if(point==0){
            str_out+=','+"M";
        }
        else if(point ==11){
            str_out+=','+"X";
            p_sum+=10;
        }
        else{
            str_out+=','+point;
            p_sum+=point;
        }
    }
    return [str_out,p_sum];     
}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}