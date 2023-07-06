#!/usr/bin/env bash

# Test Suite Name - Used for output directory name and title name in html output
SUITE_NAME="ExampleTestSuite1"

# Test List
TEST_LIST=( 
    __tests__/auth_service/local.spec.ts 
    __tests__/auth_service/privilege-check.spec.ts 
)

# Get the relative path to where the script was called
SCRIPT_DIR="$( cd "$(dirname "$0")" ; pwd -P )"

# Run the generic test runner with the supplied suite name and test listl
$SCRIPT_DIR/test-suite.sh $SUITE_NAME ${TEST_LIST[@]}