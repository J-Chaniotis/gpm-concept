'use strict';
/*globals d3, nv, Benchmark, saveAs*/
(function () {

  /*
  Chart rendering mumbo-jumbos
  */
  var render = (function () {
    nv.dev = false;
    var chart = null;

    var init = function (data) {
      nv.addGraph(function () {
        chart = nv.models.lineChart()
          .margin({
            left: 100
          })
          .useInteractiveGuideline(true)
          .transitionDuration(350)
          .showLegend(true)
          .showYAxis(true)
          .showXAxis(true);

        chart.xAxis //Chart x-axis settings
        .axisLabel('Parallelism')
          .tickFormat(d3.format(',r'));

        chart.yAxis //Chart y-axis settings
        .axisLabel('Operations/sec')
          .tickFormat(d3.format('.02f'));
        // Y will start from 0
        chart.forceY(0);


        d3.select('#chart svg') //Select the <svg> element you want to render the chart in.   
        .datum(data) //Populate the <svg> element with chart data...
        .call(chart); //Finally, render the chart!

        nv.utils.windowResize(chart.update);

        return chart;
      });
    };

    return function (data) {

      if (!chart) {
        return init(data);
      }
      d3.select('#chart svg')
        .datum(data)
        .call(chart);
    };

  })();


  /*
  Benchmark core function
  @param testFn {Promise} The test to be benchmarked
  @param load {Int} The concurrency level
  @param samples {Int} How many times each function will be run
  @return {Benchmark} Configured benchmark instance, ready to run
  */
  var benchmarkFactory = function (testFn, load, samples) {
    return new Benchmark({
      minSamples: samples,
      defer: true,
      async: true,
      name: load,
      fn: function (deferred) {
        testFn(load, function () {
          deferred.resolve();
        });
      }
    });
  };

  /*
  Increment test load
  @param testFn {Function} The test to be benchmarked
  @param config {Object}
    loadMin: {Int} The initial concurrency level,
    loadStep: {Int} Increase concurrency by that amount after each iteration
    loadMax: {Int} Stop at this concurrency,
    samples: {Int} How many times each test function will be run
  @return {Suite} Configured suite of Benchmark objects, ready to run
  */
  var suiteFactory = function (testFn, config) {
    var suite = new Benchmark.Suite();

    var steps = Math.min((config.loadMax - config.loadMin) / config.loadStep);
    var i = 0;
    var load;

    for (i; i <= steps; i += 1) {
      load = (i * config.loadStep) + config.loadMin;
      suite.push(benchmarkFactory(testFn, load, config.samples));
    }

    return suite;
  };

  var warmup = function (testFn, done) {

    /*
      Some arbitrary warmup configuration
      */
    var warmupConf = {
      loadMin: 20,
      loadStep: 10,
      loadMax: 40,
      samples: 1
    };
    /*
      Warmup is actually a test suite executed before each test
      */
    var warmupSuite = suiteFactory(testFn, warmupConf);
    warmupSuite.on('start', function () {
      console.log('Warming up');
    });
    warmupSuite.on('cycle', function () {
      console.log('...');
    });
    warmupSuite.on('error', function (e) {
      console.error(e);
    });
    warmupSuite.on('complete', done);
    warmupSuite.run();

  };


  /*
  High level test function. Warmup, run the test and plot the results dynamically
  @param testFn {Promise} The test to be benchmarked
  @param loadConf {Object} Load configuration, see 'suiteFactory'
  @param chartConf {Object} The chart configuration
    color: {String} Line color in hex
    key: {String} Line identifier
  */
  var testFactory = function (testFn, loadConf, chartConf) {
    // Add the array with values internally
    chartConf.values = [];

    return function (chartData) {
      return new Promise(function (resolve) {
        /*
        Initialize the test suite
        */
        var suite = suiteFactory(testFn, loadConf);
        suite.on('start', function () {
          chartData.push(chartConf);
        });
        /*
        Render the results on each cycle
        */
        suite.on('cycle', function (results) {
          chartData[chartData.length - 1].values.push({
            x: results.target.name,
            y: results.target.hz
          });
          /*
          Render after 2 values are taken, otherwise chart breaks
          */
          if (chartData[chartData.length - 1].values.length > 1) {
            render(chartData);
          }
        });
        /*
        Pass the chart data so as to be used for the next test
        */
        suite.on('complete', function () {
          resolve(chartData);
        });
        suite.on('error', function (e) {
          console.error(e);
        });
        /*
        Link warmup with the test
        */
        warmup(testFn, function () {
          console.log('Testing...');
          suite.run();
        });
      });

    };
  };



  var download = function (data) {
    var json = JSON.stringify(data);
    var blob = new Blob([json], {
      type: "application/json"
    });
    saveAs(blob, Benchmark.platform.description + '.json');
  };

  var save = function (data) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/save', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
          resolve(xhr.response);
        } else {
          reject(status);
        }
      };
      xhr.send(JSON.stringify(data));
    });
  };



  /*
  make sure .app namespace if free and export methods
  */
  if (window.app) {
    throw new Error('.app namespace is occupied');
  }

  window.app = {
    render: render,
    testFactory: testFactory,
    download: download,
    save: save
  };


})();