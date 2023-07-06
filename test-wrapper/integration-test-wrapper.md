# Integration Test Wrapper Inforamtion

## Description
This document will contain information on how to create new Test Suites and Services Test Suites.

## Creating new Test Suites

Copy an existing test suite *NOTE: do not copy test-suite.sh*, rename it and add it to the folder test-wrapper/test-suites. The following will have to be updated. <br>
* SUITE_NAME - variable for the name of the new test suite.
* TEST_LIST - is the list that conatins path to the spec files for the test suite.

## How to Run
From the command line once in the type the command ./test-wrapper/test-suites/run_xxxTestSuite.sh *NOTE: do not run test-suite.sh here*

## Test Outputs
Logs will be ouputed in the generated folder at test-wrapper/out/TEST_SUITE_NAME/DATE_RAN. The name of the test suite and the time that it was ran at will be created by the test suite runner. The combined test results from each spec file will be formated in an .html format for easy readability.