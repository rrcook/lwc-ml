# Using TensorFlow.js inside Salesforce for machine learning

This project was developed to answer a question I had; can you run TensorFlow.js as part of Salesforce's Lightning Experience, specifically in Lightning Web Components. 
TensorFlow.js allows you to run machine learning and deep neural network jobs in your browser. Through WebGL it can access the GPU through your browser, so you have the full power of your CPU and GPU to process jobs. Also, data is kept local, not sent off to an external site, making it better for privacy reasons.
So can you use TensorFlow.js in a Salesforce environment, using data from your org? It turns out the answer is "Yes, but..."

The [Lightning Web Components Recipes project](https://github.com/trailheadapps/lwc-recipes) shows how to load third-party libraries, such as d3.js, but the restriction is that the libraries need to be compatible with the Salesforce Locker Service. Large, complicated libraries, such as [TensorFlow.js](https://github.com/tensorflow/tfjs) and [ML5.js](https://github.com/ml5js/ml5-library) aren't compatible, and are, frankly, too much work to winnow them down to a point where they can be compliant.

There is, however, a way around this restriction. A hack or trick if you will. A Lightning Web Component can be nested inside an older-style Aura component, and the Aura component can still have the apiVersion set to 39.0, the last version before Locker Service was enforced. 

##  Impressive and Unfortunate

Here, all the communication with Salesforce, and user interface, is done with a modern LWC to take advantage of the latest techniques, but the LWC is nested inside an Aura component. The Aura component has no UI; it only loads the large, noncompliant JS libraries it will use, and has code that uses the libraries. The LWC sends data through custom events up to the Aura component, which kicks off code to run. Any results for the UI are sent back down to the LWC through @api decorated public methods. When I described this technique a fellow member of the Good Day Sir slack channel called it "impressive and unfortunate", and I'll own that.

## The TensorFlow.js project - Machine learning on the Boston Housing dataset

To prove the concept I used a common example project for TensorFlow.js, a linear regression-type problem using the Boston Housing dataset. The TensorFlow code is adapted from [The TensorFlow.js example code](https://github.com/tensorflow/tfjs-examples/tree/master/boston-housing). The code was brought to my attention from reading [Manning's "Deep Learning with JavaScript"](https://www.manning.com/books/deep-learning-with-javascript?query=deep%20learning%20with%20j).

### TODOs

This is a "Minimum Viable Product" - it shows the concepts needed to use TensorFlow.js in a Salesforce context with Salesforce data, but it could use more polish.

Added will be
+ More comments where needed to explain what's going on
+ More UI elements using LWCs
+ If possible, import and display the chart that the TensorFlow code produces
+ Another project using the ML5 machine learning library

