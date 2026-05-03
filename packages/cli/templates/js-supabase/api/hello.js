const supabase = require("../services/supabase");

module.exports = async (req, res) => {
  const { data, error } = await supabase.from("profiles").select("*");
  res.end(`Hello from Zerra! Supabase is ready. Found ${data.length} profiles.`);
};
