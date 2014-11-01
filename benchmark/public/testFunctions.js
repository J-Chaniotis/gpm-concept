'use strict';
/*globals Q, RSVP*/

/*
Sandbox everything in a self invoked function
*/
(function () {

    /*
    Generate concurrent load
    @param Prom {Promise} The promise implementation to be tested
    @return {Function} The test case bound with the given promise implementation
    */
    var promiseTestFactory = function (Prom) {
        return function (load, done) {
            var p = [];
            var l = load;
            while (l--) {
                p.push(new Prom(function (resolve) {
                    return setImmediate(resolve);
                }));
            }
            Prom.all(p).then(done);
        };
    };

    /*
    Generate concurrent load with callbacks
    @param load {Int}
    @param done {Function}
    */
    var cbTest = function (load, done) {
        var resolved = 0;
        var launch = function () {
            resolved += 1;
            if (resolved === load) {
                return done();
            }
        };
        var l = load;
        while (l--) {
            setImmediate(launch);
        }
    };

    /*
    Check global namespace
    */
    if (window.testFns) {
        throw new Error('.testFns namespace is occupied');
    }

    /*
    Export functions
    */
    window.testFns = {
        nativePromise: promiseTestFactory(Promise),
        qPromise: promiseTestFactory(Q.Promise),
        rsvpPromise: promiseTestFactory(RSVP.Promise),
        cbTest: cbTest
    };
})();