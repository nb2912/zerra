// This is a stub for your Firebase Admin SDK
module.exports = {
  firestore: () => ({
    collection: (name) => ({
      get: async () => {
        console.log(`[FIREBASE] Getting collection: ${name}`);
        return { docs: [] };
      }
    })
  })
};
