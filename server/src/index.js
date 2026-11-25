import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import repairRoutes from "./routes/repairRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
app.use("/api/auth", authRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/stats", statsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});