import { LightningElement, api, track } from 'lwc';

export default class TfPlayground extends LightningElement {
    tfVersion;
    ml5Version;

    handleGetTfVersionClick() {
        console.log('In Get TF Version Click');
        const getVersionEvent = new CustomEvent('gettfversion', {
            detail: { message: 'hello' }
        });
        this.dispatchEvent(getVersionEvent);
    }

    handleGetMl5VersionClick() {
        console.log('In Get ML5 Version Click');
        const getVersionEvent = new CustomEvent('getml5version', {
            detail: { message: 'hello' }
        });
        this.dispatchEvent(getVersionEvent);
    }

    @api
    returnTfVersion(version) {
        console.log(`In returnTfVersion, ${version}`);
        this.tfVersion = version;
    }

    @api
    returnMl5Version(version) {
        console.log(`In returnMl5Version, ${version}`);
        this.ml5Version = version;
    }

}