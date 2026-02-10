const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const dataFile = path.join(process.cwd(), "src/data/inventory.json");

const run = async () => {
  const raw = fs.readFileSync(dataFile, "utf-8");
  const items = JSON.parse(raw);

  if (!Array.isArray(items) || items.length === 0) {
    console.log("No items found to seed.");
    return;
  }

  await prisma.item.createMany({
    data: items.map((item) => ({
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      inStock: Boolean(item.inStock),
      image: item.image ?? item.imageUrl ?? null,
    })),
    skipDuplicates: false,
  });

  console.log(`Seeded ${items.length} items.`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
