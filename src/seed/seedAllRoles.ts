import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

interface UserRoleSeed {
  email: string;
  nama: string;
  role: Role;
  password?: string;
}

const DEFAULT_PASSWORD = "Password123!";

const usersToSeed: UserRoleSeed[] = [
  {
    email: "superadmin@uika-bogor.ac.id",
    nama: "Super Admin",
    role: Role.SUPER_ADMIN,
  },
  {
    email: "admin.keuangan@uika-bogor.ac.id",
    nama: "Admin Keuangan",
    role: Role.ADMIN_KEUANGAN,
  },
  {
    email: "operator.keuangan@uika-bogor.ac.id",
    nama: "Operator Keuangan",
    role: Role.OPERATOR_KEUANGAN,
  },
  {
    email: "kasubag.keuangan@uika-bogor.ac.id",
    nama: "Kasubag Keuangan",
    role: Role.KASUBAG_KEUANGAN,
  },
  {
    email: "kepala.tu@uika-bogor.ac.id",
    nama: "Kepala TU Fakultas",
    role: Role.KEPALA_TU_FAKULTAS,
  },
  {
    email: "wadek2@uika-bogor.ac.id",
    nama: "Wakil Dekan 2",
    role: Role.WAKIL_DEKAN_2,
  },
  {
    email: "warek2@uika-bogor.ac.id",
    nama: "Wakil Rektor 2",
    role: Role.WAKIL_REKTOR_2,
  },
  {
    email: "rektor@uika-bogor.ac.id",
    nama: "Rektor UIKA",
    role: Role.REKTOR,
  },
];

async function main() {
  console.log("🌱 Seeding users untuk semua role...\n");

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  for (const item of usersToSeed) {
    const existing = await prisma.user.findUnique({
      where: { email: item.email },
      include: { roles: true },
    });

    if (existing) {
      // Periksa apakah role sudah ada
      const hasRole = existing.roles.some((r) => r.role === item.role);
      if (!hasRole) {
        await prisma.userRoles.create({
          data: {
            userId: existing.id,
            role: item.role,
          },
        });
        console.log(`🔄 Role ${item.role} ditambahkan ke user ${item.email}`);
      } else {
        console.log(`ℹ️  User ${item.email} (${item.role}) sudah ada.`);
      }
    } else {
      const user = await prisma.user.create({
        data: {
          email: item.email,
          nama: item.nama,
          password: hashedPassword,
          roles: {
            create: { role: item.role },
          },
        },
      });
      console.log(`✅ User berhasil dibuat: ${user.email} (${item.role})`);
    }
  }

  console.log("\n🎉 Selesai seeding akun untuk semua role!");
}

main()
  .catch((err) => {
    console.error("❌ Error saat seeding users:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
