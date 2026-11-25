import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceStatus, PaymentStatus, Prisma } from '@prisma/client';
import { existsSync } from 'fs';
import { resolve } from 'path';
import PDFDocument from 'pdfkit';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  private async generateReceiptNo(tx: Prisma.TransactionClient) {
    const year = new Date().getFullYear();
    const prefix = `RCT-${year}-`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`receipt:${year}`}))`;
    const count = await tx.contribution.count({ where: { receiptNo: { startsWith: prefix } } });
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }

  async recordPayment(dto: CreatePaymentDto, recordedById?: string) {
    if (!dto.amount || dto.amount <= 0) throw new BadRequestException('Amount must be greater than 0');
    let memberId: string | null = dto.memberId || null;
    if (memberId) {
      const member = await this.prisma.member.findUnique({ where: { id: memberId } });
      if (!member) throw new NotFoundException('Member not found');
    } else if (!dto.anonymousName && !dto.notes) {
      // allow anonymous; name/note optional but record should be clear
    }

    const contribution = await this.prisma.$transaction(async (tx) => {
      const receiptNo = await this.generateReceiptNo(tx);
      return tx.contribution.create({
        data: {
          memberId,
          recordedById: recordedById || null,
          receiptNo,
          category: dto.category,
          amount: dto.amount as any,
          currency: 'TZS',
          paymentMethod: dto.method,
          reference: dto.reference || null,
          notes: dto.notes || (dto.anonymousName ? `Anonymous/External payer: ${dto.anonymousName}` : null),
          status: PaymentStatus.CONFIRMED,
          contributedAt: new Date(),
        },
        include: { member: { select: { id: true, fullName: true, memberNo: true } } },
      });
    });
    const receiptNo = contribution.receiptNo;

    await this.prisma.auditLog.create({
      data: {
        actorId: recordedById || null,
        action: 'PAYMENT_RECORDED',
        entityType: 'Contribution',
        entityId: contribution.id,
        metadata: { receiptNo, memberId, anonymousName: dto.anonymousName || null, category: dto.category, amount: dto.amount, method: dto.method, reference: dto.reference || null },
      },
    });

    return contribution;
  }

  async myContributions(userId: string) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) return { member: null, contributions: [], totals: { count: 0, amount: 0 } };
    const contributions = await this.prisma.contribution.findMany({
      where: { memberId: member.id, status: { in: [PaymentStatus.CONFIRMED, PaymentStatus.PENDING] } },
      orderBy: { contributedAt: 'desc' },
    });
    const totalAmount = contributions.reduce((sum, c) => sum + Number(c.amount), 0);
    return { member: { id: member.id, fullName: member.fullName, memberNo: member.memberNo }, contributions, totals: { count: contributions.length, amount: totalAmount } };
  }

  private normalizePhone(raw?: string | null): string | null {
    if (!raw) return null;
    let s = String(raw).trim();
    if (!s) return null;
    s = s.replace(/[\s\-()]/g, '');
    if (s.startsWith('00')) s = `+${s.slice(2)}`;
    if (s.startsWith('0') && s.length >= 9) s = `+255${s.slice(1)}`;
    if (!s.startsWith('+')) s = `+${s}`;
    if (!/^\+[1-9]\d{7,14}$/.test(s)) throw new BadRequestException('Invalid phone number format. Use +2557XXXXXXXX');
    return s;
  }

  private normalizePhoneOptional(raw?: string | null): string | null {
    if (raw === undefined || raw === null || String(raw).trim() === '') return null;
    return this.normalizePhone(raw);
  }

  async searchMembers(q?: string) {
    const where: any = { membershipStatus: 'APPROVED' };
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { memberNo: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { whatsappNumber: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }
    return this.prisma.member.findMany({
      where,
      orderBy: { fullName: 'asc' },
      take: 30,
      select: { id: true, fullName: true, memberNo: true, phone: true, whatsappNumber: true, email: true, membershipStatus: true },
    });
  }

  async createPledge(data: { memberId: string; amount: number; targetDate?: string; notes?: string }, actorId?: string) {
    const member = await this.prisma.member.findUnique({ where: { id: data.memberId } });
    if (!member) throw new NotFoundException('Member not found');
    const pledge = await this.prisma.pledge.create({
      data: {
        memberId: data.memberId,
        amount: data.amount as any,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        notes: data.notes || null,
        recordedById: actorId || null,
        status: 'PENDING',
      },
      include: { member: { select: { id: true, fullName: true, memberNo: true } } },
    });
    await this.prisma.auditLog.create({ data: { actorId: actorId || null, action: 'PLEDGE_RECORDED', entityType: 'Pledge', entityId: pledge.id, metadata: { memberId: data.memberId, amount: data.amount } } });
    return pledge;
  }

  async listPledges() {
    return this.prisma.pledge.findMany({ orderBy: { createdAt: 'desc' }, include: { member: { select: { id: true, fullName: true, memberNo: true } } } });
  }

  async createExpense(data: { description: string; amount: number; category: string; date?: string }, actorId?: string) {
    const expense = await this.prisma.expense.create({
      data: {
        description: data.description,
        amount: data.amount as any,
        category: data.category,
        recordedById: actorId || null,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
    await this.prisma.auditLog.create({ data: { actorId: actorId || null, action: 'EXPENSE_RECORDED', entityType: 'Expense', entityId: expense.id, metadata: { description: data.description, amount: data.amount, category: data.category } } });
    return expense;
  }

  async listExpenses() {
    return this.prisma.expense.findMany({ orderBy: { date: 'desc' } });
  }

  async listPayments() {
    return this.prisma.contribution.findMany({ orderBy: { contributedAt: 'desc' }, include: { member: { select: { id: true, fullName: true, memberNo: true } } } });
  }

  async listReceipts() {
    return this.prisma.contribution.findMany({ where: { receiptNo: { not: null } }, orderBy: { contributedAt: 'desc' }, select: { id: true, receiptNo: true, category: true, amount: true, currency: true, paymentMethod: true, contributedAt: true, status: true, member: { select: { id: true, fullName: true, memberNo: true } } } });
  }

  async financeReports() {
    const [incomeByCategory, expensesByCategory, byMonth, byDay, byWeek, byYear, recentContributions, pledges, projects] = await Promise.all([
      this.prisma.contribution.groupBy({ by: ['category'], _sum: { amount: true }, _count: { _all: true }, where: { status: PaymentStatus.CONFIRMED } }),
      this.prisma.expense.groupBy({ by: ['category'], _sum: { amount: true }, _count: { _all: true } }),
      this.prisma.$queryRawUnsafe(`SELECT to_char(date_trunc('month',"contributedAt"),'YYYY-MM') as period, sum(amount)::float as amount, count(*)::int as count FROM "Contribution" WHERE status='CONFIRMED' GROUP BY 1 ORDER BY 1 DESC LIMIT 24`).catch(()=>[]),
      this.prisma.$queryRawUnsafe(`SELECT to_char(date_trunc('day',"contributedAt"),'YYYY-MM-DD') as period, sum(amount)::float as amount, count(*)::int as count FROM "Contribution" WHERE status='CONFIRMED' GROUP BY 1 ORDER BY 1 DESC LIMIT 30`).catch(()=>[]),
      this.prisma.$queryRawUnsafe(`SELECT to_char(date_trunc('week',"contributedAt"),'IYYY-IW') as period, sum(amount)::float as amount, count(*)::int as count FROM "Contribution" WHERE status='CONFIRMED' GROUP BY 1 ORDER BY 1 DESC LIMIT 12`).catch(()=>[]),
      this.prisma.$queryRawUnsafe(`SELECT to_char(date_trunc('year',"contributedAt"),'YYYY') as period, sum(amount)::float as amount, count(*)::int as count FROM "Contribution" WHERE status='CONFIRMED' GROUP BY 1 ORDER BY 1 DESC LIMIT 10`).catch(()=>[]),
      this.prisma.contribution.findMany({ where: { status: PaymentStatus.CONFIRMED }, orderBy: { contributedAt: 'desc' }, take: 25, include: { member: { select: { id:true, fullName:true, memberNo:true } } } }),
      this.prisma.pledge.aggregate({ _sum: { amount: true }, _count: true }),
      this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } }).catch(()=>[]),
    ]);
    return {
      summary: {
        totalIncome: incomeByCategory.reduce((s:any,r:any)=>s+Number(r._sum?.amount||0),0),
        totalExpenses: expensesByCategory.reduce((s:any,r:any)=>s+Number(r._sum?.amount||0),0),
        contributionCount: incomeByCategory.reduce((s:any,r:any)=>s+Number(r._count?._all||0),0),
      },
      incomeByCategory, expensesByCategory, byMonth, byDay, byWeek, byYear, recentContributions, pledges, projects
    };
  }

  async getReceipt(receiptNo: string, user: { userId: string; roles: string[] }) {
    const contrib = await this.prisma.contribution.findUnique({ where: { receiptNo }, include: { member: true } });
    if (!contrib) throw new NotFoundException('Receipt not found');
    const isFinanceOrAdmin = user.roles.includes('FINANCE_ADMIN') || user.roles.includes('SYSTEM_ADMIN');
    if (!isFinanceOrAdmin) {
      if (!user.roles.includes('CHURCH_MEMBER') || contrib.member?.userId !== user.userId) {
        throw new BadRequestException('Not allowed to access this receipt');
      }
    }
    return contrib;
  }

  async generateReceiptPdf(receiptNo: string, user: { userId: string; roles: string[] }): Promise<Buffer> {
    const c = await this.getReceipt(receiptNo, user);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (d) => chunks.push(d as Buffer));
    const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));
    doc.fontSize(20).fillColor('#7b1e2b').text('T.A.G FOREST YA KWANZA', { align: 'center' });
    doc.moveDown(0.3).fontSize(10).fillColor('#555').text('Official Contribution Receipt', { align: 'center' });
    doc.moveDown(1);
    doc.rect(50, doc.y, 495, 1).fill('#d4af37');
    doc.moveDown(1);
    doc.fillColor('#222').fontSize(12);
    const row = (label: string, value: string) => { doc.font('Helvetica-Bold').text(`${label}: `, { continued: true }).font('Helvetica').text(value); doc.moveDown(0.4); };
    row('Receipt Number', c.receiptNo || '-');
    row('Date', new Date(c.contributedAt).toLocaleString());
    row('Member Name', c.member?.fullName || '-');
    row('Member No', c.member?.memberNo || '-');
    row('Category', c.category);
    row('Amount', `TZS ${Number(c.amount).toLocaleString()}`);
    row('Payment Method', c.paymentMethod || '-');
    row('Reference', c.reference || '-');
    doc.moveDown(1);
    doc.rect(50, doc.y, 495, 1).fill('#d4af37');
    doc.moveDown(1).fontSize(9).fillColor('#666').text('Thank you for your contribution. This receipt is system generated.', { align: 'center' });
    doc.end();
    return done;
  }

  private async generateInvoiceNo(tx: Prisma.TransactionClient) {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`invoice:${year}`}))`;
    const count = await tx.invoice.count({ where: { invoiceNo: { startsWith: prefix } } });
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }

  private async recalculateInvoiceStatus(invoiceId: string, tx?: Prisma.TransactionClient) {
    const db = tx || this.prisma;
    const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, select: { id: true, total: true, status: true, dueDate: true } });
    if (!invoice) return null;
    const paidAgg = await db.contribution.aggregate({ _sum: { amount: true }, where: { invoiceId, status: PaymentStatus.CONFIRMED } });
    const paid = Number(paidAgg._sum.amount || 0);
    const total = Number(invoice.total || 0);
    let status = invoice.status;
    if (invoice.status !== InvoiceStatus.DRAFT && invoice.status !== InvoiceStatus.CANCELLED) {
      if (total > 0 && paid >= total) status = InvoiceStatus.PAID;
      else if (paid > 0) status = InvoiceStatus.PARTIALLY_PAID;
      else if (invoice.dueDate && invoice.dueDate < new Date()) status = InvoiceStatus.OVERDUE;
      else if (invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.ISSUED) status = invoice.status;
      else status = InvoiceStatus.ISSUED;
    }
    await db.invoice.update({ where: { id: invoiceId }, data: { status } });
    return { paid, total, outstanding: Math.max(total - paid, 0), status };
  }

  async listInvoices() {
    const invoices = await this.prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        member: { select: { id: true, fullName: true, memberNo: true, phone: true, whatsappNumber: true, email: true } },
        campaign: { select: { id: true, name: true } },
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });
    const ids = invoices.map((i) => i.id);
    const payments = ids.length ? await this.prisma.contribution.groupBy({ by: ['invoiceId'], _sum: { amount: true }, where: { invoiceId: { in: ids }, status: PaymentStatus.CONFIRMED } }) : [];
    const paidMap = new Map(payments.map((p) => [p.invoiceId, Number(p._sum.amount || 0)]));
    return invoices.map((invoice) => {
      const paid = paidMap.get(invoice.id) || 0;
      const total = Number(invoice.total);
      return { ...invoice, paidAmount: paid, outstandingAmount: Math.max(total - paid, 0) };
    });
  }

  async getInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        member: { select: { id: true, fullName: true, memberNo: true, phone: true, whatsappNumber: true, email: true, address: true } },
        campaign: { select: { id: true, name: true } },
        items: { orderBy: { sortOrder: 'asc' } },
        contributions: { orderBy: { contributedAt: 'desc' }, include: { recordedBy: { select: { email: true } } } },
        createdBy: { select: { email: true } },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const paid = invoice.contributions.filter((c) => c.status === PaymentStatus.CONFIRMED).reduce((sum, c) => sum + Number(c.amount), 0);
    const total = Number(invoice.total);
    return { ...invoice, paidAmount: paid, outstandingAmount: Math.max(total - paid, 0) };
  }

  async createInvoices(dto: any, actorId?: string) {
    const items = Array.isArray(dto.items) ? dto.items : [];
    if (!items.length) throw new BadRequestException('At least one line item is required');
    const normalizedItems = items.map((item: any, index: number) => {
      const amount = Number(item.amount);
      if (!item.description || !String(item.description).trim()) throw new BadRequestException('Each line item requires a description');
      if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Each line item amount must be greater than 0');
      return { description: String(item.description).trim(), amount, sortOrder: index };
    });
    const subtotal = normalizedItems.reduce((sum: number, item: any) => sum + item.amount, 0);
    const status = dto.status === 'ISSUED' ? InvoiceStatus.ISSUED : InvoiceStatus.DRAFT;
    const issueDate = dto.issueDate ? new Date(dto.issueDate) : new Date();
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : null;

    let recipients: any[] = [];
    if (Array.isArray(dto.recipients) && dto.recipients.length) {
      recipients = dto.recipients;
    } else if (Array.isArray(dto.memberIds) && dto.memberIds.length) {
      recipients = dto.memberIds.map((id: string) => ({ memberId: id }));
    } else {
      recipients = [{ memberId: dto.memberId, recipientName: dto.recipientName, recipientEmail: dto.recipientEmail, recipientPhone: dto.recipientPhone, recipientAddress: dto.recipientAddress }];
    }

    const resolved: any[] = [];
    for (const recipient of recipients) {
      if (recipient.memberId) {
        const member = await this.prisma.member.findUnique({ where: { id: recipient.memberId }, select: { id: true, fullName: true, email: true, phone: true, whatsappNumber: true, address: true } });
        if (!member) throw new NotFoundException(`Member not found: ${recipient.memberId}`);
        resolved.push({
          memberId: member.id,
          recipientName: recipient.recipientName || member.fullName,
          recipientEmail: recipient.recipientEmail || member.email || null,
          recipientPhone: this.normalizePhoneOptional(recipient.recipientPhone || member.phone),
          recipientWhatsapp: this.normalizePhoneOptional(recipient.recipientWhatsapp || member.whatsappNumber || member.phone),
          recipientAddress: recipient.recipientAddress || member.address || null,
        });
      } else {
        if (!recipient.recipientName || !String(recipient.recipientName).trim()) {
          throw new BadRequestException('Recipient name is required for unregistered/ad-hoc invoices');
        }
        resolved.push({
          memberId: null,
          recipientName: String(recipient.recipientName).trim(),
          recipientEmail: recipient.recipientEmail || null,
          recipientPhone: this.normalizePhoneOptional(recipient.recipientPhone),
          recipientWhatsapp: this.normalizePhoneOptional(recipient.recipientWhatsapp || recipient.recipientPhone),
          recipientAddress: recipient.recipientAddress || null,
        });
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const invoices: any[] = [];
      for (const recipient of resolved) {
        const invoiceNo = await this.generateInvoiceNo(tx);
        const invoice = await tx.invoice.create({
          data: {
            invoiceNo,
            status,
            memberId: recipient.memberId,
            recipientName: recipient.recipientName,
            recipientEmail: recipient.recipientEmail,
            recipientPhone: recipient.recipientPhone,
            recipientWhatsapp: recipient.recipientWhatsapp,
            recipientAddress: recipient.recipientAddress,
            campaignId: dto.campaignId || null,
            category: dto.category || null,
            title: dto.title || null,
            currency: 'TZS',
            issueDate,
            dueDate,
            subtotal: subtotal as any,
            total: subtotal as any,
            notes: dto.notes || null,
            paymentInstructions: dto.paymentInstructions || null,
            createdById: actorId || null,
            items: { create: normalizedItems.map((item: any) => ({ description: item.description, amount: item.amount as any, sortOrder: item.sortOrder })) },
          },
          include: { items: true, member: { select: { id: true, fullName: true, memberNo: true } } },
        });
        invoices.push(invoice);
      }
      return invoices;
    });

    for (const invoice of created) {
      await this.prisma.auditLog.create({
        data: {
          actorId: actorId || null,
          action: 'INVOICE_CREATED',
          entityType: 'Invoice',
          entityId: invoice.id,
          metadata: { invoiceNo: invoice.invoiceNo, total: subtotal, status, memberId: invoice.memberId, category: dto.category || null },
        },
      });
    }

    return created.length === 1 ? created[0] : { count: created.length, invoices: created };
  }

  async recordInvoicePayment(invoiceId: string, dto: any, actorId?: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId }, include: { items: true } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === InvoiceStatus.CANCELLED) throw new BadRequestException('Cannot record payment against a cancelled invoice');
    if (!dto.amount || Number(dto.amount) <= 0) throw new BadRequestException('Amount must be greater than 0');

    const category = dto.category || (invoice.notes?.includes('UJENZI') ? 'UJENZI' : null) || 'GENERAL_DONATION';
    const result = await this.prisma.$transaction(async (tx) => {
      const current = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!current) throw new NotFoundException('Invoice not found');
      const paidAgg = await tx.contribution.aggregate({ _sum: { amount: true }, where: { invoiceId, status: PaymentStatus.CONFIRMED } });
      const paid = Number(paidAgg._sum.amount || 0);
      const outstanding = Math.max(Number(current.total) - paid, 0);
      if (outstanding <= 0) throw new BadRequestException('Invoice is already fully paid');
      if (Number(dto.amount) > outstanding) throw new BadRequestException(`Payment exceeds outstanding amount (${outstanding})`);

      const receiptNo = await this.generateReceiptNo(tx);
      const contribution = await tx.contribution.create({
        data: {
          memberId: current.memberId,
          recordedById: actorId || null,
          invoiceId,
          campaignId: current.campaignId,
          receiptNo,
          category,
          amount: dto.amount as any,
          currency: current.currency || 'TZS',
          paymentMethod: dto.method,
          reference: dto.reference || null,
          notes: dto.notes || null,
          status: PaymentStatus.CONFIRMED,
          contributedAt: new Date(),
        },
      });
      const statusInfo = await this.recalculateInvoiceStatus(invoiceId, tx);
      return { contribution, statusInfo, receiptNo };
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        action: 'INVOICE_PAYMENT_RECORDED',
        entityType: 'Invoice',
        entityId: invoiceId,
        metadata: { receiptNo: result.receiptNo, amount: dto.amount, method: dto.method, invoiceStatus: result.statusInfo?.status },
      },
    });
    return { receiptNo: result.receiptNo, contribution: result.contribution, invoice: await this.getInvoice(invoiceId) };
  }

  async generateInvoicePdf(id: string) {
    const invoice = await this.getInvoice(id);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (d) => chunks.push(d as Buffer));
    const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    const logoPath = resolve(process.cwd(), '../frontend/public/logos/logo.png');
    const headerY = 45;
    if (existsSync(logoPath)) {
      try { doc.image(logoPath, 50, headerY, { fit: [60, 60] }); } catch {}
    }
    const textX = existsSync(logoPath) ? 120 : 50;
    doc.fontSize(20).fillColor('#7b1e2b').text('T.A.G FOREST YA KWANZA', textX, headerY, { align: 'left' });
    doc.fontSize(10).fillColor('#555').text('Official Church Invoice', textX, headerY + 26);
    doc.fontSize(10).fillColor('#222').text(`Invoice No: ${invoice.invoiceNo}`, 350, headerY, { align: 'right' });
    doc.text(`Status: ${invoice.status}`, 350, headerY + 15, { align: 'right' });
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 350, headerY + 30, { align: 'right' });
    doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}`, 350, headerY + 45, { align: 'right' });

    doc.moveDown(4);
    doc.rect(50, doc.y, 495, 1).fill('#d4af37');
    doc.moveDown(1);
    doc.fillColor('#222').fontSize(11).font('Helvetica-Bold').text('Bill To');
    doc.font('Helvetica').fontSize(10).text(invoice.recipientName || invoice.member?.fullName || '—');
    if (invoice.member?.memberNo) doc.text(`Member No: ${invoice.member.memberNo}`);
    if (invoice.category) doc.text(`Category: ${String(invoice.category).replaceAll('_', ' ')}`);
    if (invoice.recipientEmail || invoice.member?.email) doc.text(`Email: ${invoice.recipientEmail || invoice.member?.email}`);
    const phone = invoice.recipientPhone || invoice.member?.phone;
    const wa = invoice.recipientWhatsapp || invoice.member?.whatsappNumber || phone;
    if (phone) doc.text(`Phone: ${phone}`);
    if (wa && wa !== phone) doc.text(`WhatsApp: ${wa}`);
    if (invoice.recipientAddress) doc.text(`Address: ${invoice.recipientAddress}`);

    doc.moveDown(1);
    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#fff');
    doc.rect(50, tableTop, 495, 22).fill('#6b1f2b');
    doc.fillColor('#fff').text('Description', 60, tableTop + 6, { width: 340 });
    doc.text('Amount (TZS)', 410, tableTop + 6, { width: 125, align: 'right' });
    let y = tableTop + 30;
    doc.font('Helvetica').fillColor('#222');
    for (const item of invoice.items || []) {
      if (y > 720) { doc.addPage(); y = 60; }
      doc.text(item.description, 60, y, { width: 340 });
      doc.text(Number(item.amount).toLocaleString(), 410, y, { width: 125, align: 'right' });
      y += 22;
      doc.rect(50, y - 6, 495, 0.5).fill('#eadfce');
      doc.fillColor('#222');
    }
    y += 8;
    const row = (label: string, value: string, bold = false) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').text(label, 320, y, { width: 90, align: 'right' });
      doc.text(value, 420, y, { width: 115, align: 'right' });
      y += 18;
    };
    row('Subtotal:', `TZS ${Number(invoice.subtotal).toLocaleString()}`);
    row('Paid:', `TZS ${Number(invoice.paidAmount).toLocaleString()}`);
    row('Outstanding:', `TZS ${Number(invoice.outstandingAmount).toLocaleString()}`, true);
    let noteY = y + 8;
    if (invoice.paymentInstructions) {
      doc.font('Helvetica-Bold').text('Payment Instructions', 50, noteY);
      doc.font('Helvetica').text(invoice.paymentInstructions, 50, noteY + 14, { width: 495 });
      noteY = doc.y + 8;
    }
    if (invoice.notes) {
      doc.font('Helvetica-Bold').text('Notes', 50, noteY);
      doc.font('Helvetica').text(invoice.notes, 50, noteY + 14, { width: 495 });
    }
    doc.fontSize(9).fillColor('#666').text('Thank you for your support. This invoice is system generated.', 50, 770, { align: 'center', width: 495 });
    doc.end();
    return done;
  }
  // Budgets (FINANCE_ADMIN manages; SYSTEM_ADMIN reads via oversight)
  async listBudgets() {
    return this.prisma.budget.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createBudget(dto: any, actorId?: string) {
    if (!dto?.name || !dto?.amount) throw new BadRequestException('Budget name and amount are required');
    const amount = Number(dto.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Amount must be a positive number');
    const budget = await this.prisma.budget.create({
      data: {
        name: dto.name,
        category: dto.category || null,
        amount: amount as any,
        period: dto.period || null,
        status: dto.status || 'PLANNED',
        notes: dto.notes || null,
      },
    });
    await this.prisma.auditLog.create({
      data: { actorId: actorId || null, action: 'BUDGET_CREATED', entityType: 'Budget', entityId: budget.id, metadata: { name: budget.name, amount } },
    }).catch(() => null);
    return budget;
  }

  async updateBudget(id: string, dto: any, actorId?: string) {
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.category !== undefined) data.category = dto.category || null;
    if (dto.amount !== undefined) {
      const amount = Number(dto.amount);
      if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Amount must be a positive number');
      data.amount = amount;
    }
    if (dto.period !== undefined) data.period = dto.period || null;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.notes !== undefined) data.notes = dto.notes || null;
    const budget = await this.prisma.budget.update({ where: { id }, data });
    await this.prisma.auditLog.create({
      data: { actorId: actorId || null, action: 'BUDGET_UPDATED', entityType: 'Budget', entityId: id, metadata: dto },
    }).catch(() => null);
    return budget;
  }

  async deleteBudget(id: string, actorId?: string) {
    await this.prisma.auditLog.create({
      data: { actorId: actorId || null, action: 'BUDGET_DELETED', entityType: 'Budget', entityId: id, metadata: {} },
    }).catch(() => null);
    return this.prisma.budget.delete({ where: { id } });
  }

  // Member self-service
  async myPledges(userId: string) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) return { member: null, pledges: [], totals: { count: 0, amount: 0 } };
    const pledges = await this.prisma.pledge.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' },
    });
    const totalAmount = pledges.reduce((sum, p) => sum + Number(p.amount), 0);
    return { member: { id: member.id, fullName: member.fullName, memberNo: member.memberNo }, pledges, totals: { count: pledges.length, amount: totalAmount } };
  }

  async myReceipts(userId: string) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) return { member: null, receipts: [] };
    const contributions = await this.prisma.contribution.findMany({
      where: { memberId: member.id, receiptNo: { not: null } },
      orderBy: { contributedAt: 'desc' },
      select: { id: true, receiptNo: true, category: true, amount: true, currency: true, paymentMethod: true, reference: true, status: true, contributedAt: true },
    });
    return { member: { id: member.id, fullName: member.fullName, memberNo: member.memberNo }, receipts: contributions };
  }

  async canAccessReceipt(receiptNo: string, userId?: string): Promise<boolean> {
    if (!userId) return false;
    const contribution = await this.prisma.contribution.findUnique({
      where: { receiptNo },
      include: { member: { select: { userId: true } } },
    });
    return !!contribution && contribution.member?.userId === userId;
  }

  async logInvoiceWhatsappShare(invoiceId: string, actorId?: string, messageBody?: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId }, include: { member: true } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const recipientPhone = invoice.recipientWhatsapp || invoice.recipientPhone || invoice.member?.whatsappNumber || invoice.member?.phone;
    if (!recipientPhone) throw new BadRequestException('No WhatsApp/phone number available for this invoice');
    const log = await this.prisma.whatsAppMessageLog.create({
      data: {
        memberId: invoice.memberId,
        invoiceId: invoice.id,
        createdById: actorId || null,
        recipientName: invoice.recipientName || invoice.member?.fullName || null,
        recipientPhone,
        messageType: 'INVOICE' as any,
        documentNo: invoice.invoiceNo,
        messageBody: messageBody || null,
        status: 'OPENED' as any,
        provider: 'CLICK_TO_CHAT',
        openedAt: new Date(),
        attemptCount: 1,
      },
    });
    await this.prisma.auditLog.create({
      data: { actorId: actorId || null, action: 'WHATSAPP_SHARE_INITIATED', entityType: 'Invoice', entityId: invoice.id, metadata: { invoiceNo: invoice.invoiceNo, recipientPhone, logId: log.id } },
    }).catch(() => null);
    return log;
  }

  async listWhatsappLogs() {
    return this.prisma.whatsAppMessageLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { member: { select: { id: true, fullName: true, memberNo: true } }, invoice: { select: { id: true, invoiceNo: true } } },
    });
  }

  async listAccounts() {
    return this.prisma.financialAccount.findMany({ orderBy: { name: 'asc' } });
  }

  async financeAuditTrail() {
    return this.prisma.auditLog.findMany({
      where: { action: { in: ['PAYMENT_RECORDED','INVOICE_CREATED','INVOICE_PAYMENT_RECORDED','WHATSAPP_SHARE_INITIATED','PLEDGE_RECORDED','EXPENSE_RECORDED','BUDGET_CREATED','BUDGET_UPDATED','BUDGET_DELETED','MEMBER_CONTACT_UPDATED'] } },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { actor: { select: { email: true } } },
    });
  }
}
