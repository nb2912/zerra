// This is a stub for your Supabase client
module.exports = {
  from: (table) => ({
    select: () => {
      console.log(`[SUPABASE] Selecting from ${table}`);
      return { data: [], error: null };
    }
  })
};
