/**
 * Data 폴더에 있는 텍스트 파일 읽어 들여와 액셀 파일로 저장
 * input 파일의 경로와 output 파일 경로 설정해 줄것!
 *  ctrl + `
 * npm init
 * npm install fs
 * npm install path
 * npm install readline
 * npm install exceljs
 * node index.js
 */

/* 라이브러리(파일관련, 유틸리티 ,액셀관련)  */
var fs = require('fs'); 
var path = require('path'); 
const readline = require('readline'); 
var Excel = require("exceljs");

/* 저장할 액셀 파일명 - 현재 폴더에 아웃풋 폴더에 csv파일 저장 */
var fileName ="./output/voc_0311_withPP1.csv";
/* 테라텀 파일 데이터 폴더에 저장할것 - 현재폴더의 data폴더에 테라텀 데이터 저장*/
var teratermTextFile = "/voc_0311_withPP1.txt";

/*  */
var options = {
    filename: fileName, // existing filepath
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
  var worksheetTotalData = workbook.getWorksheet("totalData");
  var worksheet1 = workbook.getWorksheet("Sensor1");
  var worksheet2 = workbook.getWorksheet("Sensor2");
  var worksheet3 = workbook.getWorksheet("Sensor3");
  var worksheet4 = workbook.getWorksheet("Sensor4");
  var worksheet5 = workbook.getWorksheet("Sensor5");
  var worksheet6 = workbook.getWorksheet("Sensor6");
  var worksheet7 = workbook.getWorksheet("Sensor7");
  var worksheet8 = workbook.getWorksheet("Sensor8");

// 파일 스트림으로 읽기.
//var readStream = fs.createReadStream(path.join(__dirname, './data') + '/021804.txt', 'utf8');

// 센서 데이터에 보여줄 데이터
var category = [
    { header:"Time", key:"time", width:10 },
    { header:"Volt", key:"volt", width:10 },
    { header:"RS", key:"rs", width:10 },
    { header:"RsCurrent", key:"rsCurrent", width:10 },
    { header:"RsAir", key:"rsAir", width:10 }
];

// 통합 데이터에 보여줄 데이터
var totalCategory = [
    { header:"Time", key:"time", width:10 },
    { header:"Volt1", key:"volt1", width:10 },
    { header:"Volt2", key:"volt2", width:10 },
    { header:"Volt3", key:"volt3", width:10 },
    { header:"Volt4", key:"volt4", width:10 },
    { header:"Volt5", key:"volt5", width:10 },
    { header:"Volt6", key:"volt6", width:10 },
    { header:"Volt7", key:"volt7", width:10 },
    { header:"Volt8", key:"volt8", width:10 },
    { header:"RS1", key:"rs1", width:10 },
    { header:"RS2", key:"rs2", width:10 },
    { header:"RS3", key:"rs3", width:10 },
    { header:"RS4", key:"rs4", width:10 },
    { header:"RS5", key:"rs5", width:10 },
    { header:"RS6", key:"rs6", width:10 },
    { header:"RS7", key:"rs7", width:10 },
    { header:"RS8", key:"rs8", width:10 },
    { header:"RSCURRENT1", key:"rsCurrent1", width:10 },
    { header:"RSCURRENT2", key:"rsCurrent2", width:10 },
    { header:"RSCURRENT3", key:"rsCurrent3", width:10 },
    { header:"RSCURRENT4", key:"rsCurrent4", width:10 },
    { header:"RSCURRENT5", key:"rsCurrent5", width:10 },
    { header:"RSCURRENT6", key:"rsCurrent6", width:10 },
    { header:"RSCURRENT7", key:"rsCurrent7", width:10 },
    { header:"RSCURRENT8", key:"rsCurrent8", width:10 },
    { header:"RSAIR1", key:"rsAir1", width:10 },
    { header:"RSAIR2", key:"rsAir2", width:10 },
    { header:"RSAIR3", key:"rsAir3", width:10 },
    { header:"RSAIR4", key:"rsAir4", width:10 },
    { header:"RSAIR5", key:"rsAir5", width:10 },
    { header:"RSAIR6", key:"rsAir6", width:10 },
    { header:"RSAIR7", key:"rsAir7", width:10 },
    { header:"RSAIR8", key:"rsAir8", width:10 }
];

/* 시트에 항목 할당 */
worksheetTotalData.columns = totalCategory;
worksheet1.columns = category;
worksheet2.columns = category;
worksheet3.columns = category;
worksheet4.columns = category;
worksheet5.columns = category;
worksheet6.columns = category;
worksheet7.columns = category;
worksheet8.columns = category;

// output.txt 에 저장 하기
//WriteStream =fs.createWriteStream(path.join(__dirname, './data') + '/test.txt', 'utf8');

// 데이터 넣을 RowNumber 초기 값
var rowNum = 2;
// 텍스트 파일을 데이터를 라인별로 읽어 들여와 액셀에 데이터 저장
fs.readFileSync(path.join(__dirname, './data') + teratermTextFile, 'utf8').toString().split('\n').forEach(function (line) { 
    // 읽어 들여온 라인데이터 Object 형식으로 변환
    if(!line.includes('N')){ // blink LED 제거
        var time = line.substring(12,17);
        var volt=parseFloat (line.substring(32,39));
        var rs = parseFloat(line.substring(44,49));
        var rsCurrent = parseFloat(line.substring(57,61));
        var rsAir = parseFloat(line.substring(69,73));
        var obj = {time:time,volt:volt,rs:rs, rsCurrent:rsCurrent, rsAir: rsAir };
  
        if(line.includes('2021-03-11')){
            if(line.includes('Volt1')){
                worksheetTotalData.getRow(rowNum).getCell('A').value=time;
                worksheetTotalData.getRow(rowNum).getCell('B').value=volt;
                worksheetTotalData.getRow(rowNum).getCell('J').value=rs;
                worksheetTotalData.getRow(rowNum).getCell('R').value=rsCurrent;
                worksheetTotalData.getRow(rowNum).getCell('Z').value=rsAir;
                worksheet1.addRow(obj);
            // 라인 데이터(line.toString() output 텍스트 파일에 저장 
            //fs.appendFileSync(path.join(__dirname, './data') + '/test.txt', line.toString() + "\n");
            }
            else if(line.includes('Volt2')){
                worksheetTotalData.getRow(rowNum).getCell('A').value=time;
                worksheetTotalData.getRow(rowNum).getCell('C').value=volt;
                worksheetTotalData.getRow(rowNum).getCell('K').value=rs;
                worksheetTotalData.getRow(rowNum).getCell('S').value=rsCurrent;
                worksheetTotalData.getRow(rowNum).getCell('AA').value=rsAir;
                worksheet2.addRow(obj);
            }
            else if(line.includes('Volt3')){
                worksheetTotalData.getRow(rowNum).getCell('A').value=time;
                worksheetTotalData.getRow(rowNum).getCell('D').value=volt;
                worksheetTotalData.getRow(rowNum).getCell('L').value=rs;
                worksheetTotalData.getRow(rowNum).getCell('T').value=rsCurrent;
                worksheetTotalData.getRow(rowNum).getCell('AB').value=rsAir;
                worksheet3.addRow(obj);
            }
            else if(line.includes('Volt4')){
                console.log(JSON.stringify(obj))
                worksheetTotalData.getRow(rowNum).getCell('A').value=time;
                worksheetTotalData.getRow(rowNum).getCell('E').value=volt;
                worksheetTotalData.getRow(rowNum).getCell('M').value=rs;
                worksheetTotalData.getRow(rowNum).getCell('U').value=rsCurrent;
                worksheetTotalData.getRow(rowNum).getCell('AC').value=rsAir;
                worksheet4.addRow(obj);
            }
            else if(line.includes('Volt5')){
                worksheetTotalData.getRow(rowNum).getCell('A').value=time;
                worksheetTotalData.getRow(rowNum).getCell('F').value=volt;
                worksheetTotalData.getRow(rowNum).getCell('N').value=rs;
                worksheetTotalData.getRow(rowNum).getCell('V').value=rsCurrent;
                worksheetTotalData.getRow(rowNum).getCell('AD').value=rsAir;
                worksheet5.addRow(obj);
            }
            else if(line.includes('Volt6')){
                worksheetTotalData.getRow(rowNum).getCell('A').value=time;
                worksheetTotalData.getRow(rowNum).getCell('G').value=volt;
                worksheetTotalData.getRow(rowNum).getCell('O').value=rs;
                worksheetTotalData.getRow(rowNum).getCell('W').value=rsCurrent;
                worksheetTotalData.getRow(rowNum).getCell('AE').value=rsAir;
                worksheet6.addRow(obj);
            }
            else if(line.includes('Volt7')){
                worksheetTotalData.getRow(rowNum).getCell('A').value=time;
                worksheetTotalData.getRow(rowNum).getCell('H').value=volt;
                worksheetTotalData.getRow(rowNum).getCell('P').value=rs;
                worksheetTotalData.getRow(rowNum).getCell('X').value=rsCurrent;
                worksheetTotalData.getRow(rowNum).getCell('AF').value=rsAir;
                worksheet7.addRow(obj);
            }
            else if(line.includes('Volt8')){ // 주의 마지막 센서에 rowNum++ 해주기
                worksheetTotalData.getRow(rowNum).getCell('A').value=time;
                worksheetTotalData.getRow(rowNum).getCell('I').value=volt;
                worksheetTotalData.getRow(rowNum).getCell('Q').value=rs;
                worksheetTotalData.getRow(rowNum).getCell('Y').value=rsCurrent;
                worksheetTotalData.getRow(rowNum).getCell('AG').value=rsAir;
                worksheet8.addRow(obj);
                rowNum++;
            }
        }
    }
});

// 변경 값 시트 저장 및 액셀 파일에 저장
worksheetTotalData.commit(); 
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