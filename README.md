
# Api Gateway -> Lambda (Send Email) -> SES (Simple Email Service)

## Description

This is a serverless component consisting of:

- an Api Gateway with a POST `/send` endpoint, that requires three parameters:

  - `toEmails`, Array of strings, that represent all the emails you want to send an email to,
  - `subject`, a string representing the subject of the email
  - `message`, a string representing the message of the email, can be either HTML or regular text
  It also accepts two optional ones: `ccEmails` and `replyToEmails`, both of Array of strings type.

- a Lambda that sends an email to one or more specified email addresses. Also, depending if the `message` is in a Text or HTML format, it will send it in either of those formats. The `toEmails`,`ccEmails`, and `replyToEmails` parameters must be of Array type.

It's a Nuts & Bolts application component for AWS Serverless Application Repository.

## Github Action Parameters

To deploy to AWS from a github action, override the default values using repository variables.
  - `NODE_VERSION`, default 22.x. See supported Node.js release schedule at https://nodejs.org/en/about/releases/
  - `AWS-REGION`, default us-east-1
  - `STACK-NAME`, default lambda-send-email
  - `S3-BUCKET`, create a bucket and set this name to match

## Deployment Parameters

This component has two CloudFormation deployment parameters:

- `FromEmail`, a required parameter, represents the email sender. Must be a SES verified email. If you attempt to send email using a non-verified address or domain, the operation results in an "Email address not verified" error.
- `CorsOrigin`, an optional parameter, where you can restrict access to only specified domains.

## Release - 1.1.0

 - Upgrade to Node.js 12.x LTS

## Fork and Release - 2.0.0

 - Upgrade to Node.js 22.x

