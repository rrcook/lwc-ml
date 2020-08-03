import { LightningElement, api, track } from 'lwc';

/* Apex code to get the Boston Housing data and targets out of Salesforce records. */
import findFeatures from '@salesforce/apex/BostonHousingController.findFeatures';
import findTargets from '@salesforce/apex/BostonHousingController.findTargets';


export default class TfPlayground extends LightningElement {
    tfVersion = "loading...";
    ml5Version = "loading...";
    statusMessage = "";
    modelStatusMessage = "";
    progressPercentage = 0;
    runButtonDisabled = true;
    logs = [];

    trainFeatures;
    testFeatures;
    trainTargets;
    testTargets;

    findTrainTargets() {
        return findTargets({ testKey: 'N' });
    }

    findTestTargets() {
        return findTargets({ testKey: 'Y' });
    }

    findTrainFeatures() {
        return findFeatures({ testKey: 'N' });
    }

    findTestFeatures() {
        return findFeatures({ testKey: 'Y' });
    }    
    
    connectedCallback() {
        this.trainFeatures = [];
        this.testFeatures = [];
        this.trainTargets = [];
        this.testTargets = [];

        const removeId = (({ Id, ...o }) => o)
    
        Promise.all([this.findTrainTargets(), this.findTestTargets(),
            this.findTrainFeatures(), this.findTestFeatures()]).then(data => {
                /* 
                 * Each item is an array of arrays. This loop takes each item in each
                 * array and removes the 'Id' keyed item from the object.
                 * These objects didn't like Object.defineProperites so we have to make
                 * new objects.
                 */
                let readyData = data.map(arr => arr.map(element => removeId(element)));
                [this.trainTargets, this.testTargets, this.trainFeatures, this.testFeatures] = readyData;
                console.log(`train length is ${this.trainTargets.length}, test length is ${this.testTargets.length}`);
                console.log(`train length is ${this.trainFeatures.length}, test length is ${this.testFeatures.length}`);
                // console.log(`data is ${JSON.stringify(this.testTargets)}`);
                this.shuffle(this.trainFeatures, this.trainTargets);
                this.shuffle(this.testFeatures, this.testTargets);
            }).catch(error => {
                console.log("Had an error");
                console.log(error);
                this.testTargets = [];
            });    
    }        

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

    handleRunBostonHousingClick() {
        console.log('In Run Boston Housing Click');
        let bostonData = {
            trainFeatures: this.trainFeatures,
            trainTargets: this.trainTargets,
            testFeatures: this.testFeatures,
            testTargets: this.testTargets
        };
        const runEvent = new CustomEvent('runbostonhousing', {
            detail: { bostonData: bostonData }
        });
        this.dispatchEvent(runEvent);
    }

    /**
     * Shuffles data and target (maintaining alignment) using Fisher-Yates
     * algorithm.flab
     */
    shuffle(data, target) {
        let counter = data.length;
        let temp = 0;
        let index = 0;
        while (counter > 0) {
            index = (Math.random() * counter) | 0;
            counter--;
            // data:
            temp = data[counter];
            data[counter] = data[index];
            data[index] = temp;
            // target:
            temp = target[counter];
            target[counter] = target[index];
            target[index] = temp;
        }
    }

    /**
     * Methods that receive results back from the Aura component that is hosting TensorFlow.
     */

    @api
    returnTfVersion(version) {
        console.log(`LWC-In returnTfVersion, ${version}`);
        this.tfVersion = version;
        this.runButtonDisabled = false;
    }

    @api
    returnMl5Version(version) {
        console.log(`LWC-In returnMl5Version, ${version}`);
        this.ml5Version = version;
    }

    @api
    updateStatus(statusMessage) {
        this.statusMessage = statusMessage;
    }

    @api
    updateModelStatus(modelStatusMessage) {
        this.modelStatusMessage = modelStatusMessage;
    }

    @api
    updateProgress(progress, totalProgress) {
        this.progressPercentage = (progress * 100) / totalProgress;
    }

    @api
    returnLogs(logs) {
        this.logs = logs;
        console.log(`Got logs, ${JSON.stringify(this.logs)}`);
    }

}