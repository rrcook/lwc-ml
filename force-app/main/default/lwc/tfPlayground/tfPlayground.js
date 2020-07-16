import { LightningElement, api, track } from 'lwc';

export default class TfPlayground extends LightningElement {
    tfVersion;

    handleGetVersionClick() {
        console.log('In Get Version Click');
        const getVersionEvent = new CustomEvent('getversion', {
            detail: { message: 'hello' }
        });
        this.dispatchEvent(getVersionEvent);

    }

    @api
    receiveVersion(version) {
        console.log(`In receiveVersion, ${version}`);
        this.tfVersion = version;
    }

}