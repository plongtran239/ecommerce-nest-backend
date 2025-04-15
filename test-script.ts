type Variant = {
  value: string;
  options: string[];
};

type SKU = {
  value: string;
  price: number;
  stock: number;
  image: string;
};

function generateSKUs(variants: Variant[]): SKU[] {
  // Hàm hỗ trợ để tạo tất cả tổ hợp
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)), ['']);
  }

  // Lấy mảng các options từ variants
  const options = variants.map((variant) => variant.options);

  // Tạo tất cả tổ hợp
  const combinations = getCombinations(options);

  // Chuyển tổ hợp thành SKU objects
  return combinations.map((value) => ({
    value,
    price: 1,
    stock: 100,
    image: '',
  }));
}

// Ví dụ sử dụng
const variants: Variant[] = [
  {
    value: 'Color',
    options: ['Black', 'Gold'],
  },
  {
    value: 'Storage',
    options: ['256Gb', '512Gb', '1T'],
  },
];

const skus = generateSKUs(variants);
console.log(JSON.stringify(skus));
