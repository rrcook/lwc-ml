import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import TF_JS from '@salesforce/resourceUrl/tf';

export default class TfGetVersion extends LightningElement {
    tfversion;
    tfInitialized;

    connectedCallback() {
        console.log(`We're in.`);
        console.log(TF_JS.toString());
        if (this.tfInitialized) {
            return;
        }
        this.tfInitialized = true;

        loadScript(this, TF_JS + '/tf.js')
            .then(() => {
                console.log(`We got it.`);
                this.tfversion = tf.version.tfjs;
                // this.tfversion = moment.version;
            })
            .catch((error) => {
                console.log(`Oops an error ${error}`);
                this.error = error;
            });
    }

}