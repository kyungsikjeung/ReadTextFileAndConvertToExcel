// Library
var fs = require('fs'); 
var path = require('path'); 
const readline = require('readline'); 
var Excel = require("exceljs");
var _ = require('underscore');

// File Setting
var fileConfig = {
    teratermTextFile: "/verify.txt",
    fileName :"./output/testtest.csv",
    sensorNum : 1 // 테스트 할려는 센서 번호
};
// 색깔, 기준값, 평균, rs
// 로그파일 Config
var logConfig = {
    logFileName :"./output/log.txt"
}

var dataNum = 1;
var diffNum =0;

// User Variable Setting
var variableConfig = {
    date : '2021-03-17', //시작일
    startHour : 10, // 시작시간
    endHour : 12,  // 완료시간
    numberOfSamplingForAvg : 6, //5*x 초 , where x = numberOfSamplingForAvg
    pulse : 20, // 허용범위 +- 진폭
    timePulse : 4, // 허용 범위 폭 4*30초 = 120초
    blueSlope : 0.9, // Blue 
    orangeSlope : 0.85, // Orange
    referenceDown : 200,
    test : true ,// 테스트 모드 , true : 센서 testSensorNum 만 테스트
    testSensorNum : 1
};

// excelOption
var options = { 
    filename: "./output/testtest.csv", 
    useStyles: true, 
    useSharedStrings: true 
};

console.log("---------------------------------------------------------------------------Setting Info---------------------------------------------------------------------------")
console.log(JSON.stringify(fileConfig))
console.log(JSON.stringify(variableConfig))
console.log("------------------------------------------------------------------------------------------------------------------------------------------------------------------")

/* setting workbook with options */
var workbook = new Excel.stream.xlsx.WorkbookWriter(options);

/* create work sheet */
var verifySheet = workbook.addWorksheet("verifyingLogic");
var sheet1 = workbook.addWorksheet("Sensor1");
var sheet2 = workbook.addWorksheet("Sensor2");
var sheet3 = workbook.addWorksheet("Sensor3");
var sheet4 = workbook.addWorksheet("Sensor4");
var sheet5 = workbook.addWorksheet("Sensor5");
var sheet6 = workbook.addWorksheet("Sensor6");
var sheet7 = workbook.addWorksheet("Sensor7");
var sheet8 = workbook.addWorksheet("Sensor8");
/* getWork Sheet */

var workVerifyingLogic = workbook.getWorksheet("verifyingLogic");
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
    { header:"Led", key:"Led", width:10 },
    { header:"BlueSlope", key:"blueSlope", width:10 },
    { header:"OrangeSlope", key:"orangeSlope", width:10 }
];

var verifyingLogicCategory = [
    { header:"RS", key:"rs", width:10 },
    { header:"SerialTime", key:"serialTime", width:10 },
    { header:"SerialAvg", key:"serialAvg", width:10 },
    { header:"SerialReference", key:"serialReference", width:10 },
    { header:"SerialLed", key:"serialLed", width:10 },
    { header:"Time", key:"time", width:10 },
    { header:"Avg", key:"avg", width:10 },
    { header:"Reference", key:"reference", width:10 },
    { header:"bufferMax", key:"bufferMax", width:10 },
    { header:"bufferMin", key:"bufferMin", width:10 },
    { header:"Led", key:"led", width:10 },
    { header:"DoSensor", key:"doSensorMsg", width:10 },
    { header:"Log", key:"log", width:10 },
    { header:"OX", key:"OX", width:10 },
]

/* assign category info to sheet */
workVerifyingLogic.columns = verifyingLogicCategory;
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

// X초가 지났을떄 실제 평균 값 저장
var avgSensors = [0,0,0,0,0,0,0,0]; // Rs
var avgFlag = [false,false,false,false,false,false,false,false];
var cntSamplingNumByDevice = [0,0,0,0,0,0,0,0];
var Led = ['N','N','N','N','N','N','N','N']

var doSensorMsg ="";
var log ="";
function doSensor(sensorId,time,volt,rs,avg){
    console.log('두 센서');
    console.log("알고리즘적용 전"+"average : "+ avg + ", reference"+  reference[sensorId-1] +"buffer:"+buffer[sensorId-1] )
    if(avg > reference[sensorId-1]){
        reference[sensorId-1] = avg;
        console.log('공기가 좋아짐 -> 기준값을 업데이트 , 시간 0 ')
        log = log + '공기가 좋아짐 -> 기준값을 업데이트 , 버퍼시간 0'
        threshholdTime[sensorId-1] = 0
    }else{
        log = log + '공기가 나빠지기 시작(기준점이 평균보다 높음), 기준값 변경 없음'
        console.log('기준값이 평균보다 더큼 -> 업데이트 x')
    }
    // adjust buffer zone
    var max = buffer[sensorId-1]+ Number(variableConfig.pulse);
    var min = buffer[sensorId-1] - Number(variableConfig.pulse);
    console.log('buffer Max'+max);
    console.log('buffer Min'+min);
    if(avg > max || avg < min){
        console.log('평균이 버퍼 밖에 있음, 버퍼시간 초기화 ')
        log = log + '평균이 버퍼 밖에 있음, 버퍼시간 초기화 '
        threshholdTime[sensorId-1] = 0;
        buffer[sensorId-1] = avg;
    }else{
        threshholdTime[sensorId-1] = threshholdTime[sensorId-1]+1;  
        console.log("평균이 버퍼안에 있음, 버퍼시간 누적");
        log = log + '평균이 버퍼안에 있음, 버퍼시간 누적 '
    }
    /* 주의 */
    if(threshholdTime[sensorId-1] >= variableConfig.timePulse+1){   
        console.log("평균이 버퍼안에 누적시간이"+ (threshholdTime[sensorId-1]-1)*30+"초 지남");
        log = log + "평균이 버퍼안에 누적시간이"+ (threshholdTime[sensorId-1]-1)*30+"초 지남, 기준점 내려줌"
        threshholdTime[sensorId-1] = 0;
        reference[sensorId-1]  = reference[sensorId-1] - variableConfig.referenceDown;
        console.log("레퍼런스값 다운"+reference[sensorId-1]);
    }

    // airquility index logic
    var AdcResult = parseFloat(avg)/parseFloat(reference[sensorId-1])
    if(AdcResult > variableConfig.blueSlope){
        Led[sensorId-1] = 'B'
    }else if(AdcResult> variableConfig.orangeSlope){
        Led[sensorId-1] = 'O'
    }else{
        Led[sensorId-1] = 'R'
    }
    console.log("알고리즘적용 후"+"average : "+ avg + ", reference"+  reference[sensorId-1] +"buffer:"+buffer[sensorId-1] )
};


function checkValidDateAndFindDeviceID(line){  
    var isValidTime = false;
    var deviceID = -1;
    indexVolt = line.indexOf('Volt');
    if(indexVolt == -1){
        isValidTime = false;
    }
    deviceID = line[indexVolt+4];
    if(deviceID > 0 ){
        isValidTime = true;
    }
    
    // if(!line.includes(variableConfig.date) ){
    //     console.log("해당데이터의 데이터를 찾을 수 없습니다. : " + isValidTime); 
    // }
    return !line.includes('N') &&  isValidTime  ? deviceID : -1; // Validation 성공하면 장치 ID 반환 , 실패하면 -1 반환    
    //return !line.includes('N') &&  isValidTime && line.includes(variableConfig.date) ? deviceID : -1; // Validation 성공하면 장치 ID 반환 , 실패하면 -1 반환    
};

var category = '';

fs.readFileSync(path.join(__dirname, './data') + fileConfig.teratermTextFile, 'utf8').toString().split('\n').forEach(function (line) { 
    log = "";
    var deviceID = checkValidDateAndFindDeviceID(line);
    var hasDeviceID = deviceID == 1 ? true : false;
    if(variableConfig.test){
        hasDeviceID = deviceID == variableConfig.testSensorNum ? true : false;
    }
    if(hasDeviceID){  // device Id 있을경우에만 액셀 데이터 출력
        //var time = line.substring(12,17);
        console.log('센서 값');
        var time = line.substring(12,23);
        var volt=parseFloat (line.substring(32,39));
        var rs = Number(line.substring(44,49)); 
        var avg = Number(line.substring(57,61));
        var serialReference = Number(line.substring(69,73));
        var serialLed = line.substring(79,80);

        avgFlag[deviceID-1] = false;
        /* 주의 */
        //if(cntSamplingNumByDevice[deviceID-1] == variableConfig.numberOfSamplingForAvg - 1){ 
        if(cntSamplingNumByDevice[deviceID-1] == variableConfig.numberOfSamplingForAvg ){ 
            cntSamplingNumByDevice[deviceID-1] = 0;
            avgFlag[deviceID-1] = true;
        }
        cntSamplingNumByDevice[deviceID-1] = cntSamplingNumByDevice[deviceID-1] + 1;
        
        if(avgFlag[deviceID-1]){
            doSensor(deviceID,time,volt,rs,avg);
            doSensorMsg = "두센서"
            
        }else{ // 센서값 알고리즘 적용
            doSensorMsg = "샘플링"
        }
        var numAvg = Number(avgSensors[deviceID-1]);
        var obj = {
            'time':time,
            'volt':volt,
            'rs':Number(rs),
            'avg': avg,
            'reference': Number(reference[deviceID-1]),
            'buffer': Number(buffer[deviceID-1]),
            'bufferMax': Number(buffer[deviceID-1] + variableConfig.pulse),
            'bufferMin': Number(buffer[deviceID-1] - variableConfig.pulse),
            'Led' : Led[deviceID-1],
            'blueSlope':  variableConfig.blueSlope,
            'orangeSlope':variableConfig.orangeSlope
        }
        
        if(obj['Led']!="N"){ // 기존 데이터는 데이터가 없으나 마이컴처럼 센서값을 초반부터 받아오는 로직이 없어서 초반 30초간 데이터 제거
            var sheetName = "Sensor"+String(deviceID);
            workbook.getWorksheet(sheetName).addRow(obj);
            var varifyObj  = 
            {
                rs : rs,
                serialTime : obj.time,
                serialAvg :  obj.avg,
                serialReference : serialReference,
                serialLed : serialLed,
                avg : obj.avg,
                reference : obj.reference,
                bufferMax: Number(buffer[deviceID-1] + variableConfig.pulse),
                bufferMin: Number(buffer[deviceID-1] - variableConfig.pulse),
                led : obj.Led, 
                OX : 'O',
                doSensorMsg : doSensorMsg,
                log : log
            }
            
            dataNum ++;
            if(varifyObj.serialReference != varifyObj.reference || varifyObj.serialLed != varifyObj.led){
                diffNum ++ ;
                varifyObj.OX = 'X';
            }  
            workVerifyingLogic.addRow(varifyObj);
        } 
    }
});

// 파일 리더 완료
// 변경 값 시트 저장 및 액셀 파일에 저장
workVerifyingLogic.commit();
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
console.log("Writing complete");
console.log(100-diffNum/dataNum*100+'%');