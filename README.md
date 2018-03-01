# Lambda Page Rendering using jsdom
----------------------------

Improve page rendering implemented mentioned in [Qiita](http://qiita.com/peg_73_/items/b1d4ed5327f82b049850) Using jsdom.

### Features
- Faster dump speed than using phantomjs
- Supports POST, GET, and possible other types of protocols
- Customizable connection delay time and rendering waiting time


### Installation
```bash
npm install
npm run test
```

### Usage

https://{your_lambda_endpoint}?url={URL_ENCODED}\[&delay={SECOND}\]\[&method={METHOD}\[&dataType={DATA_TYPE}\]\]\[&wait={WAIT_SECOND}\]

- URL_ENCODED: target url using encodeURIComponent(url) or something equivalent

- SECOND: optional, number of seconds allowed for waiting, default value = '5'

- METHOD: optional, currently only support `GET` and `POST`, default value = `GET`

- DATA_TYPE: optional, either `json` or `form`, only available when METHOD=`POST`. default value = `form`

- WAIT_SECOND: optional, time (second) to wait for rendering html, default value = `1`

### Deployment
First pack whole project as zip:
```bash
zip -r lambda.zip jsdomrenderer
```

and create Lambda function:
```bash
export AWS_DEFAULT_REGION=us-east-1
aws lambda create-function \
--region us-east-1 \
--function-name jsdomrenderer \
--zip-file fileb://lambda.zip \
--role role-arn \
--handler jsdomrenderer.lambdaHandler \
--runtime nodejs6.10 \
--profile adminuser
```

For more information, see [CreateFunction](http://docs.aws.amazon.com/cli/latest/reference/lambda/create-function.html). AWS Lambda creates the function and returns function configuration information.

or use cloudformation:

Create new s3bucket
```bash
aws s3 mb s3://bucket-name --region region
```

And get code-uri:
```bash
aws cloudformation package \
   --template-file template.yaml \
   --output-template-file serverless-output.yaml \
   --s3-bucket s3-bucket-name
```

Finally deploy using:
```bash
aws cloudformation deploy \
   --template-file serverless-output.yaml \
   --stack-name new-stack-name \
   --capabilities CAPABILITY_IAM
```

See [Create Serverless Application](http://docs.aws.amazon.com/lambda/latest/dg/serverless-deploy-wt.html) for more information.
