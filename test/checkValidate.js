

var line= '[2021-03-11 15:13:59.460] Volt2= 2.2087 Rs2= 4938 RsCur2=0 Rair=0 LED=N'
var startHour = 10;
var endHour = 12;

function checkValidDateAndFindDeviceID(line){
    var isValidTime = false;
    var deviceID = -1;
    var hours = _.range(startHour,endHour+1); // 시작 시간 종료시간 배열
    // hours돌면서 유효한 시간이 있을경우 isValidTime true 변환
    _.each(hours, function (element, index, list) {
        var isSameHour = line.includes(element) ? true : false;
        isValidTime = (isValidTime || isSameHour)
    });
    // Volt 로 부터 
    indexVolt = line.indexOf('Volt'); 
    if(indexVolt == -1){
        isValidTime = false;
    }
    deviceID = line[indexVolt+4];
    console.log(deviceID);
    return !line.includes('N') &&  isValidTime &&line.includes(variableConfig.date) ? deviceID : -1; // Validation 성공하면 장치 ID 반환 , 실패하면 -1 반환    
};

var returnValue = checkValidDateAndFindDeviceID(line);
console.log(returnValue);
// console output : 2
