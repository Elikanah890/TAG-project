import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoicePaymentDto } from './dto/create-invoice-payment.dto';
import { Response } from 'express';
import { FinanceService } from './finance.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePledgeDto } from './dto/create-pledge.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/enums/roles.enum';

@Controller('finance')
export class FinanceController {
  constructor(private service: FinanceService) {}

  // OPERATIONAL (write) - FINANCE_ADMIN only. SYSTEM_ADMIN is overseer/read-only.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN)
  @Post('payments')
  record(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.service.recordPayment(dto, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN)
  @Post('pledges')
  createPledge(@Body() dto: CreatePledgeDto, @Req() req: any) {
    return this.service.createPledge(dto as any, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN)
  @Post('expenses')
  createExpense(@Body() dto: CreateExpenseDto, @Req() req: any) {
    return this.service.createExpense(dto as any, req.user?.userId);
  }

  // READ (member self)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CHURCH_MEMBER)
  @Get('my-contributions')
  mine(@Req() req: any) {
    return this.service.myContributions(req.user?.userId);
  }

  // READ / REPORTS - authorized finance staff and system overseer
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('members')
  members(@Query('q') q?: string) {
    return this.service.searchMembers(q);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('payments')
  listPayments() {
    return this.service.listPayments();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('receipts')
  listReceipts() {
    return this.service.listReceipts();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('pledges')
  listPledges() {
    return this.service.listPledges();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('expenses')
  listExpenses() {
    return this.service.listExpenses();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('reports')
  reports() {
    return this.service.financeReports();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('invoices')
  listInvoices() {
    return this.service.listInvoices();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('invoices/:id')
  getInvoice(@Param('id') id: string) {
    return this.service.getInvoice(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN)
  @Post('invoices')
  createInvoice(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    return this.service.createInvoices(dto, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN)
  @Post('invoices/:id/payments')
  recordInvoicePayment(@Param('id') id: string, @Body() dto: CreateInvoicePaymentDto, @Req() req: any) {
    return this.service.recordInvoicePayment(id, dto, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN)
  @Post('invoices/:id/whatsapp-log')
  logInvoiceWhatsapp(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.logInvoiceWhatsappShare(id, req.user?.userId, body?.messageBody);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('whatsapp-logs')
  whatsappLogs() {
    return this.service.listWhatsappLogs();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('accounts')
  accounts() {
    return this.service.listAccounts();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('audit-trail')
  auditTrail() {
    return this.service.financeAuditTrail();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('invoices/:id/pdf')
  async invoicePdf(@Param('id') id: string, @Res() res: Response) {
    const invoice = await this.service.getInvoice(id);
    const buf = await this.service.generateInvoicePdf(id);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${invoice.invoiceNo}.pdf"` });
    res.send(buf);
  }

  @UseGuards(JwtAuthGuard)
  @Get('receipts/:receiptNo/pdf')
  async receiptPdf(@Param('receiptNo') receiptNo: string, @Req() req: any, @Res() res: Response) {
    const roles: string[] = req.user?.roles || [];
    const isStaff = roles.includes(RoleName.FINANCE_ADMIN) || roles.includes(RoleName.SYSTEM_ADMIN);
    if (!isStaff && !(await this.service.canAccessReceipt(receiptNo, req.user?.userId))) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const buf = await this.service.generateReceiptPdf(receiptNo, req.user);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${receiptNo}.pdf"` });
    res.send(buf);
  }

  // Budgets: finance manages; system oversight read-only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN, RoleName.SYSTEM_ADMIN)
  @Get('budgets') budgets(){ return this.service.listBudgets(); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN)
  @Post('budgets') cBudget(@Body() b:any,@Req() r:any){ return this.service.createBudget(b,r.user?.userId); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN)
  @Put('budgets/:id') uBudget(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateBudget(id,b,r.user?.userId); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.FINANCE_ADMIN)
  @Delete('budgets/:id') dBudget(@Param('id') id:string,@Req() r:any){ return this.service.deleteBudget(id,r.user?.userId); }

  // Member self-service
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CHURCH_MEMBER)
  @Get('my-pledges') myPledges(@Req() req:any){ return this.service.myPledges(req.user?.userId); }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.CHURCH_MEMBER)
  @Get('my-receipts') myReceipts(@Req() req:any){ return this.service.myReceipts(req.user?.userId); }
}
