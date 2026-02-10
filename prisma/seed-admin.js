const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ADMIN_USERS = [
  {
    name: "Hardika",
    email: "hardika.regmi123@gmail.com",
    password: "hardika123",
  },
  {
    name: "Wine & Spirits",
    email: "winespirits30@gmail.com",
    password: "hardika123",
  },
];

const run = async () => {
  for (const user of ADMIN_USERS) {
    const hashedPassword = await bcrypt.hash(user.password, 12);

    const existing = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existing) {
      await prisma.user.update({
        where: { email: user.email },
        data: {
          name: user.name,
          password: hashedPassword,
          role: "admin",
        },
      });
      console.log(`Updated admin user: ${user.email}`);
    } else {
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: "admin",
        },
      });
      console.log(`Created admin user: ${user.email}`);
    }
  }

  console.log("Admin users seeded successfully.");
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
