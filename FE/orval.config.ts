import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: 'http://localhost:3000/api-json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/api/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      baseUrl: 'http://localhost:3000',
      override: {
        mutator: {
          path: 'src/api/custom-fetch.ts',
          name: 'customInstance',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
