({
    handleGetVersion : function(component, event, helper) {
        var version = tf.version.tfjs;
        console.log('aura - handleGetVersion, version is ' + version);
        console.log('message is ' + event.getParam('message'));
        console.log('Trying to find, ' + component.find('playground'));
        component.find('playground').receiveVersion(version);
    }
})
