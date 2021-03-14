// Library
var fs = require('fs'); 
var path = require('path'); 
const readline = require('readline'); 
var Excel = require("exceljs");
var _ = requrie('underscore');

// File Setting
var fileConfig = {
    fileName :"./output/voc_0311_withPP2.csv",
    teratermTextFile: "/voc_0311_withPP1.txt",
    sensorNum : 8
};
// User Variable Setting
var variableConfig = {
    date : '2021-03-11', //시작일
    startHour : 10, // 시작시간
    endHour : 12,  // 완료시간
    numberOfSamplingForAvg : 6, //5*x 초 , where x = numberOfSamplingForAvg
    pulse : 20, // 허용범위 +- 진폭
    timePulse : 24, // 허용 범위 폭
    blueSlope : 0.9, // Blue 
    orangeSlope : 0.85, // Orange
    referenceDown : 200
};
// excelOption
var options = { 
    filename: fileConfig.fileName, 
    useStyles: true, 
    useSharedStrings: true 
};


/* setting workbook with options */
var workbook = new Excel.stream.xlsx.WorkbookWriter(options);

/* create work sheet */
var sheet1 = workbook.addWorksheet("Sensor1");
var sheet2 = workbook.addWorksheet("Sensor2");
var sheet3 = workbook.addWorksheet("Sensor3");
var sheet4 = workbook.addWorksheet("Sensor4");
var sheet5 = workbook.addWorksheet("Sensor5");
var sheet6 = workbook.addWorksheet("Sensor6");
var sheet7 = workbook.addWorksheet("Sensor7");
var sheet8 = workbook.addWorksheet("Sensor8");

/* getWork Sheet */
var worksheet1 = workbook.getWorksheet("Sensor1");
var worksheet2 = workbook.getWorksheet("Sensor2");
var worksheet3 = workbook.getWorksheet("Sensor3");
var worksheet4 = workbook.getWorksheet("Sensor4");
var worksheet5 = workbook.getWorksheet("Sensor5");
var worksheet6 = workbook.getWorksheet("Sensor6");
var worksheet7 = workbook.getWorksheet("Sensor7");
var worksheet8 = workbook.getWorksheet("Sensor8");

// colum setting 
var category = [
    { header:"Time", key:"time", width:10 },
    { header:"Volt", key:"volt", width:10 },
    { header:"RS", key:"rs", width:10 },
    { header:"AVG", key:"avg", width:10 },
    { header:"Reference", key:"reference", width:10 },
    { header:"Buffer", key:"buffer", width:10 },
    { header:"BufferMax", key:"bufferMax", width:10 },
    { header:"BufferMin", key:"bufferMin", width:10 },
    { header:"BlueSlope", key:"blueSlope", width:10 },
    { header:"OrangeSlope", key:"orangeSlope", width:10 }
];

/* assign category info to sheet */
worksheet1.columns = category;
worksheet2.columns = category;
worksheet3.columns = category;
worksheet4.columns = category;
worksheet5.columns = category;
worksheet6.columns = category;
worksheet7.columns = category;
worksheet8.columns = category;

// global variable based on sensorID
var threshholdTime = [0,0,0,0,0,0,0,0]; // buffer
var buffer = [0,0,0,0,0,0,0,0]; 
var reference = [0,0,0,0,0,0,0,0];
var LED = [];

/*  air quility index logic
*   return : time,rs, avg, reference ,buffer,bufferMax: buffer[sensorId-1] + pulse, bufferMin : buffer[sensorId-1] - min, Led}
*/
function doSensor(sensorId,time,volt,rs,avg){
    var Led = 'N';
    // clean air
    if(avg > reference[sensorId-1]){
        reference[sensorId-1] = avg;
        threshholdTime[sensorId-1] = 0
    }
    // adjust buffer zone
    if(avg > buffer[sensorId-1] + variableConfig.pulse || avg < buffer[sensorId-1] + variableConfig.pulse){
        buffer[sensorId-1] = avg;
        threshholdTime[sensorId-1] = 0;
    }else{
        threshholdTime[sensorId-1]++;
    }
    // when the avg is in buffer zone, update the reference value
    if(threshholdTime[sensorId-1] >= variableConfig.timePulse){
        threshholdTime[sensorId-1] = 0;
        reference[sensorId-1]  = reference[sensorId-1] - variableConfig.pulse;
    }

    // airquility index logic
    var AdcResult = parseFloat(avg)/parseFloat(reference[sensorId-1])
    if(AdcResult > variableConfig.blueSlope){
        Led = 'Blue'
    }else if(AdcResult> variableConfig.orangeSlope){
        Led = 'Orange'
    }else{
        Led = 'Red'
    }
    return {time:time, rs:rs, avg: avg, reference : reference[sensorId-1], buffer : buffer[sensorId-1],  bufferMax: buffer[sensorId-1] + pulse, bufferMin : buffer[sensorId-1] - min, Led}
};

/* fileConfig에서 설정된 날짜 , 원하는 시간이면 제품 ID 반환 
* @Param line : 텍스트 한라인  
* return 제품 ID
*/
function isValidDataType(line){
    var isValidTime = false;
    var deviceID = -1;
    // 시작 & 종료 시간 Validation
    _.range(variableConfig.startHour,variableConfig.endHour+1).map(row, function(row){
        var isIncludingTime = line.includes(row);
        if(line.includes(isIncludingTime)){
            isValidTime = (isValidTime || isIncludingTime)
        }
        // Volt단어 있는지 확인
        indexVolt = line.indexOf('Volt'); 
        if(indexVolt == -1){
            isValidTime = false;
        }
        var deviceId = line[indexVolt+4]; 
    }) 
    return !line.includes('N') &&  isValidTime &&line.includes(variableConfig.date) ? deviceId : -1; // Validation 성공하면 장치 ID 반환 , 실패하면 -1 반환
};

/* 2D array 만들기 @See https://stackoverflow.com/questions/3689903/how-to-create-a-2d-array-of-zeroes-in-javascript */
function matrix( rows, cols, defaultValue){
    var arr = [];
    // Creates all lines:
    for(var i=0; i < rows; i++){
        // Creates an empty line
        arr.push([]);
        // Adds cols to the empty line:
        arr[i].push( new Array(cols));
        for(var j=0; j < cols; j++){
          // Initializes:
          arr[i][j] = defaultValue;
        }
    }
  return arr;
  }


var rowNum = 2;
var cntForAvg = 0;
// X초가 지났을떄 실제 평균 값 저장
var avgSensors = [0,0,0,0,0,0,0,0]; // Rs
var avgFlag = [false,false,false,false,false,false,false,false];
var cntSamplingNumByDevice = [0,0,0,0,0,0,0,0];

// x초 이전의 센서들의 데이터들을 저장 (2D array)
var averageSensorArr = matrix(fileConfig.sensorNum,variableConfig.numberOfSamplingForAvg,0);

fs.readFileSync(path.join(__dirname, './data') + fileConfig.teratermTextFile, 'utf8').toString().split('\n').forEach(function (line) { 
    // find device Id which has the valid data
    var deviceID = isValidDataType(line);
    if(deviceID > 0 ){  
        var time = line.substring(12,17);
        var volt=parseFloat (line.substring(32,39));
        var rs = parseFloat(line.substring(44,49)); 
        
        avgFlag[deviceID-1] = false;
        // 30초 지났을떄 평균 한번 낸다. 
        if(cntSamplingNumByDevice[deviceID-1] == variableConfig.numberOfSamplingForAvg){ 
            avgSensors[deviceID-1] = _.mean(averageSensorArr[deviceID-1]) || 0;
            averageSensorArr[deviceID-1]=[];
            cntSamplingNumByDevice[deviceID-1] = 0;
            avgFlag[deviceID-1] = true;
        }

        averageSensorArr[deviceID-1][cntForAvg].push(rs);
        cntSamplingNumByDevice[deviceID-1] = cntSamplingNumByDevice[deviceID-1] + 1;
        
        if(line.includes('Volt1')){
            // function doSensor(sensorId,time,volt,rs,averageOfRsValues){
            var obj = doSensorFlag ? dosensordoSensor(1,time,volt,rs,averageOfRsValues) : {time:time,volt:volt,averageOfRsValues:averageOfRsValues}
            worksheet1.addRow(obj);
        }
        else if(line.includes('Volt2')){
            var obj = doSensorFlag ? dosensordoSensor(1,time,volt,rs,averageOfRsValues) : {time:time,volt:volt,averageOfRsValues:averageOfRsValues}
            worksheet2.addRow(obj);
        }
        else if(line.includes('Volt3')){
            var obj = doSensorFlag ? dosensordoSensor(1,time,volt,rs,averageOfRsValues) : {time:time,volt:volt,averageOfRsValues:averageOfRsValues}
            worksheet3.addRow(obj);
        }
        else if(line.includes('Volt4')){
            var obj = doSensor();
            worksheet4.addRow(obj);
        }
        else if(line.includes('Volt5')){
            var obj = doSensor();
            worksheet5.addRow(obj);
        }
        else if(line.includes('Volt6')){
            var obj = doSensor();
            worksheet6.addRow(obj);
        }
        else if(line.includes('Volt7')){
            var obj = doSensor();
            worksheet7.addRow(obj);
        }
        else if(line.includes('Volt8')){ // 주의 마지막 센서에 rowNum++ 해주기
            var obj = doSensor();
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