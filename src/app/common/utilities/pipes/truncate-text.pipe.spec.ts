import { TruncateTextPipe } from './truncate-text.pipe';

// eslint-disable-next-line max-lines-per-function
describe('TruncateTextPipe', () => {
  let pipe: TruncateTextPipe;

  beforeEach(() => {
    pipe = new TruncateTextPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should truncate text longer than maxLength and add ellipsis', () => {
    const result = pipe.transform('This is a long filename', 10);
    expect(result).toBe('This is a ...');
  });

  it('should return the same text if length is equal to maxLength', () => {
    const result = pipe.transform('ExactLength', 11);
    expect(result).toBe('ExactLength');
  });

  it('should return the same text if length is less than maxLength', () => {
    const result = pipe.transform('Short', 10);
    expect(result).toBe('Short');
  });

  it('should return empty string if input is empty', () => {
    const result = pipe.transform('', 5);
    expect(result).toBe('');
  });

  it('should return ellipsis only if maxLength is 0', () => {
    const result = pipe.transform('Some text', 0);
    expect(result).toBe('...');
  });

  it('should return ellipsis only if maxLength is negative', () => {
    const result = pipe.transform('Some text', -5);
    expect(result).toBe('...');
  });
});
