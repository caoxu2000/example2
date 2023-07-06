#!/usr/bin/env bash

# Get inputs for test suite - suite name and test list
SUITE_NAME=$1
TEST_LIST=( "$@" )
unset TEST_LIST[0] # Remove first arguement inputed since it will be the suite name and not a test

# Get current time of when the script was ran
printf -v date '%(%Y-%m-%d_%H-%M-%S)T'

SCRIPT_DIR="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_DIR="$( cd "$(dirname $SCRIPT_DIR)/.."; pwd -P )" # Note the Root Dir is pointed to the "IntegrationTests/" folder
LOGS_DIR="$ROOT_DIR/test-wrapper/out/$SUITE_NAME/$date"

# Verify the path of the script exists
if [[ $PATH != *"$SCRIPT_DIR"* ]]; then
    export PATH=$PATH:$SCRIPT_DIR
fi

# Check to see if output directory exists otherwise create it
if [ ! -d $LOGS_DIR ]; then  
    mkdir -p $LOGS_DIR
fi

cd $ROOT_DIR 
for i in "${TEST_LIST[@]}"
do
    if [ -d $LOGS_DIR ]; then
        # Get name of the test file name for outputting the results
        SPEC_NAME="$(basename $i .spec.ts)"
        # Execute the tests and output the results in the jest-junit xml output format
        JEST_JUNIT_SUITE_NAME="{title}" JEST_JUNIT_OUTPUT_DIR=$LOGS_DIR JEST_JUNIT_OUTPUT_NAME=$SPEC_NAME.xml JEST_JUNIT_CLASSNAME="{classname}" JEST_JUNIT_TITLE="{title}" npm test --silent $i 
    fi
done

# Convert the xml output into a html format for easy readability
if [ -d $LOGS_DIR ]; then
    # Combine all individual spec xml output files into combined test suite output
    cd $LOGS_DIR
    grep -vrh testsuites | grep -v \?xml > tmp.xml && sed -i.old '1s;^;<?xml version="1.0" encoding="UTF-8" ?><testsuites>;' tmp.xml && echo "</testsuites>" >> tmp.xml
    
    # Generate the html file
    cd $ROOT_DIR
    node_modules/.bin/xunit-viewer -r $LOGS_DIR/tmp.xml -o $LOGS_DIR/$SUITE_NAME.html -t $SUITE_NAME #-b $ROOT_DIR/test-wrapper/medtronic_logo.jpg
    # Delete the xml file
    rm $LOGS_DIR/tmp.xml && rm $LOGS_DIR/tmp.xml.old
fi

popd > /dev/null
echo "$SUITE_NAME Finished... ";