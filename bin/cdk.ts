#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ZurichHackathonStack } from '../lib/zurich-hackathon-stack';

const app = new cdk.App();
  new ZurichHackathonStack(app, 'zurich-hackathon-stack', {
});