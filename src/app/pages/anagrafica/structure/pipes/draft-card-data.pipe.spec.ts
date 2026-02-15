import { DraftCardDataPipe } from './draft-card-data.pipe';

describe('DraftCardDataPipe', () => {
  let pipe: DraftCardDataPipe;

  beforeEach(() => {
    pipe = new DraftCardDataPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the value for a matching fieldName', () => {
    const slide = { fields: [{ fieldName: 'foo', value: 'bar' }] };
    expect(pipe.transform(slide, 'foo')).toBe('bar');
  });

  it('should return undefined if no field matches', () => {
    const slide = { fields: [{ fieldName: 'foo', value: 'bar' }] };
    expect(pipe.transform(slide, 'baz')).toBeUndefined();
  });

  it('should return the value of the first matching key in array', () => {
    const slide = {
      fields: [
        { fieldName: 'a', value: '1' },
        { fieldName: 'b', value: '2' }
      ]
    };
    expect(pipe.transform(slide, ['x', 'b', 'a'])).toBe('2');
  });

  it('should return undefined if fields is missing', () => {
    expect(pipe.transform({} as any, 'foo')).toBeUndefined();
  });

  it('should return undefined if fields is empty', () => {
    expect(pipe.transform({ fields: [] }, 'foo')).toBeUndefined();
  });

  it('should skip fields without value', () => {
    const slide = {
      fields: [
        { fieldName: 'foo', value: '' },
        { fieldName: 'bar', value: 'baz' }
      ]
    };
    expect(pipe.transform(slide, ['foo', 'bar'])).toBe('baz');
  });
});
