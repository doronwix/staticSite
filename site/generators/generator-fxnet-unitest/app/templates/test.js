/**********************************************************************************************/
/** test objective: */
/** test object: */
/** 
/** instructions and disclaimers: 
        1) currently our tests should not rely on UI behaviours meaning no depedency on dom elements 
        2) we should not rely on content VM loader, use deps in pluginconfiguration
        3) minify our overuse of custom/test/mock files, use sinon on the real object instead
        4) take a look on require-config.js and understand the configuration for tests
        5) do not add new script tags in the html file, use require to get all the objects - this is promoting our clear dependecy tree     
        6) avoid using requireModules.js, all dependencies can be resolved without this file
        7) diffefent version of the same file ( for example a mock file vs a the real file) can be switched using the require map config)                                                                          */
/**********************************************************************************************/
define(
	[
        'require',
        'qunit', 
        'sinon',
        'Q',
        '<%= testSource %>'
	],
    function (require) {
        let qunit = require('qunit'),
            sinon = require('sinon'),
            Q = require('Q'),
            testObject =  require('<%= testSource %>');

        window.Q = Q;

        qunit.start();
        
        let sandBox = sinon.createSandbox();

        qunit.module("set/dispose",
		{
            beforeEach: function () {
                this.xhr = sandBox.useFakeXMLHttpRequest();
                var requests = this.requests = [];

                this.xhr.onCreate = function (xhr) {
                    requests.push(xhr);
                };             
		    },
            afterEach: function () {
                this.xhr.restore();   
                sandBox.restore()          
		    }
        });
        
        
        qunit.test("test test", function (assert) {
            //arrange, first time failure, please implement
            let spy = sandBox.spy(testObject)
            //act
            //assert
            assert.equal(spy.called, true, "All is working well");
        });

        

	});