import { 
  type Transaction, 
  type Pass, 
  type Staff,
  type InsertTransaction,
  type InsertPass,
  type InsertStaff
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  
  // Pass operations
  createPass(pass: InsertPass): Promise<Pass>;
  getPassesByTransaction(transactionId: string): Promise<Pass[]>;
  getRecentPasses(limit: number): Promise<Pass[]>;
  
  // Staff operations
  createStaff(staff: InsertStaff): Promise<Staff>;
  getStaffById(id: string): Promise<Staff | undefined>;
  getStaffByUsername(username: string): Promise<Staff | undefined>;
  getAllStaff(): Promise<Staff[]>;
  updateStaff(id: string, updateData: Partial<Staff>): Promise<Staff | undefined>;
  deleteStaff(id: string): Promise<boolean>;

  // Reports
  getDailyReport(date: Date): Promise<{
    date: string;
    totalPasses: number;
    passNumbers: string[];
    totalRevenue: string;
    passByType: { [key: string]: { count: number; revenue: string } };
  }>;
}

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction>;
  private passes: Map<string, Pass>;
  private staff: Map<string, Staff>;

  constructor() {
    this.transactions = new Map();
    this.passes = new Map();
    this.staff = new Map();
    
    // Initialize with default admin user
    this.initializeDefaultStaff();
  }

  private async initializeDefaultStaff() {
    const adminId = randomUUID();
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const defaultAdmin: Staff = {
      id: adminId,
      username: "admin",
      passwordHash: hashedPassword,
      fullName: "System Administrator",
      designation: "Port Administrator",
      department: "Administration",
      isAdmin: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.staff.set(adminId, defaultAdmin);
  }

  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      id,
      createdAt: new Date(),
      payerName: insertTransaction.payerName,
      payerEmail: insertTransaction.payerEmail || null,
      payerPhone: insertTransaction.payerPhone || null,
      totalAmount: insertTransaction.totalAmount,
      slipFilename: insertTransaction.slipFilename
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  // Pass operations
  async createPass(insertPass: InsertPass): Promise<Pass> {
    const id = randomUUID();
    const pass: Pass = {
      id,
      createdAt: new Date(),
      transactionId: insertPass.transactionId,
      staffId: insertPass.staffId,
      customerName: insertPass.customerName,
      passType: insertPass.passType,
      idNumber: insertPass.idNumber || null,
      plateNumber: insertPass.plateNumber || null,
      validDate: insertPass.validDate,
      passNumber: insertPass.passNumber,
      amount: insertPass.amount,
      qrCode: insertPass.qrCode
    };
    this.passes.set(id, pass);
    return pass;
  }

  async getPassesByTransaction(transactionId: string): Promise<Pass[]> {
    return Array.from(this.passes.values()).filter(
      (pass) => pass.transactionId === transactionId
    );
  }

  async getRecentPasses(limit: number): Promise<Pass[]> {
    const allPasses = Array.from(this.passes.values());
    return allPasses
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Staff operations
  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertStaff.passwordHash, 10);
    
    const staff: Staff = {
      id,
      username: insertStaff.username,
      fullName: insertStaff.fullName,
      designation: insertStaff.designation,
      department: insertStaff.department,
      isAdmin: insertStaff.isAdmin || false,
      passwordHash: hashedPassword,
      isActive: insertStaff.isActive || true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.staff.set(id, staff);
    return staff;
  }

  async getStaffById(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async getStaffByUsername(username: string): Promise<Staff | undefined> {
    return Array.from(this.staff.values()).find(
      (staff) => staff.username === username
    );
  }

  async getAllStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }

  async updateStaff(id: string, updateData: Partial<Staff>): Promise<Staff | undefined> {
    const existingStaff = this.staff.get(id);
    if (!existingStaff) {
      return undefined;
    }

    const updatedStaff: Staff = {
      ...existingStaff,
      ...updateData,
      id, // Keep original ID
      updatedAt: new Date()
    };

    // Hash password if provided
    if (updateData.passwordHash) {
      updatedStaff.passwordHash = await bcrypt.hash(updateData.passwordHash, 10);
    }

    this.staff.set(id, updatedStaff);
    return updatedStaff;
  }

  async deleteStaff(id: string): Promise<boolean> {
    return this.staff.delete(id);
  }

  async getDailyReport(date: Date): Promise<{
    date: string;
    totalPasses: number;
    passNumbers: string[];
    totalRevenue: string;
    passByType: { [key: string]: { count: number; revenue: string } };
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dailyPasses = Array.from(this.passes.values()).filter(pass => {
      const passDate = new Date(pass.createdAt);
      return passDate >= startOfDay && passDate <= endOfDay;
    });

    const passByType: { [key: string]: { count: number; revenue: string } } = {};
    let totalRevenue = 0;

    dailyPasses.forEach(pass => {
      const passTypeLabel = this.getPassTypeLabel(pass.passType);
      const amount = parseFloat(pass.amount);
      
      if (!passByType[passTypeLabel]) {
        passByType[passTypeLabel] = { count: 0, revenue: "0.00" };
      }
      
      passByType[passTypeLabel].count++;
      const currentRevenue = parseFloat(passByType[passTypeLabel].revenue);
      passByType[passTypeLabel].revenue = (currentRevenue + amount).toFixed(2);
      totalRevenue += amount;
    });

    return {
      date: date.toISOString().split('T')[0],
      totalPasses: dailyPasses.length,
      passNumbers: dailyPasses.map(pass => pass.passNumber),
      totalRevenue: totalRevenue.toFixed(2),
      passByType
    };
  }

  private getPassTypeLabel(passType: string): string {
    const labels = {
      daily: "Daily Pass",
      vehicle: "Vehicle Sticker",
      crane: "Crane Lorry Vehicle Sticker",
      trailer20: "Trailer 20/Dump Truck Vehicle Sticker",
      trailer40: "Trailer 40 Vehicle Sticker"
    };
    return labels[passType] || passType;
  }
}

export const storage = new MemStorage();
