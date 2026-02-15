import { FilterPipe } from './filter.pipe';

describe('FilterPipe', () => {
  let pipe: FilterPipe;

  beforeEach(() => {
    pipe = new FilterPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty array if items is null', () => {
    expect(pipe.transform(null as any, 'test')).toEqual([]);
  });

  it('should return all items if searchText is empty', () => {
    const items = ['Apple', 'Banana', 'Cherry'];
    expect(pipe.transform(items, '')).toEqual(items);
  });

  it('should filter items by searchText (case-insensitive)', () => {
    const items = ['Apple', 'Banana', 'Cherry'];
    expect(pipe.transform(items, 'an')).toEqual(['Banana']);
    expect(pipe.transform(items, 'CH')).toEqual(['Cherry']);
  });

  it('should return empty array if no items match', () => {
    const items = ['Apple', 'Banana', 'Cherry'];
    expect(pipe.transform(items, 'xyz')).toEqual([]);
  });
});
