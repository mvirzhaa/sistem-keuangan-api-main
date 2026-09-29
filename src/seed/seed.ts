import { PrismaClient } from "../generated/prisma/index.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadJenisTransaksiData() {
  const seedDataPath = join(__dirname, "jenis_transaksi_seed.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));
  return seedData.jenisTransaksi;
}

function loadJenisUserData() {
  const seedDataPath = join(__dirname, "jenis_user_seed.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));
  return seedData.jenisUser;
}

function loadKelompokData() {
  const seedDataPath = join(__dirname, "kelompok_seed.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));
  return seedData.kelompok; // ubah dari kelompok ke kelompoks
}

function loadFrekuensiData() {
  const seedDataPath = join(__dirname, "frekuensi_seed.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));
  return seedData.frekuensi; // ubah dari kelompok ke kelompoks
}

function loadKegiatanAkademikData() {
  const seedDataPath = join(__dirname, "kegiatan_akademik_seed.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));
  return seedData.kegiatanAkademik;
}

function loadJenisTagihanData() {
  const seedDataPath = join(__dirname, "jenis_tagihan_seed_example.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));
  return seedData.jenisTagihan;
}

function loadMetodePembayaranData() {
  const seedDataPath = join(__dirname, "metode_pembayaran_seed.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));
  return seedData.metodePembayaran;
}

function loadKelompokUKTData() {
  const seedDataPath = join(__dirname, "kelompok_ukt_seed.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));
  return seedData.kelompokUKT;
}

function loadPeriodeData() {
  const seedDataPath = join(__dirname, "periode_seed.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));
  return seedData.periode;
}

function loadRekananData() {
  const seedDataPath = join(__dirname, "rekanan_seed.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));
  return seedData.rekanan;
}

function loadUnitKerjaData() {
  const seedDataPath = join(__dirname, "unit_kerja_seed.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));
  return seedData;
}

function loadJalurPendaftaranData() {
  const seedDataPath = join(__dirname, "jalur_pendaftaran_seed.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));
  return seedData.jalurPendaftaran;
}

// ========= seed function ==============

async function seedJenisTransaksiUpsert() {
  console.log("🔄 Upserting JenisTransaksi...");

  const jenisTransaksiData = loadJenisTransaksiData();

  let createdCount = 0;
  let updatedCount = 0;

  for (const data of jenisTransaksiData) {
    const existing = await prisma.jenisTransaksi.findUnique({
      where: { kode: data.kode },
    });

    const result = await prisma.jenisTransaksi.upsert({
      where: { kode: data.kode },
      update: {
        nama: data.nama,
        formatKodeTransaksi: data.formatKodeTransaksi, // ubah ke camelCase
      },
      create: data,
    });

    if (existing) {
      updatedCount++;
      console.log(`🔄 Updated: ${result.kode} - ${result.nama}`);
    } else {
      createdCount++;
      console.log(`✅ Created: ${result.kode} - ${result.nama}`);
    }
  }

  console.log(`\n📊 Summary: ${createdCount} created, ${updatedCount} updated`);
}

async function seedJenisUserUpsert() {
  console.log("🔄 Upserting JenisUser...");

  const jenisUserData = loadJenisUserData();

  let createdCount = 0;
  let updatedCount = 0;

  for (const data of jenisUserData) {
    const existing = await prisma.jenisUser.findUnique({
      where: { id: data.id },
    });

    const result = await prisma.jenisUser.upsert({
      where: { id: data.id },
      update: {
        nama: data.nama,
      },
      create: data,
    });

    if (existing) {
      updatedCount++;
      console.log(`� Updated: ID ${result.id} - ${result.nama}`);
    } else {
      createdCount++;
      console.log(`✅ Created: ID ${result.id} - ${result.nama}`);
    }
  }

  console.log(`\n📊 Summary: ${createdCount} created, ${updatedCount} updated`);
}

async function seedKelompokUpsert() {
  console.log("🔄 Upserting Kelompok...");

  const kelompokData = loadKelompokData();

  let createdCount = 0;
  let updatedCount = 0;

  for (const data of kelompokData) {
    try {
      // Validasi jenisUser exists
      const jenisUser = await prisma.jenisUser.findUnique({
        where: { id: data.jenisUserId },
      });

      if (!jenisUser) {
        console.log(`⚠️  JenisUser ID ${data.jenisUserId} tidak ditemukan untuk kelompok ${data.kode}, skip.`);
        continue;
      }

      // Validasi jenisTransaksi exists
      const jenisTransaksi = await prisma.jenisTransaksi.findUnique({
        where: { id: data.jenisTransaksiId },
      });

      if (!jenisTransaksi) {
        console.log(`⚠️  JenisTransaksi ID ${data.jenisTransaksiId} tidak ditemukan untuk kelompok ${data.kode}, skip.`);
        continue;
      }

      const existing = await prisma.kelompok.findUnique({
        where: { kode: data.kode },
      });

      const result = await prisma.kelompok.upsert({
        where: { kode: data.kode },
        update: {
          nama: data.nama,
          jenisUserId: data.jenisUserId,
          jenisTransaksiId: data.jenisTransaksiId,
        },
        create: data,
        include: {
          jenisUser: {
            select: { nama: true },
          },
          jenisTransaksi: {
            select: { kode: true, nama: true },
          },
        },
      });

      if (existing) {
        updatedCount++;
        console.log(`🔄 Updated: ${result.kode} - ${result.nama}`);
      } else {
        createdCount++;
        console.log(`✅ Created: ${result.kode} - ${result.nama}`);
      }

      console.log(`   - Jenis User: ${result.jenisUser.nama}`);
      console.log(`   - Jenis Transaksi: ${result.jenisTransaksi.nama} (${result.jenisTransaksi.kode})\n`);
    } catch (error) {
      console.error(`❌ Error processing kelompok ${data.kode}:`, error);
    }
  }

  console.log(`📊 Summary: ${createdCount} created, ${updatedCount} updated`);
}

async function seedFrekuensiUpsert() {
  console.log("🔄 Upserting Frekuensi...");

  const frekuensiData = loadFrekuensiData();

  let createdCount = 0;
  let updatedCount = 0;

  for (const data of frekuensiData) {
    try {
      const existing = await prisma.frekuensi.findUnique({
        where: { kode: data.kode },
      });

      const result = await prisma.frekuensi.upsert({
        where: { kode: data.kode },
        update: {
          nama: data.nama,
          jumlahHari: data.jumlahHari,
        },
        create: data,
      });

      if (existing) {
        updatedCount++;
        console.log(`🔄 Updated: ${result.kode} - ${result.nama} (${result.jumlahHari ? result.jumlahHari + " hari" : "event-based"})`);
      } else {
        createdCount++;
        console.log(`✅ Created: ${result.kode} - ${result.nama} (${result.jumlahHari ? result.jumlahHari + " hari" : "event-based"})`);
      }
    } catch (error) {
      console.error(`❌ Error processing frekuensi ${data.kode}:`, error);
    }
  }

  console.log(`\n📊 Summary: ${createdCount} created, ${updatedCount} updated`);
}

async function seedKegiatanAkademikUpsert() {
  console.log("🔄 Upserting KegiatanAkademik...");

  const kegiatanAkademikData = loadKegiatanAkademikData();

  let createdCount = 0;
  let updatedCount = 0;

  for (const data of kegiatanAkademikData) {
    try {
      const existing = await prisma.kegiatanAkademik.findUnique({
        where: { kode: data.kode },
      });

      const result = await prisma.kegiatanAkademik.upsert({
        where: { kode: data.kode },
        update: {
          nama: data.nama,
          isEvent: data.isEvent,
          isSyaratPembayaran: data.isSyaratPembayaran,
        },
        create: data,
      });

      if (existing) {
        updatedCount++;
        console.log(`🔄 Updated: ${result.kode} - ${result.nama} (Event: ${result.isEvent ? "✅" : "❌"}, Syarat: ${result.isSyaratPembayaran ? "✅" : "❌"})`);
      } else {
        createdCount++;
        console.log(`✅ Created: ${result.kode} - ${result.nama} (Event: ${result.isEvent ? "✅" : "❌"}, Syarat: ${result.isSyaratPembayaran ? "✅" : "❌"})`);
      }
    } catch (error) {
      console.error(`❌ Error processing kegiatan akademik ${data.kode}:`, error);
    }
  }

  console.log(`\n📊 Summary: ${createdCount} created, ${updatedCount} updated`);
}

async function seedJenisTagihanUpsert() {
  console.log("🔄 Upserting JenisTagihan...");

  const jenisTagihanData = loadJenisTagihanData();

  let createdCount = 0;
  let updatedCount = 0;

  for (const data of jenisTagihanData) {
    try {
      // Validasi kelompok exists
      const kelompok = await prisma.kelompok.findUnique({
        where: { id: data.kelompokId },
      });

      if (!kelompok) {
        console.log(`⚠️  Kelompok ID ${data.kelompokId} tidak ditemukan untuk jenis tagihan ${data.kode}, skip.`);
        continue;
      }

      // Validasi frekuensi exists
      const frekuensi = await prisma.frekuensi.findUnique({
        where: { id: data.frekuensiId },
      });

      if (!frekuensi) {
        console.log(`⚠️  Frekuensi ID ${data.frekuensiId} tidak ditemukan untuk jenis tagihan ${data.kode}, skip.`);
        continue;
      }

      // Validasi kegiatan akademik exists (jika ada)
      if (data.eventKegiatanAkademikId) {
        const kegiatanAkademik = await prisma.kegiatanAkademik.findUnique({
          where: { id: data.eventKegiatanAkademikId },
        });

        if (!kegiatanAkademik) {
          console.log(`⚠️  KegiatanAkademik ID ${data.eventKegiatanAkademikId} tidak ditemukan untuk jenis tagihan ${data.kode}, skip.`);
          continue;
        }
      }

      const existing = await prisma.jenisTagihan.findUnique({
        where: { kode: data.kode },
      });

      const result = await prisma.jenisTagihan.upsert({
        where: { kode: data.kode },
        update: {
          namaJenisTagihan: data.namaJenisTagihan,
          kelompokId: data.kelompokId,
          jenisBiayaNeofeeder: data.jenisBiayaNeofeeder,
          frekuensiId: data.frekuensiId,
          eventKegiatanAkademikId: data.eventKegiatanAkademikId,
          isMahasiswa: data.isMahasiswa,
          isPendaftar: data.isPendaftar,
          isGenerateKuliah: data.isGenerateKuliah,
          isSevimaPay: data.isSevimaPay,
        },
        create: data,
        include: {
          kelompok: {
            select: { nama: true },
          },
          frekuensi: {
            select: { nama: true },
          },
          kegiatanAkademik: {
            select: { nama: true },
          },
        },
      });

      if (existing) {
        updatedCount++;
        console.log(`🔄 Updated: ${result.kode} - ${result.namaJenisTagihan}`);
      } else {
        createdCount++;
        console.log(`✅ Created: ${result.kode} - ${result.namaJenisTagihan}`);
      }

      console.log(`   - Kelompok: ${result.kelompok.nama}`);
      console.log(`   - Frekuensi: ${result.frekuensi.nama}`);
      if (result.kegiatanAkademik) {
        console.log(`   - Event: ${result.kegiatanAkademik.nama}`);
      }
      console.log(`   - Mahasiswa: ${result.isMahasiswa ? "✅" : "❌"}, Pendaftar: ${result.isPendaftar ? "✅" : "❌"}\n`);
    } catch (error) {
      console.error(`❌ Error processing jenis tagihan ${data.kode}:`, error);
    }
  }

  console.log(`\n📊 Summary: ${createdCount} created, ${updatedCount} updated`);
}

async function seedMetodePembayaranUpsert() {
  console.log("🔄 Upserting MetodePembayaran...");

  const metodePembayaranData = loadMetodePembayaranData();

  let createdCount = 0;
  let updatedCount = 0;

  for (const data of metodePembayaranData) {
    try {
      const existing = await prisma.metodePembayaranSiakad.findUnique({
        where: { kode: data.kode },
      });

      const result = await prisma.metodePembayaranSiakad.upsert({
        where: { kode: data.kode },
        update: {
          namaMetodePembayaran: data.namaMetodePembayaran,
          jenis: data.jenis,
          isDefault: data.isDefault,
          isAbleToAddChannel: data.isAbleToAddChannel,
          isEditable: data.isEditable,
          isDeleteable: data.isDeleteable,
        },
        create: data,
      });

      if (existing) {
        updatedCount++;
        console.log(`🔄 Updated: ${result.kode} - ${result.namaMetodePembayaran}`);
      } else {
        createdCount++;
        console.log(`✅ Created: ${result.kode} - ${result.namaMetodePembayaran}`);
      }

      console.log(`   - Jenis: ${result.jenis}`);
      console.log(`   - Default: ${result.isDefault ? "✅" : "❌"}, Editable: ${result.isEditable ? "✅" : "❌"}, Deleteable: ${result.isDeleteable ? "✅" : "❌"}`);
      console.log(`   - Can Add Channel: ${result.isAbleToAddChannel ? "✅" : "❌"}\n`);
    } catch (error) {
      console.error(`❌ Error processing metode pembayaran ${data.kode}:`, error);
    }
  }

  console.log(`\n📊 Summary: ${createdCount} created, ${updatedCount} updated`);
}

async function seedKelompokUKTUpsert() {
  console.log("🔄 Upserting KelompokUKT...");

  const kelompokUKTData = loadKelompokUKTData();

  let createdCount = 0;
  let updatedCount = 0;

  for (const data of kelompokUKTData) {
    try {
      const existing = await prisma.kelompokUKT.findUnique({
        where: { kode: data.kode },
      });

      const result = await prisma.kelompokUKT.upsert({
        where: { kode: data.kode },
        update: {
          nama: data.nama,
          isKipKuliah: data.isKipKuliah,
        },
        create: data,
      });

      if (existing) {
        updatedCount++;
        console.log(`🔄 Updated: ${result.kode} - ${result.nama}`);
      } else {
        createdCount++;
        console.log(`✅ Created: ${result.kode} - ${result.nama}`);
      }

      console.log(`   - KIP Kuliah: ${result.isKipKuliah ? "✅" : "❌"}\n`);
    } catch (error) {
      console.error(`❌ Error processing kelompok UKT ${data.kode}:`, error);
    }
  }

  console.log(`\n📊 Summary: ${createdCount} created, ${updatedCount} updated`);
}

async function seedPeriodeUpsert() {
  console.log("🔄 Upserting Periode...");

  const periodeData = loadPeriodeData();

  let createdCount = 0;
  let updatedCount = 0;

  for (const data of periodeData) {
    try {
      const existing = await prisma.periode.findUnique({
        where: { kode: data.kode },
      });

      const result = await prisma.periode.upsert({
        where: { kode: data.kode },
        update: {
          namaPeriode: data.namaPeriode,
          isAktif: data.isAktif,
        },
        create: data,
      });

      if (existing) {
        updatedCount++;
        console.log(`🔄 Updated: ${result.kode} - ${result.namaPeriode}`);
      } else {
        createdCount++;
        console.log(`✅ Created: ${result.kode} - ${result.namaPeriode}`);
      }

      console.log(`   - Status: ${result.isAktif ? "🟢 Aktif" : "⚪ Tidak Aktif"}\n`);
    } catch (error) {
      console.error(`❌ Error processing periode ${data.kode}:`, error);
    }
  }

  console.log(`📊 Summary: ${createdCount} created, ${updatedCount} updated`);
}

async function seedRekananUpsert() {
  console.log("🔄 Upserting Rekanan...");

  const rekananData = loadRekananData();

  let createdCount = 0;
  let updatedCount = 0;

  for (const data of rekananData) {
    try {
      const existing = await prisma.rekanan.findFirst({
        where: { id: data.id },
      });

      let result;

      if (existing) {
        result = await prisma.rekanan.update({
          where: { id: existing.id },
          data: {
            kota: data.kota,
            telepon: data.telepon,
            email: data.email,
          },
        });
        updatedCount++;
        console.log(`🔄 Updated: ${result.nama}`);
      } else {
        result = await prisma.rekanan.create({
          data: data,
        });
        createdCount++;
        console.log(`✅ Created: ${result.nama}`);
      }

      console.log(`   - Kota: ${result.kota || "N/A"}`);
      console.log(`   - Telepon: ${result.telepon || "N/A"}`);
      console.log(`   - Email: ${result.email || "N/A"}\n`);
    } catch (error) {
      console.error(`❌ Error processing rekanan ${data.nama}:`, error);
    }
  }

  console.log(`📊 Summary: ${createdCount} created, ${updatedCount} updated`);
}

async function seedUnitKerjaUpsert() {
  console.log("🔄 Upserting Unit Kerja, Fakultas, dan Program Studi...");

  const { unitKerja, fakultas, programStudi } = loadUnitKerjaData();

  // 1. Seed Unit Kerja
  console.log("\n📁 Seeding Unit Kerja...");
  let unitKerjaCreated = 0;
  let unitKerjaUpdated = 0;

  for (const data of unitKerja) {
    try {
      const existing = await prisma.unitKerja.findUnique({
        where: { kode: data.kode },
      });

      const result = await prisma.unitKerja.upsert({
        where: { kode: data.kode },
        update: {
          nama: data.nama,
          singkatan: data.singkatan,
          level: data.level,
          parentId: data.parentId,
        },
        create: data,
      });

      if (existing) {
        unitKerjaUpdated++;
        console.log(`🔄 Updated Unit Kerja: ${result.kode} - ${result.nama} (${result.level})`);
      } else {
        unitKerjaCreated++;
        console.log(`✅ Created Unit Kerja: ${result.kode} - ${result.nama} (${result.level})`);
      }
    } catch (error) {
      console.error(`❌ Error processing unit kerja ${data.kode}:`, error);
    }
  }

  // 2. Seed Fakultas
  console.log("\n🏛️ Seeding Fakultas...");
  let fakultasCreated = 0;
  let fakultasUpdated = 0;

  for (const data of fakultas) {
    try {
      // Validasi unitKerja exists
      const unitKerja = await prisma.unitKerja.findUnique({
        where: { id: data.unitKerjaId },
      });

      if (!unitKerja) {
        console.log(`⚠️  UnitKerja ID ${data.unitKerjaId} tidak ditemukan untuk fakultas ${data.kode}, skip.`);
        continue;
      }

      const existing = await prisma.fakultas.findUnique({
        where: { kode: data.kode },
      });

      const result = await prisma.fakultas.upsert({
        where: { kode: data.kode },
        update: {
          nama: data.nama,
          singkatan: data.singkatan,
          unitKerjaId: data.unitKerjaId,
        },
        create: data,
        include: {
          unitKerja: {
            select: { nama: true, level: true },
          },
        },
      });

      if (existing) {
        fakultasUpdated++;
        console.log(`🔄 Updated Fakultas: ${result.kode} - ${result.nama}`);
      } else {
        fakultasCreated++;
        console.log(`✅ Created Fakultas: ${result.kode} - ${result.nama}`);
      }

      console.log(`   - Unit Kerja: ${result.unitKerja.nama} (${result.unitKerja.level})\n`);
    } catch (error) {
      console.error(`❌ Error processing fakultas ${data.kode}:`, error);
    }
  }

  // 3. Seed Program Studi
  console.log("\n🎓 Seeding Program Studi...");
  let prodiCreated = 0;
  let prodiUpdated = 0;

  for (const data of programStudi) {
    try {
      // Validasi fakultas exists
      const fakultasExists = await prisma.fakultas.findUnique({
        where: { id: data.fakultasId },
      });

      if (!fakultasExists) {
        console.log(`⚠️  Fakultas ID ${data.fakultasId} tidak ditemukan untuk program studi ${data.kode}, skip.`);
        continue;
      }

      // Validasi unitKerja exists
      const unitKerjaExists = await prisma.unitKerja.findUnique({
        where: { id: data.unitKerjaId },
      });

      if (!unitKerjaExists) {
        console.log(`⚠️  UnitKerja ID ${data.unitKerjaId} tidak ditemukan untuk program studi ${data.kode}, skip.`);
        continue;
      }

      const existing = await prisma.programStudi.findUnique({
        where: { kode: data.kode },
      });

      const result = await prisma.programStudi.upsert({
        where: { kode: data.kode },
        update: {
          nama: data.nama,
          singkatan: data.singkatan,
          fakultasId: data.fakultasId,
          unitKerjaId: data.unitKerjaId,
          jenjang: data.jenjang,
        },
        create: data,
        include: {
          fakultas: {
            select: { nama: true, singkatan: true },
          },
          unitKerja: {
            select: { nama: true, level: true },
          },
        },
      });

      if (existing) {
        prodiUpdated++;
        console.log(`🔄 Updated Program Studi: ${result.kode} - ${result.nama}`);
      } else {
        prodiCreated++;
        console.log(`✅ Created Program Studi: ${result.kode} - ${result.nama}`);
      }

      console.log(`   - Fakultas: ${result.fakultas.nama} (${result.fakultas.singkatan})`);
      console.log(`   - Unit Kerja: ${result.unitKerja.nama} (${result.unitKerja.level})`);
      console.log(`   - Jenjang: ${result.jenjang}\n`);
    } catch (error) {
      console.error(`❌ Error processing program studi ${data.kode}:`, error);
    }
  }

  console.log(`\n📊 Summary Unit Kerja: ${unitKerjaCreated} created, ${unitKerjaUpdated} updated`);
  console.log(`📊 Summary Fakultas: ${fakultasCreated} created, ${fakultasUpdated} updated`);
  console.log(`📊 Summary Program Studi: ${prodiCreated} created, ${prodiUpdated} updated`);
}

async function seedJalurPendaftaranUpsert() {
  console.log("🔄 Upserting Jalur Pendaftaran...");

  const jalurPendaftaranData = loadJalurPendaftaranData();

  let createdCount = 0;
  let updatedCount = 0;

  for (const data of jalurPendaftaranData) {
    try {
      const existing = await prisma.jalurPendaftaran.findUnique({
        where: { id: data.id },
      });

      const result = await prisma.jalurPendaftaran.upsert({
        where: { id: data.id },
        update: {
          nama: data.nama,
        },
        create: data,
      });

      if (existing) {
        updatedCount++;
        console.log(`🔄 Updated: ID ${result.id} - ${result.nama}`);
      } else {
        createdCount++;
        console.log(`✅ Created: ID ${result.id} - ${result.nama}`);
      }
    } catch (error) {
      console.error(`❌ Error processing jalur pendaftaran ID ${data.id}:`, error);
    }
  }

  console.log(`\n📊 Summary: ${createdCount} created, ${updatedCount} updated`);
}

async function main() {
  console.log("🌱 Starting upsert seed process...");

  try {
    await seedJenisTransaksiUpsert();
    await seedJenisUserUpsert();
    await seedKelompokUpsert();
    await seedFrekuensiUpsert();
    await seedKegiatanAkademikUpsert();
    await seedJenisTagihanUpsert();
    await seedMetodePembayaranUpsert();
    await seedKelompokUKTUpsert();
    await seedPeriodeUpsert();
    await seedRekananUpsert();
    await seedUnitKerjaUpsert();
    await seedJalurPendaftaranUpsert();

    console.log("\n🎉 Upsert seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
