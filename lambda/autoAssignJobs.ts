import { PrismaClient, JobStatus, JobPriority } from '@prisma/client';

const prisma = new PrismaClient();

interface DriverScore {
  id: string;
  score: number;
  activeJobsCount: number;
}

async function calculateDriverScore(driverId: string): Promise<DriverScore> {
  const activeJobs = await prisma.job.count({
    where: {
      assignedDriverId: driverId,
      status: {
        in: [JobStatus.PENDING, JobStatus.IN_PROGRESS]
      }
    }
  });

  // Lower score is better (fewer active jobs = more available)
  return {
    id: driverId,
    score: activeJobs,
    activeJobsCount: activeJobs
  };
}

async function findBestDriver(): Promise<string | null> {
  const drivers = await prisma.user.findMany({
    where: {
      role: 'DRIVER',
      permissions: {
        has: 'READ_TRANSPORT_REQUEST'
      }
    }
  });

  if (drivers.length === 0) return null;

  const driverScores = await Promise.all(
    drivers.map(driver => calculateDriverScore(driver.id))
  );

  // Sort by score (ascending) and get the best driver
  const bestDriver = driverScores.sort((a, b) => a.score - b.score)[0];
  
  // Don't assign to drivers with too many active jobs (e.g., more than 5)
  if (bestDriver.activeJobsCount >= 5) return null;
  
  return bestDriver.id;
}

export const handler = async (): Promise<void> => {
  try {
    // Find unassigned jobs
    const unassignedJobs = await prisma.job.findMany({
      where: {
        assignedDriverId: null,
        status: JobStatus.PENDING
      },
      orderBy: {
        priority: 'desc' // Handle HIGH priority jobs first
      }
    });

    for (const job of unassignedJobs) {
      const bestDriverId = await findBestDriver();
      
      if (bestDriverId) {
        await prisma.job.update({
          where: { id: job.id },
          data: {
            assignedDriverId: bestDriverId,
            updatedAt: new Date()
          }
        });

        console.log(`Assigned job ${job.id} to driver ${bestDriverId}`);
      } else {
        console.log(`No suitable driver found for job ${job.id}`);
      }
    }
  } catch (error) {
    console.error('Error in auto-assignment lambda:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
