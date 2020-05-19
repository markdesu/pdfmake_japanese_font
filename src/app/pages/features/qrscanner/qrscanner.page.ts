import { Component, OnInit } from '@angular/core';
import jsQR, { QRCode } from "jsqr";
import { Router } from '@angular/router';
import { WeighingService } from '../../../services/weighing.service';
import { Events, MenuController, Platform }  from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Subject } from '../../../../../node_modules/rxjs';
import { takeUntil } from '../../../../../node_modules/rxjs/operators';
// import { Platform } from '../../../../../node_modules/@angular/cdk/platform';
 
@Component({
  selector: 'app-qrscanner',
  templateUrl: './qrscanner.page.html',
  styleUrls: ['./qrscanner.page.scss'],
})

export class QrscannerPage implements OnInit {

  canvasElement: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  outputContainer: HTMLDivElement;
  outputMessage: HTMLDivElement;
  outputData: HTMLDivElement;
  video: HTMLVideoElement;
  qrcodeDetected: string;
  
  qrStatus: HTMLDivElement;
  scanStatus:string = '';
  disable_btnOpen = true;
  wIDStatus = '';

  img_url:string = 'assets/img/No_img-01.png';
  show_divCam = true;
  show_divImage = false;
  show_btnCheck = false;
  OnScan = false;
  
  access_code = '';
  weighing_id = '';
  provider_id;
  weighing_no;
  weighing_date;
  myReq;


  backURL = '/dashboard';
  MobileBrowser = false;
  
  localstream ;
  private readonly onDestroy = new Subject<void>();
  
  constructor( private weighingAPI : WeighingService, 
    private router: Router,  
    public events: Events, 
    private menuCtrl : MenuController , 
    private alertCtrl: AlertController,
    private platform : Platform) { 
    this.menuCtrl.enable(true);
  }
  
  ngOnInit() {
    this.MobileBrowser = this.isMobileBrowser();
    this.canvasElement = <HTMLCanvasElement> document.getElementById('scan-canvas');
    this.canvasContext = this.canvasElement.getContext('2d');
    this.outputContainer = <HTMLDivElement>document.getElementById('output');
    this.outputMessage = <HTMLDivElement>document.getElementById('outputMessage');
    this.outputData = <HTMLDivElement>document.getElementById('outputData');
    this.video = <HTMLVideoElement>document.createElement('video');
    this.qrStatus = <HTMLDivElement>document.getElementById('qrStatus');
  }
  
  isMobileBrowser() {  
    // is this web-browser on mobile device
    return this.platform.is('mobileweb');
  }

  ionViewWillLeave() {
    this.onDestroy.next();
    this.video.pause();
this.localstream.stop();
    window.cancelAnimationFrame(this.myReq);
  }

  ionViewDidEnter() {
     this.startScanner();
  }
  
  showImg() {
    this.show_divCam =  false;
    this.show_divImage = true;
    this.OnScan = false;
    this.wIDStatus = '';
    if(this.img_url && this.img_url != ''){
       this.show_btnCheck = true;
    }
  }
  
  startScanner() {
 
    document.getElementById('scan-canvas').scrollIntoView();
    this.clearCanvas();
    this.OnScan = true;
    
    try{
      // Some constraints property might cause error due to camptibility on the device. ex: height:300 
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment'} }).then(async (stream: MediaStream) => {
     
        this.video.srcObject = stream;
        this.video.setAttribute('playsinline', 'true');
     
        // QR Code is not detected.
        this.qrStatus.style.color="#df7d7de0";
        this.scanStatus ="QR コードが検出されませんでした.";
        this.disable_btnOpen = true;
        await this.video.play();
        
        this.myReq = requestAnimationFrame(this.tick.bind(this));
          this.localstream = stream.getTracks()[0]; 
      });
    }catch{
      this.presentAlert();
    }
  }
  
  async presentAlert() {
    const alert = await this.alertCtrl.create({
      header: '通知',
      subHeader: 'サービスは利用できません',
      message: 'このブラウザはスキャンサービスをサポートしていません。このブラウザのバージョンを更新するか、別のブラウザを使用するか、画像を手動でアップロードしてください。',
      buttons: ['はい']
    });

    await alert.present();
  }
  
  tick(): void {

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.canvasElement.hidden = false;
        this.canvasElement.height = this.video.videoHeight;
        this.canvasElement.width = this.video.videoWidth;
        this.canvasContext.drawImage(this.video, 0, 0, this.canvasElement.width, this.canvasElement.height);
        const imageData: ImageData = this.canvasContext.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
        const code: QRCode = jsQR(imageData.data, imageData.width, imageData.height);
        
      if(this.OnScan) {      
        if (code) {
          if(code.data != '') {
            this.drawLine(code.location.topLeftCorner, code.location.topRightCorner, '#FF3B58');
            this.drawLine(code.location.topRightCorner, code.location.bottomRightCorner, '#FF3B58');
            this.drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, '#FF3B58');
            this.drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, '#FF3B58');
            
            // QR Code is detected.
            this.qrcodeDetected = code.data;
            this.qrStatus.style.color="#79cf86e0";
            this.scanStatus ="QR コードが検出されました.";
            this.disable_btnOpen = false;
            this.presentAlertOK('成功','QR コードが検出されました。', 'alertSuccess').then( res =>{
              if(res){
                  this.checkAccessID();
              }
            });
            
          } else {
            this.myReq =   requestAnimationFrame(this.tick.bind(this)); 
          }
        } else {
          this.myReq = requestAnimationFrame(this.tick.bind(this)); 
        }
      } else {
        this.video.pause();
      }
    } 
  }
  
  drawLine(begin, end, color): void {
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(begin.x, begin.y);
    this.canvasContext.lineTo(end.x, end.y);
    this.canvasContext.lineWidth = 4;
    this.canvasContext.strokeStyle = color;
    this.canvasContext.stroke();
  } 
  
  previewFile(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      
      reader.onload = (event:any) => {
          this.img_url = event.target.result;
      }
    }
    this.scanStatus = 'チェック用';
    this.show_btnCheck = true;
    this.disable_btnOpen = true;
  }
  
  checkQR() {
    window.cancelAnimationFrame(this.myReq);
    this.wIDStatus = '';
    var canvas2 = document.createElement('canvas');
        canvas2.style.border ="solid black";
    var tempimg = <HTMLImageElement>document.getElementById("up_img");
    var canvasContext = canvas2.getContext('2d');       
    
    canvas2.width =  tempimg.width;
    canvas2.height =  tempimg.height;
 
    canvasContext.drawImage(tempimg, 0, 0,  canvas2.width,canvas2.height);

    const qrCodeImageFormat = canvasContext.getImageData(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
    const qrDecoded = jsQR(qrCodeImageFormat.data, qrCodeImageFormat.width, qrCodeImageFormat.height);

    if(qrDecoded) {
      //QR Code is detected on the uploaded image.
      this.qrcodeDetected = qrDecoded.data;
      this.qrStatus.style.color = "#79cf86e0";
      this.scanStatus = "QR コードが検出されました.";
      this.disable_btnOpen = false;
    } else {
      //QR Code is not detected on the uploaded image.
      this.qrStatus.style.color = "#df7d7de0";
      this.scanStatus = "QR コードが検出されませんでした.";
      this.qrcodeDetected = ''; 
    }
  }
  
  checkWeighing(provider,weighing_date,weighing_no) {

    var isnum = /^\d+$/.test(weighing_no);
    if(isnum) {
       this.weighingAPI.checkWeighing(provider,weighing_date,weighing_no).pipe(takeUntil(this.onDestroy)).subscribe(res => {   
        if(res) {
          if(res.status != '401') {
            if(res.data) {
              if(res.data.count == 1) {
                this.events.publish('shipmentdetails');
                this.clearCanvas();
                this.router.navigate(['/weighing-detail', res.data.weighing_id, provider, weighing_date],  {queryParams : {url: '/qrscanner'}} );
              } else {
                //Weighing ID not found.
                this.wIDStatus = '計量 ID が見つかりません.';
              }
            } else {
                this.wIDStatus = '計量 ID が見つかりません.';
            }
          }
        }
    });
    }else{
      //Invalid Weighing ID.
      this.wIDStatus = '無効な計量 ID.';
    }
     
  }
  clearCanvas() {
    this.show_divImage = false;
    this.show_btnCheck = false;
    this.show_divCam =  true;
    this.wIDStatus = '';
    this.qrcodeDetected = '';
    this.scanStatus = '';
    this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }
  
  checkAccessID() {
    this.wIDStatus = '';
    var strDecoded = this.qrcodeDetected;
    var splitValue = strDecoded.split("/");
    var new_val = splitValue[splitValue.length - 1];
    var p_id   = +new_val.substring(0,1);
    var w_date = +new_val.substring(1,9);
    var w_no   = +new_val.substring(9,new_val.length);

    if(p_id && w_date && w_no && String(w_date).length == 8) {
      this.provider_id = p_id;
      this.weighing_date = w_date;
      this.weighing_no = w_no;
      this.checkWeighing(this.provider_id, this.weighing_date, this.weighing_no);
    } else {
      //Generated Code is invalid.
      document.getElementById('IDstatus').scrollIntoView();
      this.wIDStatus = '生成されたコードが無効です.';
      this.disable_btnOpen = true;
    }
  }
  
  async presentAlertOK(title,message, cssclass) {
    var  choice = false;
    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: [{
          text: '次に',
          handler: () => {
              choice = true;
          }
        }
      ],
      cssClass: cssclass
    });

    await alert.present();
    await alert.onDidDismiss();
    return choice;
  }
}


// <!-- Comment Area Below _______________________________________________________________________________________ -->

// if(splitDecoded.length == 3){
// this.access_code = splitDecoded[0];
// this.provider_id = splitDecoded[1];
// this.weighing_id = splitDecoded[2];
