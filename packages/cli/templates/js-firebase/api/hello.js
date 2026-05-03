const firebase = require("../services/firebase");

module.exports = async (req, res) => {
  const snapshot = await firebase.firestore().collection("users").get();
  res.end(`Hello from Zerra! Firebase is ready. Found ${snapshot.docs.length} users.`);
};
