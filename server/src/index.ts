import express from "express";
import cors from "cors";
import analyzeRoutes from "./routes/analyzeRoutes";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ai-jobgetter-server" });
});

app.use("/api", analyzeRoutes);

const server = app.listen(PORT, () => {
  console.log(`AI JobGetter server running on http://localhost:${PORT}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nPort ${PORT} is already in use. Set a different port with:\n  PORT=5002 npm run dev\n(and update the client's vite.config.ts proxy target to match)\n`
    );
    process.exit(1);
  }
  throw err;
});
