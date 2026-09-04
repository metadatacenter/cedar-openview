// This file is required by karma.conf.js. The builder discovers the .spec files
// itself; `require.context` was webpack's and is no longer available to it.

import 'zone.js/testing';
import {getTestBed} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
