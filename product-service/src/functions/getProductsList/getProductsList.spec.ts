import { getProductsList } from "./getProductsList";

describe('getProductsList lambda', () => {
  it('should return list of products', async () => {
    const response: any = await getProductsList(null, null, null);
    const result = JSON.parse(response?.body);
    expect(Array.isArray(result)).toBeTruthy();
  });
});
