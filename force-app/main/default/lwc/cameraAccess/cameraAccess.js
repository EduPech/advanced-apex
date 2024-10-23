import { LightningElement, api } from "lwc";
import { getBarcodeScanner } from "lightning/mobileCapabilities";

export default class CameraAccess extends LightningElement {
  @api cameraOptions = [];
  @api cameraOpened = false;
  cameraID = "";
  resolution = "1920x1080";

  async connectedCallback() {
    await this.requestCameraPermission();
    await this.listCameras();
  }

  async requestCameraPermission() {
    try {
      const constraints = { video: true, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.closeStream(stream);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async listCameras() {
    let options = [];
    let allDevices = await navigator.mediaDevices.enumerateDevices();
    for (let i = 0; i < allDevices.length; i++) {
      let device = allDevices[i];
      if (device.kind == "videoinput") {
        options.push({ label: device.label, value: device.deviceId });
      }
    }
    this.cameraOptions = options;
    if (options.length > 0) {
      this.cameraID = options[0].value;
    }
  }

  handleCameraChange(event) {
    this.cameraID = event.detail.value;
  }

  closeStream(stream) {
    if (stream) {
      const tracks = stream.getTracks();
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        track.stop(); // stop the opened tracks
      }
    }
  }

  get resolutionOptions() {
    return [
      { label: "640x480", value: "640x480" },
      { label: "1280x720", value: "1280x720" },
      { label: "1920x1080", value: "1920x1080" },
      { label: "3840x2160", value: "3840x2160" }
    ];
  }

  handleResolutionChange(event) {
    this.resolution = event.detail.value;
  }

  get buttonLabel() {
    const label = this.cameraOpened ? "Close Camera" : "Open Camera";
    return label;
  }
  async toggleCamera() {
    if (this.cameraOpened == false) {
      const width = parseInt(this.resolution.split("x")[0]);
      const height = parseInt(this.resolution.split("x")[1]);
      const videoConstraints = {
        video: { width: width, height: height, deviceId: this.cameraID },
        audio: false
      };
      const cameraStream =
        await navigator.mediaDevices.getUserMedia(videoConstraints);
      this.template.querySelector("video").srcObject = cameraStream;
      this.cameraOpened = true;
    } else {
      this.closeStream(this.template.querySelector("video").srcObject);
      this.template.querySelector("video").srcObject = null;
      this.cameraOpened = false;
    }
  }
}
