#!/usr/bin/env bash

set -e

cp -R node_modules tracker-add-item/node_modules
cp -R node_modules tracker-update-snapshots/node_modules
cp -R node_modules tracker-weekly-summary/node_modules

cd tracker-add-item
zip -r -q ../composerTrackerStoreAdd.zip thrift/ *.js node_modules/ package.json
cd ../tracker-update-snapshots
zip -r -q ../composerTrackerUpdateSnapshots.zip *.js node_modules/ package.json
cd ../tracker-weekly-summary
zip -r -q ../composerTrackerWeeklySummary.zip *.js node_modules/ package.json
cd ..

rm -R tracker-add-item/node_modules
rm -R tracker-update-snapshots/node_modules
rm -R tracker-weekly-summary/node_modules

aws s3 cp composerTrackerStoreAdd.zip s3://lambda-dist-cross-stream/composer-tracker-store/composerTrackerStoreAdd.zip --profile composer
aws s3 cp composerTrackerUpdateSnapshots.zip s3://lambda-dist-cross-stream/composer-tracker-store/composerTrackerUpdateSnapshots.zip --profile composer
aws s3 cp composerTrackerWeeklySummary.zip s3://lambda-dist-cross-stream/composer-tracker-store/composerTrackerWeeklySummary.zip --profile composer

aws lambda update-function-code --function-name TrackerDataStore-TrackerDataStoreAddDataLambdas-124JIJJ7ARUU9 --s3-bucket lambda-dist-cross-stream --s3-key composer-tracker-store/composerTrackerStoreAdd.zip --profile composer
aws lambda update-function-code --function-name TrackerDataStore-TrackerDataStoreUpdateSnapshots-E7DDRJ5YCIED --s3-bucket lambda-dist-cross-stream --s3-key composer-tracker-store/composerTrackerUpdateSnapshots.zip --profile composer
aws lambda update-function-code --function-name TrackerDataStore-TrackerDataStoreWeeklySnapshot-19JG23LK4N8IV --s3-bucket lambda-dist-cross-stream --s3-key composer-tracker-store/composerTrackerWeeklySummary.zip --profile composer

rm composerTrackerStoreAdd.zip
rm composerTrackerUpdateSnapshots.zip
rm composerTrackerWeeklySummary.zip
