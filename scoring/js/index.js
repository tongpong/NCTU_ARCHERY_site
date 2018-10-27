$("#scoringPage").hide();

$("#btnSubmitCode").click(function(){
  $("#verifyPage").hide();
  $("#scoringPage").show();
});

$("ul.nav-tabs a").click(function(e){
  e.preventDefault();
  $(this).tab('show');
});

var set_result = [
	["2","2","3","4","5","6"],
	[" "," "," "," "," "," "],
	[" "," "," "," "," "," "],
	[" "," "," "," "," "," "],
];
 

function addTable(){
  for (i=1;i<=4;i++){
    var $div = $("<div>").addClass("col-xs-12");
    var $table = $("<table>").addClass("table table-bordered").attr("id","t"+i);
    $table.append("<thead><tr><th><th>");

    $table.find("th:first").attr("colspan","6").html("");//html裡面加上靶號,大學,姓名
    $table.find("th:last").html("總分");

    $table.append("<tbody><tr>");
    var $row=$table.find("tr:last");

    for(j=1;j<=6;j++){
      $row.append("<td>");
      $row.children("td:last").addClass("tableData").attr("id","td"+i+j);
      $row.children("td:last").html("\xa0");
    }
    $row.append("<td>");
    $row.children("td:last").addClass("total");

    $div.append($table);
    $("#scoreTable").append($div);
  }
};

addTable();

var isSelected = false;
var targetID;
var selectedTable;

$(".tableData").click(function(){
  $(".tableData").css("background-color","white");
  $(this).css("background-color","yellow");
  $(this).siblings(".tableData").css("background-color","yellow");
  isSelected = true;
  selectedTable = $(this).parents("table").attr("id");
  targetID = $(this).parent().children(".tableData:contains('\xa0'):first").attr("id");
});

function setTotalScore(targetID, selectedTable, value){
  var totalScore = parseInt($("#"+selectedTable+" .total").html());
  if(typeof targetID === "undefined") return;
  if(isNaN(totalScore)){
    totalScore = 0;
  }
  if(value === "X"){
    totalScore += 10;
  }
  else if(value === "M"){
    totalScore += 0;
  }
  else if(value === " "){
    totalScore += 0;
  }
  else totalScore += parseInt(value);
  $("#"+selectedTable+" .total").html(totalScore);
};

$("#keypad .btn").click(function(){
  if(isSelected){
    var value=$(this).html();
    if(value === "清除"){
      $("#"+selectedTable+" td").html("\xa0");
      targetID = $("#"+selectedTable+" td:first").attr("id");
    }
    else{
      $("#"+targetID).html(value);
      setTotalScore(targetID, selectedTable, value);
      targetID = $("#"+targetID).parent().children(".tableData:contains('\xa0'):first").attr("id");
    }
  }
});


