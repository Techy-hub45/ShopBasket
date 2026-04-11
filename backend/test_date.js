try {
  const d = new Date(undefined);
  console.log("No options:", d.toLocaleString('en-IN'));
  console.log("With options:", d.toLocaleString('en-IN', { month: 'short' }));
} catch (e) {
  console.error("Caught error:", e);
}
