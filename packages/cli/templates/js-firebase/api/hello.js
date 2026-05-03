const firebase = require("../services/firebase");

module.exports = async (req, res) => {
  const snapshot = await firebase.firestore().collection("users").get();
  res.json({
    message: "Hello from Zerra! Firebase is ready.",
    userCount: snapshot.docs.length
  });
};
