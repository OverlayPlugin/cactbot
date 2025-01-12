declare module 'raidboss.manifest' {
  const raidbossFileData: import('./trigger').RaidbossFileData;
  export default raidbossFileData;
}

declare module 'oopsy.manifest' {
  const oopsyFileData: import('./oopsy').OopsyFileData;
  export default oopsyFileData;
}
