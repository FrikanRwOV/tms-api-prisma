/**
 * ! Executing this script will delete all data in your database and seed it with 10 vehicleType.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed";
import bcrypt from "bcryptjs";
const main = async () => {
  const seed = await createSeedClient();
  console.log("seed starting");
  // Truncate all tables in the database
  await seed.$resetDatabase();

  const hashedPassword = await bcrypt.hash("password123!", 10);
  await seed.user([
    {
      id: "1",
      email: "frikan@openvantage.co.za",
      firstName: "Frikan",
      lastName: "van der Merwe",
      role: "ADMINISTRATOR",
      permissions: ["READ_USER", "CREATE_USER", "UPDATE_USER", "DELETE_USER", "MANAGE_ROLES"],
      password: hashedPassword,
    },
    {
      id: "2",
      email: "riley@openvantage.co.za",
      firstName: "Riley",
      lastName: "van der Merwe",
      role: "TRANSPORT_MANAGER",
      permissions: [
        "READ_TRANSPORT_REQUEST",
        "CREATE_TRANSPORT_REQUEST",
        "UPDATE_TRANSPORT_REQUEST",
        "VIEW_ASSIGNMENTS",
        "READ_VEHICLE"
      ],
      password: hashedPassword,
    },
    {
      id: "3",
      email: "pieter@openvantage.co.za",
      firstName: "Pieter",
      lastName: "van der Merwe",
      role: "DRIVER",
      permissions: [
        "READ_TRANSPORT_REQUEST",
        "VIEW_ASSIGNMENTS",
        "READ_VEHICLE"
      ],
      password: hashedPassword,
    },
  ]);


  await seed.client({
    id: "1",
    name: "Magaya Test Client",
    address: "123 Main St, Johannesburg, South Africa",
    contactNumber: "+27 11 123 4567",
    whatsapp: "+27 11 123 4567",
  });
  await seed.shaft({
    id: "1",
    name: "Magaya Test Shaft",
    clientId: "1",
  });
  await seed.syndicate({
    id: "1",
    name: "Magaya Test Syndicate",
  });
  await seed.vehicleType({
    id: "1",
    name: "Magaya Test Vehicle Type",
  });
  await seed.vehicle({
    id: "1",
    name: "Magaya Test Vehicle",
    vehicleTypeId: "1",
  });
  await seed.job({
    id: "1",
    jobTypeId: "1",
    vehicleId: "1",
    clientId: "1",
    shaftId: "1",
    syndicateId: "1",
  });

  

  console.log("Database seeded successfully!");

  process.exit();
};

main();