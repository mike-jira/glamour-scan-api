import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/utility/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(data: { name: string; description: string; images?: string[], category: string, lazadaUrl: string }) {
    try {
      const result = await this.prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          images: data.images,
          lazadaUrl: data.lazadaUrl,
          category: {
            connect: {
              id: data.category,
            },
          },
        }
      });

      return {
        error: false,
        stauts: 0,
        message: 'Create Product Success',
        result,
      }
    } catch (e) {
      console.log(e);
      return {
        error: true,
        status: 500,
        message: 'Create Product Failed',
      }
    }
  }

  async findAll() {
    try {
      const result = await this.prisma.product.findMany();

      return {
        status: 0,
        error: false,
        message: 'Retrive products success',
        result
      }
    } catch (e) {
      return {
        status: 500,
        error: true,
        message: 'Retrive products failed',
      }
    }
  }

  async findOne(id) {
    try {
      const result = await this.prisma.product.findUnique({
        where: { id },
        include: { category: true }
      });

      return {
        status: 0,
        error: false,
        message: 'Retrive product success',
        result
      }
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        error: true,
        message: 'Retrive product failed',
      }
    }
  }

  async update(id: string, data) {
    try {
      if (data.category) {
        data.category = {
          connect: {
            id: data.category,
          },
        }
      }

      const result = await this.prisma.product.update({
        where: {
          id,
        },
        data,
      });

      return {
        status: 0,
        error: false,
        message: 'Update product success',
        result,
      }
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        error: true,
        message: 'Update product failed',
      }
    }
  }

  async incrementScanHistory(id: string, ipAddress: string) {
    try {
      const today = new Date(new Date().toISOString().split('T')[0]);

      // Find today's ScanHistory for the product
      const scanHistory = await this.prisma.scanHistory.findUnique({
        where: {
          productId_date: {
            productId: id,
            date: today,
          },
        },
      });
      console.log('scanHistory', scanHistory);
      if (scanHistory && scanHistory.ipAddress.includes(ipAddress)) {
        return { message: 'IP address already recorded for today. No increment made.' };
      }


      const result = await this.prisma.scanHistory.upsert({
        where: {
          productId_date: {
            productId: id,
            date: today,
          },
        },
        update: {
          scans: { increment: 1 },
        },
        create: {
          productId: id,
          scans: 1,
          date: today
        },
      });

      return {
        error: false,
        message: 'Scan count success',
        result,
      };
    } catch (e) {
      return {
        error: true,
        status: 500,
        message: 'Failed to update scan history',
      };
    }
  }

  async scanReport() {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    // total scan count
    const total = await this.prisma.scanHistory.count({});
    // today scan count
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    const todayScanCount = await this.prisma.scanHistory.count({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfToday,
        }
      },
    });
    // last seven day scan count
    const lastSevenDaysCount = await this.prisma.scanHistory.count({
      where: {
        date: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
    });
    // last seven day top three
    const lastSevenDaysTopThreeScan = await this.getTopThreeScan(sevenDaysAgo, today);
    // top three all time
    const topThreeScan = await this.getTopThreeScan();
    // total product
    const totalProduct = await this.prisma.product.count({});
    // graph data seven day scan count
    const dailyScanCounts = await this.getDailyScanCounts();

    return {
      status: 0,
      error: false,
      message: 'Get report successful',
      result: {
        totalScanCount: total,
        todayScanCount: todayScanCount,
        lastSevenDaysCount: lastSevenDaysCount,
        topThreeScan: topThreeScan,
        lastSevenDaysTopThreeScan: lastSevenDaysTopThreeScan,
        totalProduct: totalProduct,
        dailyScanCounts: dailyScanCounts,
      },
    };
  }

  async getTopThreeScan(startDate?: Date, endDate?: Date) {
    const whereCondition = {
      ...(startDate && endDate) ? {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      } : {},
    };
    const scanCounts = await this.prisma.scanHistory.groupBy({
      by: ['productId'],
      _sum: {
        scans: true,
      },
      where: whereCondition,
      orderBy: {
        _sum: {
          scans: 'desc', // Order by total scans in descending order
        },
      },
      take: 3, // Limit the results to top 3
    });

    const topScan = await Promise.all(scanCounts.map(async (scanCount) => {
      const product = await this.prisma.product.findUnique({
        where: { id: scanCount.productId },
        select: {
          name: true,
          images: true,
        },
      });

      return {
        product,
        totalScans: scanCount._sum.scans,
      };
    }));

    return topScan;
  }

  async getDailyScanCounts(startDate?: Date, endDate?: Date) {
    try {
      // Build the where condition based on the provided date range
      const whereCondition = {
        ...(startDate && endDate
          ? {
              date: {
                gte: new Date(startDate), // Greater than or equal to start date
                lte: new Date(endDate),   // Less than or equal to end date
              },
            }
          : {}), // If no date range, return an empty object to count all records
      };

      const dailyScanCounts = await this.prisma.scanHistory.groupBy({
        by: ['date'], // Group by the date
        _sum: {
          scans: true, // Sum the scans for each day
        },
        where: whereCondition,
        orderBy: {
          date: 'asc', // Order by date in ascending order
        },
      });

      // Format the result to return a readable response
      const formattedResult = dailyScanCounts.map(entry => ({
        date: entry.date.toISOString().split('T')[0], // Format date to YYYY-MM-DD
        totalScans: entry._sum.scans,
      }));

      return formattedResult;
    } catch (error) {
      return { error: true, message: 'Failed to retrieve daily scan counts', status: 500 };
    }
  }
}
