
export default {
  models: [
    {
      name: 'GetProductsListResponse',
      description: 'GET Products list response model',
      contentType: 'application/json',
      schema: {
        '$schema': 'http://json-schema.org/draft-04/schema#',
        properties: {
          SomeObject: {
            "type": "object",
            "properties": {
              "count": {
                "type": "number"
              },
              "description": {
                "type": "string"
              },
              "id": {
                "type": "string"
              },
              "price": {
                "type": "number"
              },
              "title": {
                "type": "string"
              }
            }
          }
        }
      }
    }
  ]
}
