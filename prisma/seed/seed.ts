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
  const users = [
    {
      id: "1",
      email: "frikan@openvantage.co.za",
      firstName: "Frikan",
      lastName: "van der Merwe",
      role: "ADMINISTRATOR",
      permissions: [
        "READ_USER",
        "CREATE_USER",
        "UPDATE_USER",
        "DELETE_USER",
        "MANAGE_ROLES",
      ],
      password: hashedPassword,
    },
    {
      id: "2",
      email: "riley@openvantage.co.za",
      firstName: "Riley",
      lastName: "van der Merwe",
      role: "TRANSPORT_MANAGER",
      permissions: [
        "VIEW_ASSIGNMENTS",
        "CREATE_JOB",
        "READ_JOB",
        "UPDATE_JOB",
        "DELETE_JOB",
        "READ_EQUIPMENT",
        "UPDATE_EQUIPMENT",
        "DELETE_EQUIPMENT",
          "READ_ASSIGNMENT",
          "UPDATE_ASSIGNMENT",
          "DELETE_ASSIGNMENT",
      ],
      password: hashedPassword,
    },
    {
      id: "3",
      email: "pieter@openvantage.co.za",
      firstName: "Pieter",
      lastName: "van der Merwe",
      role: "DRIVER",
      permissions: ["VIEW_ASSIGNMENTS", "READ_EQUIPMENT"],
      password: hashedPassword,
    },
    {
      id: "4",
      email: "pieter+agent@openvantage.co.za",
      firstName: "Pieter",
      lastName: "AGENT",
      role: "AGENT",
      permissions: [
        "CREATE_CLIENT",
        "READ_CLIENT",
        "UPDATE_CLIENT",
        "DELETE_CLIENT",
        "CREATE_JOB",
        "READ_JOB",
        "UPDATE_JOB",
        "DELETE_JOB",
        "VIEW_ASSIGNMENTS",
      ],
      password: hashedPassword,
    },
  ];
  
  const additionalUsers = Array.from({ length: 5000 }, (_, i) => ({
    id: `${i + 5}`,
    email: `user${i + 4}@openvantage.co.za`,
    permissions: [
      "CREATE_CLIENT",
      "READ_CLIENT",
      "UPDATE_CLIENT",
      "DELETE_CLIENT",
      "CREATE_JOB",
      "READ_JOB",
      "UPDATE_JOB",
      "DELETE_JOB",
      "VIEW_ASSIGNMENTS",
    ],
    password: hashedPassword,
  }));

  const allUsers = [...users, ...additionalUsers];
  await seed.user(allUsers);

  const clients = Array.from({ length: 50 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Client ${i + 1}`,
    idNumber: `ID-${i + 1}`,
    email: `client${i + 1}@openvantage.co.za`,
  }));

  await seed.client(clients);

  const syndicates = Array.from({ length: 50 }, (_, i) => ({
    id: `${i + 1}`,
  }));
  await seed.syndicate(syndicates);

  const equipmentTypes = Array.from({ length: 20 }, (_, i) => ({
    id: `${i + 1}`,
  }));
  await seed.equipmentType(equipmentTypes);
  
  const equipment = Array.from({ length: 50 }, (_, i) => ({
    id: `${i + 1}`,
    registrationNumber: `REG-${i + 1}`,
    typeId: `${Math.floor(Math.random() * 20) + 1}`,
  }));
  await seed.equipment(equipment);

  const sites = Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 1}`,
  }));
  await seed.site(sites);

  const areas = Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 1}`,
    siteID: '1'
  }));
  await seed.area(areas);

  const shafts = Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 1}`,
    areaID: `${Math.floor(Math.random() * 5) + 1}`,
    clientID: `${Math.floor(Math.random() * 5) + 1}`,
  }));
  await seed.shaft(shafts);

  console.log("Database seeded successfully!");

  process.exit();
};

main();