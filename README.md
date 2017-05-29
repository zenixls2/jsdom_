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
