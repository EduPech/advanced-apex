import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getBarcodeScanner } from "lightning/mobileCapabilities";
import insertAccount from "@salesforce/apex/AccountController.insertAccount";

export default class Scaner extends LightningElement {
  myScanner;
  scanButtonDisabled = false;
  scannedBarcode = "";
  message = "";

  // When component is initialized, detect whether to enable Scan button
  connectedCallback() {
    this.myScanner = getBarcodeScanner();
    if (this.myScanner == null || !this.myScanner.isAvailable()) {
      this.scanButtonDisabled = true;
    }
  }

  handleBeginScanClick(event) {
    // Reset scannedBarcode to empty string before starting new scan
    this.scannedBarcode = "";

    // Make sure BarcodeScanner is available before trying to use it
    // Note: We _also_ disable the Scan button if there's no BarcodeScanner
    console.log("myScanner: " + this.myScanner.isAvailable());
    if (this.myScanner != null && this.myScanner.isAvailable()) {
      const scanningOptions = {
        barcodeTypes: [this.myScanner.barcodeTypes.QR],
        instructionText: "Scan a QR Code",
        successText: "Scanning complete."
      };
      this.myScanner
        .beginCapture(scanningOptions)
        .then(async (result) => {
          console.log(result);

          // Do something with the barcode scan value:
          // - look up a record
          // - create or update a record
          // - parse data and put values into a form
          // - and so on; this is YOUR code
          // Here, we just display the scanned value in the UI
          await this.inserAccount();
          this.scannedBarcode = this.message;
          this.dispatchEvent(
            new ShowToastEvent({
              title: this.message,
              message: this.message,
              variant: "success"
            })
          );
        })
        .catch((error) => {
          // Handle cancellation and unexpected errors here
          console.error(error);

          if (error.code == "userDismissedScanner") {
            // User clicked Cancel
            this.dispatchEvent(
              new ShowToastEvent({
                title: "Scanning Cancelled",
                message: "You cancelled the scanning session.",
                mode: "sticky"
              })
            );
          } else {
            // Inform the user we ran into something unexpected
            this.dispatchEvent(
              new ShowToastEvent({
                title: "Barcode Scanner Error",
                message:
                  "There was a problem scanning the barcode: " + error.message,
                variant: "error",
                mode: "sticky"
              })
            );
          }
        })
        .finally(() => {
          console.log("#finally");

          // Clean up by ending capture,
          // whether we completed successfully or had an error
          this.myScanner.endCapture();
        });
    } else {
      // BarcodeScanner is not available
      // Not running on hardware with a camera, or some other context issue
      console.log("Scan Barcode button should be disabled and unclickable.");
      console.log("Somehow it got clicked: ");
      console.log(event);

      // Let user know they need to use a mobile phone with a camera
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Barcode Scanner Is Not Available",
          message: "Try again from the Salesforce app on a mobile device.",
          variant: "error"
        })
      );
    }
  }

  async inserAccount() {
    console.log("scannedBarcode: ");
    const res = await insertAccount();
    this.message = res.message;
    console.log(this.message);
  }
}
