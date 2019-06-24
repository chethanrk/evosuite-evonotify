sap.ui.require(
	[
		"com/evorait/evolite/evonotify/model/formatter"
	],
	function (formatter) {
		"use strict";
 
		QUnit.module("formatter");
 
		function numberUnitValueTestCase(assert, sValue, fExpectedNumber) {
			// Act
			var fNumber = formatter.numberUnit(sValue);
 
			// Assert
			assert.strictEqual(fNumber, fExpectedNumber, "Number unit: The rounding was correct");
		}
		
		function dateValueTestCase(assert, sValue, fExpectedNumber) {
			var fDate = formatter.date(sValue);
			assert.strictEqual(fDate, fExpectedNumber, "Date convert: The date was correct");
		}
		
		function timeValueTestCase(assert, sValue, fExpectedNumber) {
			var fTime = formatter.time(sValue);
			assert.strictEqual(fTime, fExpectedNumber, "Time convert: The time was correct");
		}
 
		QUnit.test("Should round down a 3 digit number", function (assert) {
			numberUnitValueTestCase.call(this, assert, "3.123", "3.12");
		});
 
		QUnit.test("Should round up a 3 digit number", function (assert) {
			numberUnitValueTestCase.call(this, assert, "3.128", "3.13");
		});
 
		QUnit.test("Should round a negative number", function (assert) {
			numberUnitValueTestCase.call(this, assert, "-3", "-3.00");
		});
 
		QUnit.test("Should round an empty string", function (assert) {
			numberUnitValueTestCase.call(this, assert, "", "");
		});
 
		QUnit.test("Should round a zero", function (assert) {
			numberUnitValueTestCase.call(this, assert, "0", "0.00");
		});
		
		QUnit.test("Should give back an empty date string", function(assert){
			dateValueTestCase.call(this, assert, "", "");
		});
		
		QUnit.test("Should convert date to yyyy-MM-dd format", function(assert){
			var oDate = new Date();
			oDate.setYear(2015);
			oDate.setMonth(3);
			oDate.setDate(24);
			dateValueTestCase.call(this, assert, oDate, "2015-04-24");
		});
		
		QUnit.test("Should give back an empty time string", function(assert){
			timeValueTestCase.call(this, assert, "", "");
		});
		
	}
);