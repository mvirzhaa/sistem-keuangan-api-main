import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";

// Base configuration untuk semua module
const baseOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sistem Keuangan UIKA API",
      version: "1.0.0",
      description: "API untuk sistem keuangan Universitas Ibn Khaldun Bogor",
      contact: {
        name: "API Support",
        email: "support@uika.ac.id",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api-keuangan.uika.ac.id",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Terjadi kesalahan pada server",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                  value: { type: "string" },
                },
              },
            },
          },
        },
        JenisTransaksi: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            kode: { type: "string", example: "TRX-01" },
            nama: { type: "string", example: "Pembayaran Kuliah" },
            formatKodeTransaksi: { type: "string", example: "TRX-{YYYY}{MM}{DD}-{RANDOM}" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        KelompokWithRelations: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            kode: { type: "string", example: "01" },
            nama: { type: "string", example: "Kelompok Reguler" },
            jenisUserId: { type: "integer", example: 1 },
            jenisTransaksiId: { type: "integer", example: 1 },
            jenisUser: {
              type: "object",
              properties: {
                id: { type: "integer" },
                nama: { type: "string" },
              },
            },
            jenisTransaksi: {
              type: "object",
              properties: {
                id: { type: "integer" },
                kode: { type: "string" },
                nama: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Unauthorized access - Token required",
                  },
                },
              },
            },
          },
        },
        ServerError: {
          description: "Server Error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Terjadi kesalahan pada server",
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
};

// Definisi module dengan metadata
const modules = [
  {
    name: "dashboard",
    title: "Dashboard",
    description: "API endpoints untuk dashboard dan visualisasi data keuangan",
    icon: "📊",
  },
  {
    name: "operasional",
    title: "Operasional",
    description: "API endpoints untuk operasional harian pembayaran dan validasi",
    icon: "⚙️",
  },
  {
    name: "transaksi",
    title: "Transaksi",
    description: "API endpoints untuk transaksi keuangan dan pembayaran",
    icon: "💳",
  },
  {
    name: "generate",
    title: "Generate",
    description: "API endpoints untuk generate tagihan, invoice, dan bulk processing",
    icon: "🔄",
  },
  {
    name: "tarif",
    title: "Tarif",
    description: "API endpoints untuk management tarif UKT dan biaya kuliah",
    icon: "💰",
  },
  {
    name: "referensi",
    title: "Referensi",
    description: "API endpoints untuk master data referensi sistem",
    icon: "📁",
  },
  {
    name: "pengaturan",
    title: "Pengaturan",
    description: "API endpoints untuk pengaturan sistem dan user management",
    icon: "🔧",
  },
  {
    name: "laporan",
    title: "Laporan",
    description: "API endpoints untuk laporan keuangan dan analytics",
    icon: "📋",
  },
  {
    name: "auth",
    title: "Authentication",
    description: "API endpoints untuk autentikasi dan otorisasi pengguna",
    icon: "🔐",
  },
  {
    name: "data-master",
    title: "Data Master",
    description: "API endpoints untuk manajemen data master dan user",
    icon: "🗄️",
  },
];

// Function untuk generate swagger spec per module
function generateModuleSwagger(module: (typeof modules)[0]) {
  const routePath = `./src/modules/${module.name}/routes/*.ts`;

  // Check if module routes exist
  const moduleDir = path.join(process.cwd(), `src/modules/${module.name}/routes`);
  if (!fs.existsSync(moduleDir)) {
    console.log(`⚠️  Module ${module.name} routes directory not found, creating empty spec`);
    return {
      ...baseOptions,
      definition: {
        ...baseOptions.definition,
        info: {
          ...baseOptions.definition.info,
          title: `${module.title} - Sistem Keuangan UIKA`,
          description: module.description,
        },
        tags: [
          {
            name: module.title,
            description: module.description,
          },
        ],
      },
      apis: [],
      paths: {},
    };
  }

  return swaggerJSDoc({
    ...baseOptions,
    definition: {
      ...baseOptions.definition,
      info: {
        ...baseOptions.definition.info,
        title: `${module.title} - Sistem Keuangan UIKA`,
        description: module.description,
      },
      tags: [
        {
          name: module.title,
          description: module.description,
        },
      ],
    },
    apis: [routePath],
  });
}

// Function untuk generate semua swagger JSON files
export function generateAllSwaggerFiles() {
  const outputDir = path.join(process.cwd(), "swagger-modules");

  // Create output directory if not exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const generatedModules: any[] = [];

  // Generate swagger file untuk setiap module
  modules.forEach((module) => {
    const swaggerSpec = generateModuleSwagger(module);
    const filePath = path.join(outputDir, `${module.name}.json`);

    fs.writeFileSync(filePath, JSON.stringify(swaggerSpec, null, 2));

    generatedModules.push({
      ...module,
      filePath,
      hasRoutes: Object.keys((swaggerSpec as any).paths || {}).length > 0,
    });

    console.log(`✅ Generated ${module.title} swagger: ${filePath}`);
  });

  // Generate all-modules combined swagger
  const allModulesSpec = swaggerJSDoc({
    ...baseOptions,
    definition: {
      ...baseOptions.definition,
      info: {
        ...baseOptions.definition.info,
        title: "Sistem Keuangan UIKA - Complete API",
        description: "Dokumentasi lengkap semua module API sistem keuangan",
      },
    },
    apis: modules.map((m) => `./src/modules/${m.name}/routes/*.ts`),
  });

  const allModulesPath = path.join(outputDir, "all-modules.json");
  fs.writeFileSync(allModulesPath, JSON.stringify(allModulesSpec, null, 2));
  console.log(`✅ Generated complete API swagger: ${allModulesPath}`);

  // Generate navigation index
  generateNavigationIndex(generatedModules);

  return generatedModules;
}

// Function untuk generate halaman navigasi
function generateNavigationIndex(modules: any[]) {
  const navigationHTML = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation Navigation - Sistem Keuangan UIKA</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 16px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border: 2px solid #e9ecef;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #666;
            font-size: 0.9rem;
        }
        .modules-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
            gap: 25px; 
            margin-top: 30px; 
        }
        .module-card { 
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 12px; 
            overflow: hidden;
            transition: all 0.3s ease;
            text-decoration: none; 
            color: inherit;
            position: relative;
        }
        .module-card:hover { 
            transform: translateY(-8px); 
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            border-color: #3498db;
        }
        .module-card.no-routes {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .module-card.no-routes:hover {
            transform: none;
            box-shadow: none;
            border-color: #e9ecef;
        }
        .module-header {
            padding: 25px;
            border-bottom: 1px solid #f1f3f4;
        }
        .module-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
            display: block;
        }
        .module-title {
            font-size: 1.4rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
        }
        .module-description {
            color: #666;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        .module-footer {
            padding: 20px 25px;
            background: #f8f9fa;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .route-count {
            background: #e3f2fd;
            color: #1976d2;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        .route-count.empty {
            background: #ffebee;
            color: #c62828;
        }
        .view-docs {
            background: #3498db;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 500;
            text-decoration: none;
        }
        .view-docs:hover {
            background: #2980b9;
            color: white;
        }
        .view-docs.disabled {
            background: #bdc3c7;
            cursor: not-allowed;
            pointer-events: none;
        }
        .all-modules {
            grid-column: 1 / -1;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
        }
        .all-modules .module-header {
            border-bottom-color: rgba(255,255,255,0.2);
        }
        .all-modules .module-title {
            color: white;
        }
        .all-modules .module-description {
            color: rgba(255,255,255,0.9);
        }
        .all-modules .module-footer {
            background: rgba(255,255,255,0.1);
        }
        .all-modules .route-count {
            background: rgba(255,255,255,0.2);
            color: white;
        }
        .all-modules .view-docs {
            background: rgba(255,255,255,0.2);
            color: white;
        }
        .all-modules .view-docs:hover {
            background: rgba(255,255,255,0.3);
        }
        .footer {
            text-align: center;
            padding: 30px;
            color: #666;
            border-top: 1px solid #f1f3f4;
            background: #f8f9fa;
        }
        .no-routes-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ff6b6b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 API Documentation</h1>
            <p>Sistem Keuangan Universitas Ibn Khaldun Bogor</p>
        </div>
        
        <div class="content">
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${modules.length}</div>
                    <div class="stat-label">Total Modules</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${modules.filter((m) => m.hasRoutes).length}</div>
                    <div class="stat-label">Active Modules</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${modules.filter((m) => !m.hasRoutes).length}</div>
                    <div class="stat-label">Coming Soon</div>
                </div>
            </div>

            <div class="modules-grid">
                <a href="/api-docs/all" class="module-card all-modules">
                    <div class="module-header">
                        <span class="module-icon">🌟</span>
                        <h3 class="module-title">Semua Module</h3>
                        <p class="module-description">Dokumentasi lengkap seluruh endpoint API sistem keuangan dalam satu halaman</p>
                    </div>
                    <div class="module-footer">
                        <span class="route-count">Complete</span>
                        <span class="view-docs">Lihat Dokumentasi →</span>
                    </div>
                </a>
                
                ${modules
                  .map(
                    (module) => `
                <a href="${module.hasRoutes ? `/api-docs/${module.name}` : "#"}" 
                   class="module-card ${!module.hasRoutes ? "no-routes" : ""}">
                    ${!module.hasRoutes ? '<div class="no-routes-badge">Coming Soon</div>' : ""}
                    <div class="module-header">
                        <span class="module-icon">${module.icon}</span>
                        <h3 class="module-title">${module.title}</h3>
                        <p class="module-description">${module.description}</p>
                    </div>
                    <div class="module-footer">
                        <span class="route-count ${!module.hasRoutes ? "empty" : ""}">${module.hasRoutes ? "Available" : "No Routes"}</span>
                        <span class="view-docs ${!module.hasRoutes ? "disabled" : ""}">${module.hasRoutes ? "Lihat Docs →" : "Coming Soon"}</span>
                    </div>
                </a>
                `
                  )
                  .join("")}
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Sistem Keuangan UIKA v1.0.0</strong></p>
            <p>© 2024 Universitas Ibn Khaldun Bogor</p>
        </div>
    </div>
</body>
</html>
  `;

  const navigationPath = path.join(process.cwd(), "swagger-modules", "navigation.html");
  fs.writeFileSync(navigationPath, navigationHTML);
  console.log(`✅ Generated navigation page: ${navigationPath}`);
}

// Export untuk digunakan di tempat lain
export { modules, generateModuleSwagger };

// import swaggerJSDoc from "swagger-jsdoc";

// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Sistem Keuangan UIKA API",
//       version: "1.0.0",
//       description: "API untuk sistem keuangan Universitas Ibn Khaldun Bogor",
//       contact: {
//         name: "API Support",
//         email: "support@uika.ac.id",
//       },
//     },
//     servers: [
//       {
//         url: "http://localhost:3000",
//         description: "Development server",
//       },
//       {
//         url: "https://api-keuangan.uika.ac.id",
//         description: "Production server",
//       },
//     ],
//     tags : [

//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },
//       // schemas: {
//       //   JenisTransaksi: {
//       //     type: "object",
//       //     required: ["kode", "nama", "formatKodeTransaksi"],
//       //     properties: {
//       //       id: {
//       //         type: "integer",
//       //         description: "ID unik jenis transaksi",
//       //         example: 1,
//       //       },
//       //       kode: {
//       //         type: "string",
//       //         description: "Kode jenis transaksi",
//       //         example: "DEP",
//       //       },
//       //       nama: {
//       //         type: "string",
//       //         description: "Nama jenis transaksi",
//       //         example: "Deposit",
//       //       },
//       //       formatKodeTransaksi: {
//       //         type: "string",
//       //         description: "Format kode transaksi",
//       //         example: "DEP/{{periode}}/{{urutan}}",
//       //       },
//       //       createdAt: {
//       //         type: "string",
//       //         format: "date-time",
//       //         description: "Tanggal dibuat",
//       //       },
//       //       updatedAt: {
//       //         type: "string",
//       //         format: "date-time",
//       //         description: "Tanggal diupdate",
//       //       },
//       //     },
//       //   },
//       //   ApiResponse: {
//       //     type: "object",
//       //     properties: {
//       //       success: {
//       //         type: "boolean",
//       //         description: "Status keberhasilan request",
//       //       },
//       //       message: {
//       //         type: "string",
//       //         description: "Pesan response",
//       //       },
//       //       data: {
//       //         description: "Data response",
//       //       },
//       //       total: {
//       //         type: "integer",
//       //         description: "Total data",
//       //       },
//       //     },
//       //   },
//       //   ErrorResponse: {
//       //     type: "object",
//       //     properties: {
//       //       success: {
//       //         type: "boolean",
//       //         example: false,
//       //       },
//       //       message: {
//       //         type: "string",
//       //         description: "Pesan error",
//       //         example: "Unauthorized access - Token required",
//       //       },
//       //     },
//       //   },
//       // },
//     },
//     security: [
//       {
//         bearerAuth: [],
//       },
//     ],
//   },
//   apis: ["./src/modules/**/routes/*.ts"], // Path ke file routes yang berisi annotasi swagger
// };

// export const swaggerSpec = swaggerJSDoc(options);
