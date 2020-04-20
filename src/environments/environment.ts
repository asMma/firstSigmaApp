// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
   neo4jConfig : {
    url: 'bolt://localhost:7687',
    user: 'admin',
    password: 'admin',
    driver: {
      // all the driver configuration (optional)
    }
  },
  neo4jStyle : {
    nodes: { // Map of label
      NETWORK: {
        color: '#ff0066', // Color of the node
        size: 50, // Size of the node
      },
      APPLICATION: {
        color: '#0000ff', 
        size: 50,
      },
      AGENCE: {
        color: '#8000ff', 
        size: 50,
      },
      COLLABORATEUR: {
        color: '#d0d0e1', 
        size: 50,
      }
    },
    edges: {
      color: '#d9d9d9',
      size: 1,
    }
  }
};
