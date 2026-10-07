import {Injectable} from '@angular/core';
import {globalAppConfig} from "../../environments/global-app-config";
import {AppConfig} from "../shared/model/app-config.model";
import appConfig from '../config/appConfig.json';

// The configuration is compiled into the application bundle, whose name changes with its content, so
// no browser can pair a cached copy of it with a different build.
@Injectable()
export class AppConfigService {

  init() {
    globalAppConfig.init(Object.assign(new AppConfig(), appConfig));
  }

}
