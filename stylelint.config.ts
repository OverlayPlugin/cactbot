import { type Config } from 'stylelint';

const config: Config = {
  extends: 'stylelint-config-standard',
  rules: {
    // @TODO: Disabled these rules as part of the stylelint update. Make sure that none
    // of them cause problems with CEF 95, until OverlayPlugin is updated to a newer CEF.
    'property-no-deprecated': null,
    'color-function-alias-notation': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'declaration-property-value-no-unknown': null,
    'media-feature-range-notation': null,
    'declaration-block-no-shorthand-property-overrides': null,
    'selector-not-notation': null,
  },
};

export default config;
