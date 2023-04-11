import { getProductsById } from "./getProductsById";

describe('getProductsById lambda', () => {
  it('should return specific product with 200 status code', async () => {
    const expected = {
      product: {
        count: 4,
        description: "Short Product Description1",
        id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
        price: 2.4,
        title: "ProductOne"
      }
    };
    const eventMock: any = { pathParameters: { productId: '7567ec4b-b10c-48c5-9345-fc73c48a80aa' } };
    const response: any = await getProductsById(eventMock, null, null);
    expect(response?.body).toBe(JSON.stringify(expected));
    expect(response.statusCode).toBe(200);
  });

  it('should return 404 status code if there is no product with specified id', async () => {
    const eventMock: any = { pathParameters: { productId: '7567ec4b-0000-48c5-9345-fc73c48a80aa' } };
    const response: any = await getProductsById(eventMock, null, null);
    expect(response.statusCode).toBe(404);
  });
});
