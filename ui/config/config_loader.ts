import '../../resources/defaults.css';
import './config.css';
import UserConfig from '../../resources/user_config';

import { CactbotConfigurator } from './config';
import defaultOptions from './config_options';

UserConfig.getUserConfigLocation('config', defaultOptions, () => {
  const options = { ...defaultOptions };
  new CactbotConfigurator(
    options,
    UserConfig.savedConfig,
  );
});
