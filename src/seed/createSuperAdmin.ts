import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const nama = process.env.SUPERADMIN_NAME || "Super Admin";

  if (!email || !password) {
    console.error("SUPERADMIN_EMAIL dan SUPERADMIN_PASSWORD wajib diisi.");
    console.error('Contoh: SUPERADMIN_EMAIL="admin@uika-bogor.ac.id" SUPERADMIN_PASSWORD="passwordkuat" npx tsx src/seed/createSuperAdmin.ts');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`User dengan email ${email} sudah ada.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      nama,
      password: hashedPassword,
      roles: {
        create: { role: Role.SUPER_ADMIN },
      },
    },
  });

  console.log(`✅ Super Admin dibuat: ${user.email} (id: ${user.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
