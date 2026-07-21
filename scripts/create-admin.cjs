/**
 * Create the admin user in the Neon database.
 * Run: node scripts/create-admin.cjs
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const email = "rayanyaqoob83@gmail.com";
  const password = "12345678";
  const name = "Rayan Yaqoob";

  console.log(`🔐 Creating admin account for ${email}...`);

  // Check if already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`⚠️  User ${email} already exists! Updating role to Admin...`);
    await prisma.user.update({
      where: { email },
      data: { role: "Admin", isActive: true },
    });
    console.log("✅ Role updated to Admin!");
    await prisma.$disconnect();
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  console.log("✅ Password hashed");

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: "Admin",
      plan: "FREE",
      isActive: true,
    },
  });

  console.log(`✅ Admin user created!`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name:  ${user.name}`);
  console.log(`   Role:  ${user.role}`);
  console.log(`   ID:    ${user.id}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
