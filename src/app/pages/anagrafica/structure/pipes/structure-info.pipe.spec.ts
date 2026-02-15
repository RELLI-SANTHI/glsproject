import { StructureInfoPipe } from './structure-info.pipe';
import { StructureResponse } from '../../../../api/glsNetworkApi/models/structure-response';

// eslint-disable-next-line max-lines-per-function
describe('StructureInfoPipe', () => {
  let pipe: StructureInfoPipe;

  const mockSlide: StructureResponse = {
    id: 1,
    status: 'active',
    icon: 'building',
    fields: [
      { fieldName: 'BuildingType', description: 'Office' },
      { fieldName: 'Name', value: 'Acme Corp' },
      { fieldName: 'Region', description: 'North' }
    ]
  };

  beforeEach(() => {
    pipe = new StructureInfoPipe();
  });

  it('create an instance', () => {
    const pipe = new StructureInfoPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return joined values from description or value', () => {
    const result = pipe.transform(mockSlide);
    expect(result).toBe('Office | Acme Corp | North');
  });

  it('should skip missing fields', () => {
    const mockWithMissingFields: StructureResponse = {
      id: 2,
      status: 'inactive',
      icon: 'warehouse',
      fields: [
        { fieldName: 'BuildingType', description: 'Warehouse' },
        { fieldName: 'Region', description: 'South' }
      ]
    };
    const result = pipe.transform(mockWithMissingFields);
    expect(result).toBe('Warehouse | South');
  });

  it('should return empty string if fields are missing', () => {
    const result = pipe.transform({
      icon: '',
      id: 1,
      status: '',
      fields: []
    });
    expect(result).toBe('');
  });

  it('should return empty string if slide is null', () => {
    const result = pipe.transform(null as any);
    expect(result).toBe('');
  });
});
