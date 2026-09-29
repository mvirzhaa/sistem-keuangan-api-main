import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/route.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Function untuk load swagger JSON file
function loadSwaggerSpec(moduleName: string) {
  try {
    const filePath = path.join(process.cwd(), "swagger-modules", `${moduleName}.json`);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      return JSON.parse(fileContent);
    } else {
      console.log(`⚠️  Swagger file for ${moduleName} not found`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error loading swagger for ${moduleName}:`, error);
    return null;
  }
}

// Module list - otomatis dari folder structure
const modules = [
  { name: "dashboard", title: "Dashboard", icon: "📊" },
  { name: "operasional", title: "Operasional", icon: "⚙️" },
  { name: "transaksi", title: "Transaksi", icon: "💳" },
  { name: "generate", title: "Generate", icon: "🔄" },
  { name: "tarif", title: "Tarif", icon: "💰" },
  { name: "referensi", title: "Referensi", icon: "📁" },
  { name: "pengaturan", title: "Pengaturan", icon: "🔧" },
  { name: "laporan", title: "Laporan", icon: "📋" },
  { name: "auth", title: "Authentication", icon: "🔐" },
  { name: "data-master", title: "Data Master", icon: "🗄️" },
];

// Setup swagger documentation untuk setiap module
modules.forEach((module) => {
  const swaggerSpec = loadSwaggerSpec(module.name);

  if (swaggerSpec) {
    // Setup swagger UI untuk module
    app.use(`/api-docs/${module.name}`, swaggerUi.serveFiles(swaggerSpec));
    app.get(
      `/api-docs/${module.name}`,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #2c3e50; }
        .swagger-ui .scheme-container { 
          background: #f8f9fa; 
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
      `,
        customSiteTitle: `${module.title} API - Sistem Keuangan UIKA`,
        swaggerOptions: {
          docExpansion: "list",
          filter: true,
          showRequestHeaders: true,
        },
      })
    );

    // JSON endpoint untuk setiap module
    app.get(`/api-docs/${module.name}.json`, (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    console.log(`📚 ${module.title} API Docs: http://localhost:${PORT}/api-docs/${module.name}`);
  } else {
    // Placeholder untuk module yang belum ada routes
    app.get(`/api-docs/${module.name}`, (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${module.title} API - Coming Soon</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f8f9fa; 
            }
            .container { 
              max-width: 500px; 
              margin: 0 auto; 
              background: white; 
              padding: 40px; 
              border-radius: 12px; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            }
            .icon { font-size: 4rem; margin-bottom: 20px; }
            h1 { color: #2c3e50; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 30px; }
            .back-link { 
              display: inline-block; 
              background: #3498db; 
              color: white; 
              padding: 10px 20px; 
              text-decoration: none; 
              border-radius: 6px; 
            }
            .back-link:hover { background: #2980b9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">${module.icon}</div>
            <h1>${module.title} API</h1>
            <p>Module ini sedang dalam pengembangan.<br>API documentation akan tersedia segera.</p>
            <a href="/api-docs" class="back-link">← Kembali ke Navigation</a>
          </div>
        </body>
        </html>
      `);
    });
  }
});

// All modules combined documentation
const allModulesSpec = loadSwaggerSpec("all-modules");
if (allModulesSpec) {
  app.use("/api-docs/all", swaggerUi.serveFiles(allModulesSpec));
  app.get(
    "/api-docs/all",
    swaggerUi.setup(allModulesSpec, {
      explorer: true,
      customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #2c3e50; }
    `,
      customSiteTitle: "Complete API Documentation - Sistem Keuangan UIKA",
      swaggerOptions: {
        docExpansion: "none",
        filter: true,
        showRequestHeaders: true,
      },
    })
  );

  app.get("/api-docs/all.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(allModulesSpec);
  });
}

// Main navigation page
app.get("/api-docs", (req, res) => {
  const navigationPath = path.join(process.cwd(), "swagger-modules", "navigation.html");

  if (fs.existsSync(navigationPath)) {
    res.sendFile(navigationPath);
  } else {
    // Fallback navigation jika file belum di-generate
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>API Documentation - Sistem Keuangan UIKA</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
          h1 { color: #333; text-align: center; }
          .module-list { list-style: none; padding: 0; }
          .module-list li { margin: 10px 0; }
          .module-list a { 
            display: block; 
            padding: 15px; 
            background: #f8f9fa; 
            text-decoration: none; 
            border-radius: 6px; 
            color: #333; 
          }
          .module-list a:hover { background: #e9ecef; }
          .warning { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            color: #856404; 
            padding: 15px; 
            border-radius: 6px; 
            margin-bottom: 20px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📚 API Documentation Navigation</h1>
          <div class="warning">
            <strong>⚠️ Setup Required:</strong> Jalankan <code>npm run generate:swagger</code> untuk generate dokumentasi lengkap.
          </div>
          <ul class="module-list">
            <li><a href="/api-docs/all">🌟 All Modules (Combined)</a></li>
            ${modules.map((m) => `<li><a href="/api-docs/${m.name}">${m.icon} ${m.title}</a></li>`).join("")}
          </ul>
        </div>
      </body>
      </html>
    `);
  }
});

// Legacy endpoints
app.get("/api-docs.json", (req, res) => {
  res.redirect("/api-docs/all.json");
});

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📚 API Navigation: http://localhost:${PORT}/api-docs`);
  console.log(`\n📖 Available Documentation:`);
  console.log(`   • All Modules: http://localhost:${PORT}/api-docs/all`);
  modules.forEach((m) => {
    console.log(`   • ${m.title}: http://localhost:${PORT}/api-docs/${m.name}`);
  });
  console.log(`\n💡 Run "npm run generate:swagger" to update documentation`);
});

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import router from "./routes/route.js";
// import swaggerUi from "swagger-ui-express";
// import { swaggerSpec } from "./config/swagger.js";

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());

// // Swagger Documentation
// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerSpec, {
//     explorer: true,
//     customCss: ".swagger-ui .topbar { display: none }",
//     customSiteTitle: "Sistem Keuangan UIKA API Documentation",
//   })
// );

// // Swagger JSON endpoint
// app.get("/api-docs.json", (req, res) => {
//   res.setHeader("Content-Type", "application/json");
//   res.send(swaggerSpec);
// });

// app.use("/api", router);

// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
//   console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
//   console.log(`📄 Swagger JSON: http://localhost:${PORT}/api-docs.json`);
// });
