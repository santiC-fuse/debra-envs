import dotenv from "dotenv";
import AWS from "aws-sdk";
dotenv.config("../.env");

const envNameToFileName = (env) => {
  if (!env)
    throw new Error(
      "Cannot convert environment name to file name, environment parameter needed"
    );
  return `upfront-${env}.env`;
};

const checkEnvVariableExistAndUse = (variableName, defaultValue) => {
  if (!process.env[variableName] && !defaultValue)
    throw new Error(`Bad request. No ${variableName} env variable found.`);
  return process.env[variableName] || defaultValue;
};

const s3download = async (params) => {
  const s3 = new AWS.S3({
    accessKeyId: checkEnvVariableExistAndUse("AWS_ACCESS_KEY_ID"),
    secretAccessKey: checkEnvVariableExistAndUse("AWS_SECRET_ACCESS_KEY"),
  });
  const data = await s3.getObject(params).promise();

  return data.Body.toString("utf-8");
};

const getEnvVars = async (env) => {
  if (!env) throw new Error("Environment parameter needed");
  const file = envNameToFileName(env);
  const params = {
    Bucket: checkEnvVariableExistAndUse("AWS_BUCKET_NAME"),
    Key: file,
  };
  try {
    const s3obj = await s3download(params);
    console.log(s3obj);
  } catch (e) {
    console.error(`Env vars for ${env} not found in ${params.Bucket}`);
  }
};
const envParam = process.argv[2];
await getEnvVars(envParam);
