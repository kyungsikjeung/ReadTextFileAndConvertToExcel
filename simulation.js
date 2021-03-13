// Library
var fs = require('fs'); 
var path = require('path'); 
const readline = require('readline'); 
var Excel = require("exceljs");
var _ = requrie('underscore');

var LED = [];
// File Setting
var fileConfig = {
    fileName :"./output/voc_0311_withPP2.csv",
    teratermTextFile: "/voc_0311_withPP1.txt",
};

// User Variable Setting
var variableConfig = {
    date : '2021-03-11', //시작일
    startHour : 10, // 시작시간
    endHour : 12,  // 완료시간
    numberOfSamplingForAvg : 6, //5*x 초 , where x = numberOfSamplingForAvg
    pulse : 20, // 허용범위 +- 진폭
    timePulse : 24, // 허용 범위 폭
    slope1 : 0.9, // Blue 
    slope2 : 0.85 // Orange
};

var options = { 
    filename: fileConfig.fileName, // existing filepath
    useStyles: true, // Default
    useSharedStrings: true // Default
};

/* 센서별 Sheet 추가 */
var workbook = new Excel.stream.xlsx.WorkbookWriter(options);
var totalData = workbook.addWorksheet("totalData");
var sheet1 = workbook.addWorksheet("Sensor1");
var sheet2 = workbook.addWorksheet("Sensor2");
var sheet3 = workbook.addWorksheet("Sensor3");
var sheet4 = workbook.addWorksheet("Sensor4");
var sheet5 = workbook.addWorksheet("Sensor5");
var sheet6 = workbook.addWorksheet("Sensor6");
var sheet7 = workbook.addWorksheet("Sensor7");
var sheet7 = workbook.addWorksheet("Sensor8");

  /* 센서별 Sheet 할당 */
var worksheet1 = workbook.getWorksheet("Sensor1");
var worksheet2 = workbook.getWorksheet("Sensor2");
var worksheet3 = workbook.getWorksheet("Sensor3");
var worksheet4 = workbook.getWorksheet("Sensor4");
var worksheet5 = workbook.getWorksheet("Sensor5");
var worksheet6 = workbook.getWorksheet("Sensor6");
var worksheet7 = workbook.getWorksheet("Sensor7");
var worksheet8 = workbook.getWorksheet("Sensor8");

// 센서 데이터에 보여줄 데이터
var category = [
    { header:"Time", key:"time", width:10 },
    { header:"Volt", key:"volt", width:10 },
    { header:"RS", key:"rs", width:10 },
    { header:"RsCurrent", key:"rsCurrent", width:10 },
    { header:"RsAir", key:"rsAir", width:10 }
];

/* 시트에 항목 할당 */
worksheet1.columns = category;
worksheet2.columns = category;
worksheet3.columns = category;
worksheet4.columns = category;
worksheet5.columns = category;
worksheet6.columns = category;
worksheet7.columns = category;
worksheet8.columns = category;

var threshholdTime = 0;
var allowedValue = 0;
var rsReferenceValue = [0,0,0,0,0,0,0,0]

function doSensor(sensorId,time,volt,rs,averageOfRsValues){
    var Led = 'N';
    // 공기가 좋아질떄 기준점 업데이트
    if(averageOfRsValues > rsReferenceValue[sensorId-1]){
        rsReferenceValue[sensorId-1] = averageOfRsValues;
        threshholdTime = 0
    }
    // 평균값이 허용 범위 값을 벗어 났을떄 허용 범위 평균값으로 업데이트
    if(averageOfRsValues > allowedValue + variableConfig.pulse || averageOfRsValues < allowedValue + variableConfig.pulse){
        allowedValue = averageOfRsValues;
        threshholdTime = 0;
    }else{
        threshholdTime++;
    }
    // 허용범위안에서 일정 시간이 경과하였을떄에 기준값을 내려줌
    if(threshholdTime >= variableConfig.timePulse){
        threshholdTime = 0;
        rsReferenceValue[sensorId-1]  = rsReferenceValue[sensorId-1] - variableConfig.pulse;
    }
    var AdcResult = parseFloat(averageOfRsValues)/parseFloat(rsReferenceValue[sensorId-1])
    if(AdcResult > variableConfig.slope1){
        Led = 'Blue'
    }else if(AdcResult> variableConfig.slope2){
        Led = 'Orange'
    }else{
        Led = 'Red'
    }
    return 
};

/* 제품 켜지고 30분 후 날짜 , 원하는 시간 데이터 받아오기  */
function isValidDataType(line){
    // 정해진 시간 범위인지 체크
    var isValidTime = false;
    _.range(variableConfig.startHour,variableConfig.endHour+1).map(row, function(row){
        var isIncludingTime = line.includes(row);
        if(line.includes(isIncludingTime)){
            isValidTime = (isValidTime || isIncludingTime)
        } 
    })
    // 30분 지난 데이터 인지, 정해진 시간 범위인지, 특정 날짜인지 확인
    return !line.includes('N') &&  isValidTime &&line.includes(variableConfig.date)
};

var rowNum = 2;
var cntForAvg = 0;
var averageSensorArr = [];
// 텍스트 파일을 데이터를 라인별로 읽어 들여와 액셀에 데이터 저장
fs.readFileSync(path.join(__dirname, './data') + fileConfig.teratermTextFile, 'utf8').toString().split('\n').forEach(function (line) { 
    if(isValidDataType(line)){ 
        // 기본 값
        var time = line.substring(12,17);
        var volt=parseFloat (line.substring(32,39));
        var rs = parseFloat(line.substring(44,49)); 
        var averageOfRsValues = 0; // 5초간 Rs값 샘플링횟수가 x개(variableConfig.numberOfSamplingForAvg) 데이터들의 Rs 값 평균
        
        if(cntForAvg == variableConfig.numberOfSamplingForAvg){ // CntAvg를 +1 해주면서 x번쨰 되었을떄 평균값 업데이트 (averageOfRsValues), x 도달하면 averageOfRsValues
            averageOfRsValues = _.mean(avg) || 0;
            averageSensorArr=[];
            cntForAvg = 0;
        }
        averageSensorArr.push(rs);
        cntForAvg ++;
        doSensor(time,volt,rs,averageOfRsValues); // 평균값으로 기준값 받기
        var obj = {time:time,volt:volt,rs:rs, rsCurrent:rsCurrent, rsAir: rsAir };
        if(line.includes('Volt1')){
            worksheet1.addRow(obj);
        }
        else if(line.includes('Volt2')){
            worksheet2.addRow(obj);
        }
        else if(line.includes('Volt3')){
            worksheet3.addRow(obj);
        }
        else if(line.includes('Volt4')){
            worksheet4.addRow(obj);
        }
        else if(line.includes('Volt5')){
            worksheet5.addRow(obj);
        }
        else if(line.includes('Volt6')){
            worksheet6.addRow(obj);
        }
        else if(line.includes('Volt7')){
            worksheet7.addRow(obj);
        }
        else if(line.includes('Volt8')){ // 주의 마지막 센서에 rowNum++ 해주기
            worksheet8.addRow(obj);
            rowNum++;
        }
    }
});

// 변경 값 시트 저장 및 액셀 파일에 저장
worksheet1.commit(); 
worksheet2.commit(); 
worksheet3.commit(); 
worksheet4.commit(); 
worksheet5.commit(); 
worksheet6.commit(); 
worksheet7.commit(); 
worksheet8.commit(); 
workbook.commit(); 
// 완료 메세지
console.log("complete");