'use strict';

/*globals app, testFns*/

(function () {

    
     var config = {
        loadMin: 10, // Start at this load
        loadStep: 10, // Increment load after each test
        loadMax: 500, // Stop at this load
        samples: 10  // Number of samples (more samples => less noise)
    };
     
    
    var cbTest = app.testFactory(testFns.cbTest, config, {
        key: 'Callbacks',
        color: '#58a075'
    });

    var qTest = app.testFactory(testFns.qPromise, config, {
        key: 'Q',
        color: '#ff6666'
    });

    var rsvpTest = app.testFactory(testFns.rsvpPromise, config, {
        key: 'RSVP',
        color: '#cccc33'
    });

    var nativeTest = app.testFactory(testFns.nativePromise, config, {
        key: 'Native',
        color: '#9999ff'
    });

    cbTest([]).then(qTest).then(rsvpTest).then(nativeTest).then(function (results) {
        app.download(results);
        app.save({
            name: 'results.json',
            data: results
        });
    });


})();