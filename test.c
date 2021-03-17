#include "main.h"
volatile struct _Adc Adc;

uint8_t mode;
uint16_t Time_Pulse;    //Rs에 따른 기준 저항(Rs)을 올릴때 쓰는 시간. Rs가 흔들리면 기준 저항(Rs)을 안올림.
//uint8_t  PulseFlag=1;
//uint16_t PluseDif;

void DoSensor(void)
{

  if(Flag.Ave){ // 30초 평균
    Flag.Ave=0; // Flag.Ave를 30초당 한번씩 1로 바꿔준다.
    Adc.V2Cur=Adc.AveReal*3.3/4096; // Voltage 를 
    Adc.V1Cur=(Adc.V2Cur*R1)/R2;                        //3.38V-1.66V -> 1.72V
    Adc.VRLCur=Adc.V1Cur+Adc.V2Cur;                             //3.38V
    Adc.RsCur=(int)(R1+R2)*(V5/Adc.VRLCur-1);
    // 모드가 변경되는 시점.. 
    if(Adc.V2Cur>3.0 &&  Mode==Normal_30sec){           // 3.0V 이상부터 빨간색을 바꾸고 싶으면 이곳 수정
      if(Time_Status<30){                                               //초기 30분안 안에 빨간색
        SensorLedStatus=Red;
      }
      else if(Time_Status<60){                                          //빨간색 30분 이후 30분 동안 오렌지색
        SensorLedStatus=Orange;
      }
      else{Time_Status=0;}
    }
    else if(Adc.V2Cur>2.8 &&  Mode==Normal_30sec){      // 2.8V 이상부터 오렌지색을 바꾸고 싶으면 이곳 수정
      if(Time_Status<30){                                                 //초기 30분안 안에 오렌지색
        SensorLedStatus=Orange;
      }
      else if(Time_Status<60){                                          //오렌지색 30분 이후 30분 동안 파란색
        SensorLedStatus=Blue;
      }
      else{Time_Status=0;}
    }
    else{//공기가 깔끔할떄 
    Time_Status=0; // 기준값이 
    if(Adc.RsCur>Adc.RsAirCur){     //한번 체크하고 바꾸면 어쩌다가 한번 값이 들어오면 값이 변경됨. 몇번 체크하는게 좋을듯??
      Adc.RsAirCur=Adc.RsCur;  // rsair커렌트는 비교하기 위한 저항값. 색깔을 표시할려면 기준값이 필요하고 제가, 30분값 평균한값이 현재랑 얼마나 벌어졌으면 그래프에서 떨어지는 부분이 존재한다면 아래로 떨어진다면 공기질이     
      //PulseFlag=1;
    }
    //
    if(Adc.RsCur<Adc.RsBufCur-Pulse || Adc.RsCur>Adc.RsBufCur+Pulse){              
      Time_Pulse=0;
      Adc.RsBufCur=Adc.RsCur;
    }else{
      Time_Pulse++;
    }
    /*
    if(PulseFlag==1){
      PulseFlag=0;
      PluseDif=(Adc.RsAirCur-Adc.RsCur)/10;
    }*/
    if(Time_Pulse>=120){         
      Time_Pulse=0;
      Adc.RsAirCur-=Adc.RsAirCur-200;
      //여기에 기준 저항값을 바꿔야됨. RsAir 얼마나?or 어떻게?
    }
      Adc.Result=(float)Adc.RsCur/(float)Adc.RsAirCur;
      if(Adc.Result>0.9){
          SensorLedStatus=Blue;  
      }
      else if(Adc.Result>0.85){
          SensorLedStatus=Orange;
      }
      else{
          SensorLedStatus=Red;  
      }
    }   
  }
} 
/*
void DoSensor(void)
{
  if(Flag.Ave){
    Flag.Ave=0;
    Adc.V2Pre=Adc.AveReal*3.3/4096;
    if(Adc.V2Pre>3.0 &&  Mode==Normal_30sec){           // 3.0V 이상부터 빨간색을 바꾸고 싶으면 이곳 수정
      if(Time_Status<30){                                               //초기 30분안 안에 빨간색
      //if(Time_Status<2){
        SensorLedStatus=Red;
      }
      else if(Time_Status<60){                                          //빨간색 30분 이후 30분 동안 오렌지색
      //else if(Time_Status<4){
        SensorLedStatus=Orange;
      }
      else{Time_Status=0;}
    }
    else if(Adc.V2Pre>2.8 &&  Mode==Normal_30sec){      // 2.8V 이상부터 오렌지색을 바꾸고 싶으면 이곳 수정
      if(Time_Status<30){                                                   //초기 30분안 안에 오렌지색
      //if(Time_Status<2){
        SensorLedStatus=Orange;
      }
      else if(Time_Status<60){                                          //빨간색 30분 이후 30분 동안 파란색
      //else if(Time_Status<4){
        SensorLedStatus=Blue;
      }
      else{Time_Status=0;}
    }
    else{Time_Status=0;}
    
    if(Adc.V2Ref*1.1<Adc.V2Pre){                                        //10퍼센트 상승 시 색 변화(공기가 나빠짐)
      
      Adc.V2Ref=Adc.V2Pre;
      if(SensorLedStatus==Blue){
        SensorLedStatus=Orange;
      }
      else if(SensorLedStatus==Orange){
        SensorLedStatus=Red;  
      }
    }
    if(Adc.V2Ref*0.95>Adc.V2Pre){                                       //5퍼센트 하락 시 색 변화(공기가 좋아짐)
      
      Adc.V2Ref=Adc.V2Pre;
      if(SensorLedStatus==Orange){
        SensorLedStatus=Blue;
      }
      else if(SensorLedStatus==Red){
        SensorLedStatus=Orange;  
      }
    }
  }
  //else{Time_Status=0;}
  if(Mode!=Normal_30sec){Time_Status=0;}
}*/

