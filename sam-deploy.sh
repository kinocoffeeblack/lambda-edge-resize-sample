#!/bin/bash

sam deploy \
    --template-file packaged.yaml \
    --stack-name cf-img-optimizer-sample \
    --region us-east-1 \
    --capabilities CAPABILITY_NAMED_IAM

