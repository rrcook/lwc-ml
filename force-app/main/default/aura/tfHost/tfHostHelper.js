({
    // Some hyperparameters for model training.
    NUM_EPOCHS: 200,
    BATCH_SIZE: 40,
    LEARNING_RATE: 0.01,

    bostonData: {},
    tensors: {},
    numFeatures: 0,



    helperMethod: function () {

    },

    runBostonHousing: function (component, bostonData) {
        // Synchronous setup.
        console.log(`host in run boston housing`);
        const playground = component.find('playground');
        this.bostonData = bostonData;
        this.numFeatures = Object.keys(bostonData.trainFeatures[0]).length;
        this.arraysToTensors();
        playground.updateStatus("Arrays converted to Tensors.");

        const model = this.multiLayerPerceptronRegressionModel2Hidden();
        console.log(`host model is ${model.toString()}`);
        console.log(`Backend is ${tf.getBackend()}`);
        console.log(`Browser is ${JSON.stringify(tf.env().get('IS_BROWSER'))}`)
        console.log(`Environment is ${JSON.stringify(tf.env().platform)}`);


        (async () => {
            model.compile(
                { optimizer: tf.train.sgd(this.LEARNING_RATE), loss: 'meanSquaredError' });

            let trainLogs = [];
            // const container = document.querySelector(`#${modelName} .chart`);

            playground.updateStatus('Starting training process...');
            await model.fit(this.tensors.trainFeatures, this.tensors.trainTargets, {
                batchSize: this.BATCH_SIZE,
                epochs: this.NUM_EPOCHS,
                validationSplit: 0.2,
                callbacks: {
                    onEpochEnd: async (epoch, logs) => {
                        await playground.updateModelStatus(
                            `Epoch ${epoch + 1} of ${this.NUM_EPOCHS} completed.`);
                        playground.updateProgress(epoch, this.NUM_EPOCHS);    
                        trainLogs.push(logs);
                        // tfvis.show.history(container, trainLogs, ['loss', 'val_loss'])

                    }
                }
            });

            playground.returnLogs(trainLogs);

            playground.updateStatus('Running on test data...');
            const result = model.evaluate(
                this.tensors.testFeatures, this.tensors.testTargets, { batchSize: this.BATCH_SIZE });
            const testLoss = result.dataSync()[0];

            const trainLoss = trainLogs[trainLogs.length - 1].loss;
            const valLoss = trainLogs[trainLogs.length - 1].val_loss;
            await playground.updateModelStatus(
                `Final train-set loss: ${trainLoss.toFixed(4)}\n` +
                `Final validation-set loss: ${valLoss.toFixed(4)}\n` +
                `Test-set loss: ${testLoss.toFixed(4)}`);
        })();

    },

    /**
     * Builds and returns Multi Layer Perceptron Regression Model
     * with 2 hidden layers, each with 10 units activated by sigmoid.
     *
     * @returns {tf.Sequential} The multi layer perceptron regression mode  l.
     */
    multiLayerPerceptronRegressionModel2Hidden: function () {
        const model = tf.sequential();
        model.add(tf.layers.dense({
            inputShape: [this.numFeatures],
            units: 50,
            activation: 'sigmoid',
            kernelInitializer: 'leCunNormal'
        }));
        model.add(tf.layers.dense(
            { units: 50, activation: 'sigmoid', kernelInitializer: 'leCunNormal' }));
        model.add(tf.layers.dense({ units: 1 }));

        model.summary();
        return model;
    },


    /**
     * Describe the current linear weights for a human to read.
     *
     * @param {Array} kernel Array of floats of length 12.  One value per feature.
     * @returns {List} List of objects, each with a string feature name, and value
     *     feature weight.
     */
    describeKernelElements: function (kernel) {
        tf.util.assert(
            kernel.length == 12,
            `kernel must be a array of length 12, got ${kernel.length}`);
        const outList = [];
        for (let idx = 0; idx < kernel.length; idx++) {
            outList.push({ description: featureDescriptions[idx], value: kernel[idx] });
        }
        return outList;
    },



    // functions to turn Salesforce/JavaScript objects into arrays
    createArrayFromFeatures: function (item) {
        return [
            item.Crime_Rate__c,
            item.Land_Zone_Size__c,
            item.Industrial_Proportion__c,
            item.Next_To_River__c,
            item.Nitric_Oxide_Concentration__c,
            item.Rooms_Per_House__c,
            item.Age_Of_Housing__c,
            item.Distance_To_Commute__c,
            item.Distance_To_Highway__c,
            item.Tax_Rate__c,
            item.School_Class_Size__c,
            item.School_Dropout_Rate__c
        ];
    },

    createArrayFromTarget: function (item) {
        return [
            item.Median_Value__c
        ];
    },

    // Convert loaded data into tensors and creates normalized versions of the
    // features.
    arraysToTensors: function () {
        // console.log(`test features is ${JSON.stringify(this.bostonData.testFeatures)}`);
        // let tester = this.bostonData.testFeatures.map(this.createArrayFromData);
        // let tester = this.bostonData.testFeatures);
        // console.log(`host tester is ${JSON.stringify(tester)}`);
        this.tensors.rawTrainFeatures = tf.tensor2d(this.bostonData.trainFeatures.map(this.createArrayFromFeatures));
        this.tensors.trainTargets = tf.tensor2d(this.bostonData.trainTargets.map(this.createArrayFromTarget));
        this.tensors.rawTestFeatures = tf.tensor2d(this.bostonData.testFeatures.map(this.createArrayFromFeatures));
        this.tensors.testTargets = tf.tensor2d(this.bostonData.testTargets.map(this.createArrayFromTarget));
        // Normalize mean and standard deviation of data.
        let { dataMean, dataStd } =
            this.determineMeanAndStddev(this.tensors.rawTrainFeatures);

        this.tensors.trainFeatures = this.normalizeTensor(
            this.tensors.rawTrainFeatures, dataMean, dataStd);
        this.tensors.testFeatures =
            this.normalizeTensor(this.tensors.rawTestFeatures, dataMean, dataStd);
    },


    // From normalization.js
    /**
     * Calculates the mean and standard deviation of each column of a data array.
     *
     * @param {Tensor2d} data Dataset from which to calculate the mean and
     *                        std of each column independently.
     *
     * @returns {Object} Contains the mean and standard deviation of each vector
     *                   column as 1d tensors.
     */
    determineMeanAndStddev: function (data) {
        const dataMean = data.mean(0);
        // TODO(bileschi): Simplify when and if tf.var / tf.std added to the API.
        const diffFromMean = data.sub(dataMean);
        const squaredDiffFromMean = diffFromMean.square();
        const variance = squaredDiffFromMean.mean(0);
        const dataStd = variance.sqrt();
        return { dataMean, dataStd };
    },

    /**
     * Given expected mean and standard deviation, normalizes a dataset by
     * subtracting the mean and dividing by the standard deviation.
     *
     * @param {Tensor2d} data: Data to normalize. Shape: [batch, numFeatures].
     * @param {Tensor1d} dataMean: Expected mean of the data. Shape [numFeatures].
     * @param {Tensor1d} dataStd: Expected std of the data. Shape [numFeatures]
     *
     * @returns {Tensor2d}: Tensor the same shape as data, but each column
     * normalized to have zero mean and unit standard deviation.
     */
    normalizeTensor: function (data, dataMean, dataStd) {
        return data.sub(dataMean).div(dataStd);
    }

})
