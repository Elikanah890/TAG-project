require('dotenv/config');
const { PrismaClient, InvoiceStatus, PaymentStatus } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });
(async()=>{
  const dto = {memberId:'cmwh357hb000041iogzzmp7x3',category:'UJENZI',status:'ISSUED',dueDate:'2026-12-31',items:[{description:'Ujenzi invoice Stage4 E2E',amount:500000}],notes:'UJENZI Stage4 E2E'};
  const actorId='cmwh2ukg90000peio6ks73vd3';
  const items=dto.items;
  const normalizedItems = items.map((item, index) => ({ description: String(item.description).trim(), amount: Number(item.amount), sortOrder: index }));
  const subtotal = normalizedItems.reduce((sum,item)=>sum+item.amount,0);
  const status = dto.status === 'ISSUED' ? InvoiceStatus.ISSUED : InvoiceStatus.DRAFT;
  const issueDate = new Date();
  const dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
  const member = await p.member.findUnique({ where: { id: dto.memberId }, select: { id: true, fullName: true, email: true, phone: true, address: true } });
  console.log('member', member);
  const recipient = { memberId: member.id, recipientName: member.fullName, recipientEmail: member.email, recipientPhone: member.phone, recipientAddress: member.address };
  const created = await p.$transaction(async (tx) => {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`invoice:${year}`}))`;
    const count = await tx.invoice.count({ where: { invoiceNo: { startsWith: prefix } } });
    const invoiceNo = `${prefix}${String(count + 1).padStart(4, '0')}`;
    console.log('invoiceNo', invoiceNo);
    const invoice = await tx.invoice.create({
      data: {
        invoiceNo,
        status,
        memberId: recipient.memberId,
        recipientName: recipient.recipientName,
        recipientEmail: recipient.recipientEmail,
        recipientPhone: recipient.recipientPhone,
        recipientAddress: recipient.recipientAddress,
        campaignId: null,
        currency: 'TZS',
        issueDate,
        dueDate,
        subtotal: subtotal,
        total: subtotal,
        notes: dto.notes || null,
        createdById: actorId || null,
        items: { create: normalizedItems.map((item) => ({ description: item.description, amount: item.amount, sortOrder: item.sortOrder })) },
      },
      include: { items: true, member: { select: { id: true, fullName: true, memberNo: true } } },
    });
    return invoice;
  });
  console.log('created', JSON.stringify(created,(k,v)=>typeof v==='bigint'?v.toString():v,2));
  await p.auditLog.create({ data: { actorId, action: 'INVOICE_CREATED', entityType: 'Invoice', entityId: created.id, metadata: { invoiceNo: created.invoiceNo, total: subtotal, status, memberId: created.memberId, category: dto.category || null } } });
  console.log('audit ok');
  await p.$disconnect(); await pool.end();
})().catch(async e=>{console.error('ERR',e); try{await p.$disconnect(); await pool.end();}catch{} process.exit(1)});
