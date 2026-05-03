const supabase = require("../services/supabase");

module.exports = async (req, res) => {
  const { data, error } = await supabase.from("profiles").select("*");
  res.json({
    message: "Hello from Zerra! Supabase is ready.",
    profiles: data,
    error: error
  });
};
