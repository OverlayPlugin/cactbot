export const logLevels = [
  ['alert', 'ALERTS: issues that probably require action (RECOMMENDED)'],
  ['info', 'INFO: more routine/known issues that may not require action'],
  ['debug', 'DEBUG: detailed output for troubleshooting'],
  ['silent', 'SILENT: success & fatal errors only (not recommended)'],
] as const;

export type LogLevelKey = typeof logLevels[number][0];
export type LogLevelLabel = typeof logLevels[number][1];

const logLevelDefault: LogLevelKey = 'alert';
type LogLevelMap = { [K in LogLevelKey]: 0 | 1 | 2 | 3 };

export class ConsoleLogger {
  public static readonly logLevelDefault: LogLevelKey = 'alert';

  // assign numerical values to log levels so we can do a quick compare
  // in deciding whether a user wants to see that type of log output
  logLevelMap: LogLevelMap = {
    silent: 0,
    alert: 1,
    info: 2,
    debug: 3,
  };
  myLogLevel: LogLevelMap[LogLevelKey];

  setLogLevel(logLevel?: LogLevelKey): void {
    // class is initialized in scripts outside of all constructs,
    // so it doesn't need to be passed to every function
    // this happens before the default function is called
    // with the user's log level choice.
    if (logLevel === undefined)
      return;
    if (!Object.keys(this.logLevelMap).includes(logLevel))
      this.fatalError(`Invalid log level (${logLevel}) is set.`);
    this.myLogLevel = this.logLevelMap[logLevel];
    this.debug(`Log level set: ${logLevel}`);
  }

  constructor(userLogLevelKey?: LogLevelKey) {
    this.myLogLevel = this.logLevelMap[logLevelDefault]; // needs to be initialized first
    this.setLogLevel(userLogLevelKey);
  }

  alert(msg: string): void {
    if (this.myLogLevel >= this.logLevelMap.alert)
      console.log(`Alert: ${msg}`);
  }

  info(msg: string): void {
    if (this.myLogLevel >= this.logLevelMap.info)
      console.log(`Info: ${msg}`);
  }

  debug(msg: string): void {
    if (this.myLogLevel >= this.logLevelMap.debug)
      console.log(`Debug: ${msg}`);
  }

  successDone(msg: string): void {
    console.log(`Success: ${msg}`);
  }

  nonFatalError(msg: string): void {
    console.log(`ERROR: ${msg}`);
  }

  fatalError(msg: string): void {
    console.log(`ERROR: ${msg} Exiting...`);
    process.exit(1);
  }

  printNoHeader(msg: string): void {
    console.log(`${msg}`);
  }
}
