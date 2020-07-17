({

    scriptsLoaded : function(component, event, helper) {
        console.log('scripts loaded');
        let tfVersion = 'N/A';
        try {
            tfVersion = tf.version.tfjs;
        } catch (error) {
            console.log(`Error loading tf, ${error}`);
        }
        component.find('playground').returnTfVersion(tfVersion);

        let ml5Version = 'N/A';
        try {
            ml5Version = ml5.version;
        } catch (error) {
            console.log(`Error loading ml5, ${error}`);
        }
        component.find('playground').returnMl5Version(ml5Version);
    },

    handleGetTfVersion : function(component, event, helper) {
        const version = tf ? tf.version.tfjs : 'pending';
        console.log('aura - handleTfGetVersion, version is ' + version);
        console.log('message is ' + event.getParam('message'));
        console.log('Trying to find, ' + component.find('playground'));
        component.find('playground').returnTfVersion(version);
    },

    handleGetMl5Version : function(component, event, helper) {
        const version = ml5 ? ml5.version : 'pending';
        console.log('aura - handleMl5GetVersion, version is ' + version);
        console.log('message is ' + event.getParam('message'));
        console.log('Trying to find, ' + component.find('playground'));
        component.find('playground').returnMl5Version(version);
    }


})
