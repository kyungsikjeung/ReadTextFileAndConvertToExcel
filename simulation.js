// Library
var fs = require('fs'); 
var path = require('path'); 
const readline = require('readline'); 
var Excel = require("exceljs");
var _ = require('underscore');

// File Setting
var fileConfig = {
    teratermTextFile: "/voc_0311_withPP1.txt",
    fileName :"./output/testalgorithm.csv",
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

console.log("---------------------------------------------------------------------------Setting Info---------------------------------------------------------------------------")
console.log(JSON.stringify(fileConfig))
console.log(JSON.stringify(variableConfig))
console.log("------------------------------------------------------------------------------------------------------------------------------------------------------------------")

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
    { header:"Led", key:"Led", width:10 },
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

// X초가 지났을떄 실제 평균 값 저장
var avgSensors = [0,0,0,0,0,0,0,0]; // Rs
var avgFlag = [false,false,false,false,false,false,false,false];
var cntSamplingNumByDevice = [0,0,0,0,0,0,0,0];
var Led = ['N','N','N','N','N','N','N','N']

// x초 이전의 장치별 Rs값 저장 (2D array)
var averageSensorArr = matrix(fileConfig.sensorNum,variableConfig.numberOfSamplingForAvg,0);

/* 2D array 만들기  
* @See https://stackoverflow.com/questions/3689903/how-to-create-a-2d-array-of-zeroes-in-javascript
* Param : rows(행)
* Param : cols(열)
* Param : defaultValue(초기화 값)
* Return : 2차 배열 w/ 초기값
*/
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

/*  공기청정 상대치 검증방법 알고리즘
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
        Led[deviceID-1] = 'Blue'
    }else if(AdcResult> variableConfig.orangeSlope){
        Led[deviceID-1] = 'Orange'
    }else{
        Led[deviceID-1] = 'Red'
    }
    return {
        'time':time,
        'volt':volt,
        'rs':rs,
        'avg':avg,
        'reference' : reference[sensorId-1],
        'buffer' : buffer[sensorId-1],
        'bufferMax' : buffer[sensorId-1] + variableConfig.pulse,
        'bufferMin' : bufferMin +  variableConfig.pulse,
        'Led' : Led[deviceID-1],
        'blueSlope': variableConfig.blueSlope,
        'orangeSlope': variableConfig.orangeSlope
    }
};

/* 날짜 ,원하는 시간의 데이터 유효성 검사, 데이터가 유효하면 제품 ID 반환 
*  @Param line : 텍스트 한라인  
*  return 제품 ID || -1 (제품없음)
*/
function checkValidDateAndFindDeviceID(line){
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
        deviceID = line[indexVolt+4]; 
    }) 
    return !line.includes('N') &&  isValidTime &&line.includes(variableConfig.date) ? deviceID : -1; // Validation 성공하면 장치 ID 반환 , 실패하면 -1 반환
};

  /* 제품 아이디에 해당되는 workSheet반환
  * @Param deviceID : 로그에 찍힌 제품의 아이디
  * @Return : 각 Device에 해당하는 workSheet반환
  */
  function getWorkSheetByDeviceID(deviceID){
    var workSheet;
    switch(deviceID){
        case 1:
            workSheet = worksheet1;
            break;
        case 2:
            workSheet = worksheet2;
            break;
        case 3:
            workSheet = worksheet3;
            break;
        case 4:
            workSheet = worksheet4;
            break;
        case 5:
            workSheet = worksheet5;
            break;
        case 6:
            workSheet = worksheet6;
            break;
        case 7:
            workSheet = worksheet7;
            break;
        case 8:
            workSheet = worksheet8;
            break;
    }
    return workSheet;
  }

fs.readFileSync(path.join(__dirname, './data') + fileConfig.teratermTextFile, 'utf8').toString().split('\n').forEach(function (line) { 
    
    var deviceID = checkValidDateAndFindDeviceID(line);
    var hasDeviceID = deviceID > -1 ? true : false;
    if(hasDeviceID){  
        var time = line.substring(12,17);
        var volt=parseFloat (line.substring(32,39));
        var rs = parseFloat(line.substring(44,49)); 

        /* 30초 지났을떄에만 평균 값 계산 및 데이터 저장, 현재 한 라인을 읽어이는것은 5초라고 생각함, 라인 6번 읽으면 30초로 간주
        * @Param cntSamplingNumByDevice : doSensor 수행되는 횟수
        * @Param averageSensorArr : Device ID에 따른 Rs값 저장, 평균을 내기 위한 디바이스별 Rs 저장 (2차배열)
        * @Param variableConfig.numberOfSamplingForAvg : 파라미터 값에 도달하면 cntSamplingNumByDevice 초기화
        * @Param avgFlag 30초 지났는지 확인해 주는 Flag  
        */
        avgFlag[deviceID-1] = false;
        if(cntSamplingNumByDevice[deviceID-1] == variableConfig.numberOfSamplingForAvg){ 
            avgSensors[deviceID-1] = _.mean(averageSensorArr[deviceID-1]) || 0;
            averageSensorArr[deviceID-1]=[];
            cntSamplingNumByDevice[deviceID-1] = 0;
            avgFlag[deviceID-1] = true;
        }

        // 장치별 평균값 임시저장소 저장 -> 30초 지났을떄 위 if 문에서 평균 측정 및 averageSensorArr에 평균값 저장
        var cntForAvg = cntSamplingNumByDevice[deviceID-1];
        averageSensorArr[deviceID-1][cntForAvg].push(rs);
        cntSamplingNumByDevice[deviceID-1] = cntForAvg + 1;

        // 평균 30초가 안지났다면 기존의 데이터 사용, 30초 지나면 기존의 값 업데이트
        var defaultObj = {
            'time':time,
            'volt':volt,
            'rs':rs,
            'avg':averageSensorArr[deviceID-1],
            'reference': reference[deviceID-1],
            'buffer': buffer[deviceID-1],
            'bufferMax': buffer[deviceID-1] + variableConfig.pulse,
            'bufferMin': buffer[deviceID-1] - variableConfig.pulse,
            'Led' : Led[deviceID-1],
            'blueSlope':  variableConfig.blueSlope,
            'orangeSlope':variableConfig.orangeSlope
        }
        var obj;
        if(avgFlag[deviceID-1]){
            obj = defaultObj;
        }else{ // 센서값 알고리즘 적용
            obj = dosensordoSensor(deviceID,time,volt,rs, averageSensorArr[deviceID-1]);
            // update
            //averageSensorArr[deviceID-1] = obj['averageSensorArr[deviceID-1]'];
            //reference[deviceID-1] = obj['reference[deviceID-1]'];
            //buffer[deviceID-1] = obj['buffer[deviceID-1]'];
        }
        
        //var obj = avgFlag[deviceID-1] ? dosensordoSensor(deviceID,time,volt,rs, averageSensorArr[deviceID-1]) : defaultObj
        getWorkSheetByDeviceID(deviceID).addRow(obj)    
    }
});

// 파일 리더 완료
// 변경 값 시트 저장 및 액셀 파일에 저장
worksheet1.commit(); 
worksheet2.commit(); 
worksheet3.commit(); 
worksheet4.commit(); 
worksheet5.commit(); 
worksheet6.commit(); 
worksheet7.commit(); 
worksheet8.commit(); 

// 완료 메세지
console.log("Writing complete");