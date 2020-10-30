#!/bin/bash

BUCKET_NAME=temp-us-east-1-756298751873

sam package \
  --output-template-file packaged.yaml \
  --s3-bucket ${BUCKET_NAME}