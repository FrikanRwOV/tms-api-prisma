/**
 * ! Executing this script will delete all data in your database and seed it with 10 vehicleType.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed";

const main = async () => {
  const seed = await createSeedClient();
  console.log("seed starting");
  // Truncate all tables in the database
  await seed.$resetDatabase();

  // Seed the database with 10 vehicleType
  await seed.vehicleType([
    {
      id: "1",
      name: "Sedan",
      description: "Standard 4-door passenger vehicle"
    },
    {
      id: "2",
      name: "SUV",
      description: "Sport Utility Vehicle suitable for rough terrain"
    },
    {
      id: "3",
      name: "Light Truck",
      description: "Small cargo truck for local deliveries"
    },
    {
      id: "4",
      name: "Heavy Truck",
      description: "Large cargo truck for long-distance hauling"
    },
    {
      id: "5",
      name: "Van",
      description: "Cargo van for medium-sized deliveries"
    },
    {
      id: "6",
      name: "Bus",
      description: "Passenger transport vehicle"
    },
    {
      id: "7",
      name: "Pickup",
      description: "Light duty truck with open cargo area"
    },
    {
      id: "8",
      name: "Flatbed",
      description: "Truck with flat cargo area for oversized loads"
    },
    {
      id: "9",
      name: "Tanker",
      description: "Specialized vehicle for liquid transport"
    },
    {
      id: "10",
      name: "Refrigerated Truck",
      description: "Temperature-controlled cargo vehicle"
    }
  ]);

  await seed.vehicle([
    {
      id: "1",
      registrationNumber: "ABC123GP",
      typeId: "1", // Sedan
      status: "AVAILABLE"
    },
    {
      id: "2",
      registrationNumber: "XYZ789GP",
      typeId: "2", // SUV
      status: "AVAILABLE"
    },
    {
      id: "3",
      registrationNumber: "LT456GP",
      typeId: "3", // Light Truck
      status: "IN_TRANSIT"
    },
    {
      id: "4",
      registrationNumber: "HT789GP",
      typeId: "4", // Heavy Truck
      status: "UNDER_MAINTENANCE"
    },
    {
      id: "5",
      registrationNumber: "VAN234GP",
      typeId: "5", // Van
      status: "AVAILABLE"
    },
    {
      id: "6",
      registrationNumber: "BUS567GP",
      typeId: "6", // Bus
      status: "IN_TRANSIT"
    },
    {
      id: "7",
      registrationNumber: "PU890GP",
      typeId: "7", // Pickup
      status: "AVAILABLE"
    },
    {
      id: "8",
      registrationNumber: "FB123GP",
      typeId: "8", // Flatbed
      status: "OUT_OF_SERVICE"
    },
    {
      id: "9",
      registrationNumber: "TK456GP",
      typeId: "9", // Tanker
      status: "AVAILABLE"
    },
    {
      id: "10",
      registrationNumber: "RT789GP",
      typeId: "10", // Refrigerated Truck
      status: "AVAILABLE"
    }
  ]);

  await seed.user([
    {
      id: "1",
      email: "frikan@openvantage.co.za",
      name: "Frikan",
      role: "ADMINISTRATOR",
      permissions: ["READ_USER", "CREATE_USER", "UPDATE_USER", "DELETE_USER", "MANAGE_ROLES"],
      password: "hashed_password_here",
    },
    {
      id: "2",
      email: "frikan+transport@openvantage.co.za",
      name: "Transport Manager",
      role: "TRANSPORT_MANAGER",
      permissions: [
        "READ_TRANSPORT_REQUEST",
        "CREATE_TRANSPORT_REQUEST",
        "UPDATE_TRANSPORT_REQUEST",
        "VIEW_ASSIGNMENTS",
        "READ_VEHICLE"
      ],
      password: "hashed_password_here",
    },
    {
      id: "3",
      email: "frikan+driver@openvantage.co.za",
      name: "Test Driver",
      role: "DRIVER",
      permissions: [
        "READ_TRANSPORT_REQUEST",
        "VIEW_ASSIGNMENTS",
        "READ_VEHICLE"
      ],
      password: "hashed_password_here",
    },
    {
      id: "4",
      email: "frikan+workshop@openvantage.co.za",
      name: "Workshop Manager",
      role: "WORKSHOP_MANAGER",
      permissions: [
        "CREATE_MAINTENANCE",
        "READ_MAINTENANCE",
        "UPDATE_MAINTENANCE",
        "READ_VEHICLE",
        "UPDATE_VEHICLE"
      ],
      password: "hashed_password_here",
    },
    {
      id: "5",
      email: "frikan+requester@openvantage.co.za",
      name: "Transport Requester",
      role: "REQUESTER",
      permissions: [
        "CREATE_TRANSPORT_REQUEST",
        "READ_TRANSPORT_REQUEST"
      ],
      password: "hashed_password_here",
    },
  ]);

  await seed.job([
    {
      id: "1",
      title: "Emergency Equipment Transport",
      description: "Transport critical medical equipment to Johannesburg General Hospital",
      priority: "HIGH",
      siteClassification: "RED",
      status: "IN_PROGRESS",
      assignedDriverId: "3", // Test Driver
      location: "Johannesburg General Hospital, 7 York Road, Parktown",
      completionProof: null,
    },
    {
      id: "2",
      title: "Construction Materials Delivery",
      description: "Deliver building materials to new residential development site",
      priority: "MEDIUM",
      siteClassification: "ORANGE",
      status: "PENDING",
      assignedDriverId: "3", // Test Driver
      location: "123 Construction Site, Pretoria West",
      completionProof: null,
    },
    {
      id: "3",
      title: "Regular Office Supplies Distribution",
      description: "Monthly office supplies delivery to regional branches",
      priority: "LOW",
      siteClassification: "GREEN",
      status: "COMPLETED",
      assignedDriverId: "3", // Test Driver
      location: "Multiple locations in Gauteng",
      completionProof: "https://storage.example.com/proof/delivery-receipt-123.pdf",
    },
    {
      id: "4",
      title: "Hazardous Materials Transport",
      description: "Transport of classified industrial materials requiring special handling",
      priority: "HIGH",
      siteClassification: "RED",
      status: "PENDING",
      assignedDriverId: "3", // Test Driver
      location: "Industrial Zone B, Germiston",
      completionProof: null,
    },
    {
      id: "5",
      title: "Retail Store Restocking",
      description: "Weekly inventory restocking for suburban retail chain",
      priority: "MEDIUM",
      siteClassification: "GREEN",
      status: "IN_PROGRESS",
      assignedDriverId: "3", // Test Driver
      location: "Sandton City Shopping Centre",
      completionProof: null,
    }
  ]);

  console.log("Database seeded successfully!");

  process.exit();
};

main();