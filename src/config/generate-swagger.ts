import { generateAllSwaggerFiles } from "./swagger.js";

console.log("🔄 Generating modular swagger files...\n");

try {
  const generatedModules = generateAllSwaggerFiles();

  console.log("\n📊 Summary:");
  console.log(`✅ Total modules: ${generatedModules.length}`);
  console.log(`✅ Active modules: ${generatedModules.filter((m) => m.hasRoutes).length}`);
  console.log(`⏳ Coming soon: ${generatedModules.filter((m) => !m.hasRoutes).length}`);

  console.log("\n🌐 Available URLs:");
  console.log("📋 Navigation: http://localhost:3000/api-docs");
  console.log("🌟 All Modules: http://localhost:3000/api-docs/all");

  generatedModules.forEach((module) => {
    const status = module.hasRoutes ? "✅" : "⏳";
    console.log(`${status} ${module.title}: http://localhost:3000/api-docs/${module.name}`);
  });

  console.log("\n🎉 Swagger generation completed!");
} catch (error) {
  console.error("❌ Error generating swagger files:", error);
  process.exit(1);
}

// import fs from "fs";
// import path from "path";
// import { swaggerSpec } from "./swagger";

// // Generate swagger.json file
// const swaggerPath = path.join(process.cwd(), "swagger.json");

// fs.writeFileSync(swaggerPath, JSON.stringify(swaggerSpec, null, 2));

// console.log("✅ Swagger JSON generated at:", swaggerPath);
