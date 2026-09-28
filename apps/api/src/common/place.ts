type PlaceInput = {
  provinceId?: string;
  provinceName?: string;
  regencyId?: string;
  regencyName?: string;
  districtId?: string;
  districtName?: string;
  address?: string;
};

function clean(value?: string) {
  const text = value?.trim();
  return text ? text : null;
}

export function placeColumns(input: PlaceInput, partial = false) {
  const columns = {
    provinceId: clean(input.provinceId),
    provinceName: clean(input.provinceName),
    regencyId: clean(input.regencyId),
    regencyName: clean(input.regencyName),
    districtId: clean(input.districtId),
    districtName: clean(input.districtName),
    address: clean(input.address),
  };
  if (!partial) return columns;
  const data: Partial<typeof columns> = {};
  (Object.keys(columns) as (keyof typeof columns)[]).forEach((key) => {
    if (input[key] !== undefined) data[key] = columns[key];
  });
  return data;
}
