const { execSync } = require("child_process");

console.log("==========================================");
console.log("🏥 Chunjai Clinic Deployment Pipeline");
console.log("==========================================");

// 1. Resolve any previous failed migration attempt (e.g. Error P3009)
try {
  console.log("🔄 Resolving any previously failed migration records in PostgreSQL...");
  execSync('npx prisma migrate resolve --rolled-back "20260815000000_init"', {
    stdio: "inherit",
  });
} catch (e) {
  // It is safe to ignore if there was no failed record
  console.log("ℹ️ No stuck migration record found (or already clean). Continuing...");
}

// 2. Run clean migration
try {
  console.log("\n🚀 Running: npx prisma migrate deploy...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} catch (err) {
  console.error("❌ Migration failed:", err);
  process.exit(1);
}

console.log("\n✅ Database migration completed successfully (No seed run)!");
console.log("==========================================\n");
