import { LightningElement, api, track } from 'lwc';

/* imports needed for loading Chart.js from static resources */
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import chartjs from '@salesforce/resourceUrl/chartJs';


/* Apex code to get the Boston Housing data and targets out of Salesforce records. */
import findFeatures from '@salesforce/apex/BostonHousingController.findFeatures';
import findTargets from '@salesforce/apex/BostonHousingController.findTargets';


export default class TfPlayground extends LightningElement {
    /* TensorFlow related fields. */
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

    /* Charting related fields. */
    error;
    chart;
    chartjsInitialized = false;

    config = {
        type: 'line',
        data: {
            datasets: [
                {
                    data: [],
                    backgroundColor: '#FF8080',
                    borderColor: '#FF8080',
                    label: 'loss',
                    fill: false
                },
                {
                    data: [],
                    backgroundColor: '#8080FF',
                    borderColor: '#8080FF',
                    label: 'val loss',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                xAxes: [{
                  type: 'linear'
                }]
            }
        }
    };


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

    renderedCallback() {
        if (this.chartjsInitialized) {
            return;
        }
        this.chartjsInitialized = true;

        Promise.all([
            loadScript(this, chartjs + '/Chart.min.js'),
            loadStyle(this, chartjs + '/Chart.min.css')
        ])
            .then(() => {
                // disable Chart.js CSS injection
                window.Chart.platform.disableCSSInjection = true;

                // const canvas = document.createElement('canvas');
                // this.template.querySelector('div.chart').appendChild(canvas);
                // const ctx = canvas.getContext('2d');
                // this.chart = new window.Chart(ctx, this.config);
            })
            .catch((error) => {
                this.error = error;
                console.log(error.toString());
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
        // console.log(`Got logs, ${JSON.stringify(this.logs)}`);
        let loss = [];
        let val_loss = [];

        logs.forEach((log, i) => {
            // loss.push(log.loss);
            // val_loss.push(log.val_loss);
            loss.push({x: i + 1, y: log.loss});
            val_loss.push({x: i + 1, y: log.val_loss});
        });

        this.config.data.datasets[0].data = loss;
        this.config.data.datasets[1].data = val_loss;

        const canvas = document.createElement('canvas');
        this.template.querySelector('div.chart').appendChild(canvas);
        const ctx = canvas.getContext('2d');
        this.chart = new window.Chart(ctx, this.config);

    }

}