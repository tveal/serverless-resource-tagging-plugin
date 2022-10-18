const { expect, it, describe } = require('@jest/globals');
const {
  isLevelEnabled,
} = require('../../../lib/logLevels');

describe('lib/logLevels', () => {
  describe('isLevelEnabled', () => {
    it('should default to INFO level', () => {
      expect(isLevelEnabled(undefined, 'ERROR')).toBe(true);
      expect(isLevelEnabled(undefined, 'WARN')).toBe(true);
      expect(isLevelEnabled(undefined, 'INFO')).toBe(true);
      expect(isLevelEnabled(undefined, 'DEBUG')).toBe(false);
    });
    it('should be ERROR level with lowercase configuredLevel', () => {
      expect(isLevelEnabled('error', 'ERROR')).toBe(true);
      expect(isLevelEnabled('error', 'WARN')).toBe(false);
      expect(isLevelEnabled('error', 'INFO')).toBe(false);
      expect(isLevelEnabled('error', 'DEBUG')).toBe(false);
    });
    it('should be DEBUG level with mixed case configuredLevel', () => {
      expect(isLevelEnabled('dEbUG', 'ERROR')).toBe(true);
      expect(isLevelEnabled('dEbUG', 'WARN')).toBe(true);
      expect(isLevelEnabled('dEbUG', 'INFO')).toBe(true);
      expect(isLevelEnabled('dEbUG', 'DEBUG')).toBe(true);
    });
    it('should be WARN level', () => {
      expect(isLevelEnabled('WARN', 'ERROR')).toBe(true);
      expect(isLevelEnabled('WARN', 'WARN')).toBe(true);
      expect(isLevelEnabled('WARN', 'INFO')).toBe(false);
      expect(isLevelEnabled('WARN', 'DEBUG')).toBe(false);
    });
  });
});