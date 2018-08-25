import { linearScale } from './utils';

const equalDomain = [10, 10];
const equalRange = [10, 10];
const clamp = true;
const domain = [1, 2];
const range = [3, 4];
const value = 10;

describe('Utils', () => {
  describe('linearScale()', () => {
    it('should work', () => {
      expect(linearScale()).not.toBeNull();
      expect(linearScale).toBeInstanceOf(Function);
    });
    it('should clamp for equal domains', () => {
      const closure = linearScale(equalDomain, range, clamp);
      expect(closure(value)).toEqual(range[0]);
    });
    it('should clamp for equal ranges', () => {
      const closure = linearScale(domain, equalRange, clamp);
      expect(closure(value)).toEqual(equalRange[0]);
    });
    it('should clamp, branch out of `if` block', () => {
      const closure = linearScale(domain, range, clamp);
      expect(closure(value)).toEqual(range[1]);
    });
    it('should not clamp, for equal domains', () => {
      const closure = linearScale(equalDomain, range);
      expect(closure(value)).toEqual(range[0]);
    });
    it('should not clamp, for equal range', () => {
      const closure = linearScale(domain, equalRange);
      expect(closure(value)).toEqual(equalRange[0]);
    });
    it('should not clamp, branch out of `if` block', () => {
      const closure = linearScale(domain, range);
      expect(closure(value)).toEqual(12);
    });
  });
});
