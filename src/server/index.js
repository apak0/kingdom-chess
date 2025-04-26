// Serve static files
if (process.env.NODE_ENV === "production") {
  // For production, serve the client build files
  const clientDistPath = path.join(__dirname, "../../dist");
  console.log(`Serving static files from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // All routes should be handled by the SPA
  app.get("*", (req, res) => {
    console.log("Serving SPA for path:", req.path);
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}
