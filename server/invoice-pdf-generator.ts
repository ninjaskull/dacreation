import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { getTemplate, TemplateStyle, availableTemplates } from './invoice-templates';

interface InvoiceData {
  invoiceNumber: string;
  issueDate: Date | string;
  dueDate: Date | string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientGst?: string;
  subtotal: number;
  discountAmount?: number;
  cgstAmount?: number;
  cgstRate?: number;
  sgstAmount?: number;
  sgstRate?: number;
  igstAmount?: number;
  igstRate?: number;
  totalAmount: number;
  paidAmount?: number;
  balanceDue?: number;
  notes?: string;
  termsAndConditions?: string;
  items?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

interface CompanyDetails {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  logo?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  upiId?: string;
}

interface InvoiceTemplate {
  logoUrl?: string;
  termsAndConditions?: string;
  footerText?: string;
  showBankDetails?: boolean;
  showUpi?: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  upiId?: string;
  templateStyle?: TemplateStyle;
}

class InvoicePDFGenerator {
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });
    }
    return this.browser;
  }

  async generateHTMLInvoice(
    invoice: InvoiceData,
    company: CompanyDetails,
    template?: InvoiceTemplate,
    templateStyle: TemplateStyle = 'modernPremium'
  ): Promise<string> {
    // Use the template style from template config or parameter
    const style = template?.templateStyle || templateStyle;
    const templateFunc = getTemplate(style);
    
    if (!templateFunc) {
      console.warn(`Template style '${style}' not found, using modernPremium`);
      return getTemplate('modernPremium')(invoice, company, template);
    }
    
    return templateFunc(invoice, company, template);
  }

  async generateHTMLInvoiceOld(
    invoice: InvoiceData,
    company: CompanyDetails,
    template?: InvoiceTemplate
  ): Promise<string> {
    const formatCurrency = (amt: number) =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(amt);

    const formatDate = (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-IN');
    };

    const itemsHTML = invoice.items
      ? invoice.items
          .map(
            (item, idx) => `
        <tr style="${idx % 2 === 0 ? 'background-color: #f5f5f5;' : ''}">
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">${formatCurrency(item.unitPrice)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">${formatCurrency(item.amount)}</td>
        </tr>
      `
          )
          .join('')
      : '';

    const logoHTML = template?.logoUrl || company.logo ? 
      `<img src="${template?.logoUrl || company.logo}" alt="${company.name}" style="width: 80px; height: 80px; object-fit: contain;" />` : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #fff;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }
    .header {
      background: linear-gradient(135deg, #8B0000 0%, #6B0000 100%);
      color: white;
      padding: 40px;
      display: flex;
      justify-content: space-between;
      align-items: start;
    }
    .header-left {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .logo {
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 8px;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .company-header {
      display: flex;
      flex-direction: column;
    }
    .company-name {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 5px;
      color: #D4AF37;
    }
    .company-tagline {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.9);
    }
    .header-right {
      text-align: right;
    }
    .invoice-title {
      font-size: 36px;
      font-weight: bold;
      color: #D4AF37;
      margin-bottom: 5px;
    }
    .invoice-number {
      font-size: 14px;
      color: #D4AF37;
    }
    .divider {
      height: 3px;
      background: linear-gradient(90deg, #D4AF37, #8B0000, #D4AF37);
      margin: 0;
    }
    .content {
      padding: 40px;
    }
    .info-row {
      display: flex;
      gap: 80px;
      margin-bottom: 40px;
    }
    .info-column {
      flex: 1;
    }
    .section-title {
      font-size: 11px;
      font-weight: bold;
      color: #8B0000;
      text-transform: uppercase;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    .company-details {
      font-size: 11px;
      line-height: 1.8;
      color: #666;
    }
    .company-details strong {
      color: #333;
    }
    .date-info {
      font-size: 11px;
      color: #666;
      line-height: 1.8;
    }
    .date-label {
      font-weight: bold;
      color: #333;
    }
    .bill-to {
      margin-bottom: 40px;
    }
    .bill-to-name {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    .bill-to-details {
      font-size: 11px;
      color: #666;
      line-height: 1.8;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    thead {
      background-color: #8B0000;
      color: #D4AF37;
    }
    thead th {
      padding: 15px;
      text-align: left;
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    tbody td {
      padding: 12px 15px;
      font-size: 11px;
      color: #333;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .totals {
      margin-bottom: 30px;
      text-align: right;
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      gap: 20px;
      font-size: 12px;
      margin-bottom: 8px;
      padding: 8px 0;
    }
    .total-label {
      min-width: 120px;
      font-weight: 500;
      color: #666;
    }
    .total-amount {
      min-width: 100px;
      text-align: right;
      color: #333;
    }
    .total-label.highlight {
      color: #8B0000;
      font-weight: bold;
    }
    .total-amount.highlight {
      color: #8B0000;
      font-weight: bold;
    }
    .grand-total {
      background: #8B0000;
      color: #D4AF37;
      padding: 15px;
      margin: 20px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 4px;
    }
    .grand-total-label {
      font-size: 14px;
      font-weight: bold;
    }
    .grand-total-amount {
      font-size: 18px;
      font-weight: bold;
    }
    .payment-status {
      display: flex;
      justify-content: flex-end;
      gap: 20px;
      font-size: 12px;
      margin-top: 20px;
    }
    .payment-item {
      display: flex;
      gap: 10px;
    }
    .paid {
      color: #16a34a;
      font-weight: bold;
    }
    .balance {
      color: #dc2626;
      font-weight: bold;
    }
    .notes-section,
    .terms-section,
    .bank-section {
      margin-top: 40px;
      border-top: 1px solid #e0e0e0;
      padding-top: 20px;
    }
    .section-heading {
      font-size: 12px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .section-content {
      font-size: 11px;
      color: #666;
      line-height: 1.6;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      color: #999;
      padding: 20px;
      border-top: 1px solid #e0e0e0;
      margin-top: 40px;
    }
    .no-items {
      text-align: center;
      color: #999;
      font-style: italic;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        ${logoHTML ? `<div class="logo">${logoHTML}</div>` : ''}
        <div class="company-header">
          <div class="company-name">${company.name}</div>
          <div class="company-tagline">Professional Invoice</div>
        </div>
      </div>
      <div class="header-right">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Content -->
    <div class="content">
      <!-- Company and Date Info -->
      <div class="info-row">
        <div class="info-column">
          <div class="section-title">From</div>
          <div class="company-details">
            ${company.address ? `<div><strong>${company.address}</strong></div>` : ''}
            ${company.phone ? `<div>T: ${company.phone}</div>` : ''}
            ${company.email ? `<div>E: ${company.email}</div>` : ''}
            ${company.taxId ? `<div style="color: #8B0000; font-weight: bold;">GSTIN: ${company.taxId}</div>` : ''}
          </div>
        </div>
        <div class="info-column">
          <div class="date-info">
            <div><span class="date-label">Issue Date:</span> ${formatDate(invoice.issueDate)}</div>
            <div><span class="date-label">Due Date:</span> ${formatDate(invoice.dueDate)}</div>
          </div>
        </div>
      </div>

      <!-- Bill To -->
      <div class="bill-to">
        <div class="section-title">Bill To</div>
        <div class="bill-to-name">${invoice.clientName || 'N/A'}</div>
        <div class="bill-to-details">
          ${invoice.clientEmail ? `<div>${invoice.clientEmail}</div>` : ''}
          ${invoice.clientPhone ? `<div>${invoice.clientPhone}</div>` : ''}
          ${invoice.clientAddress ? `<div>${invoice.clientAddress}</div>` : ''}
          ${invoice.clientGst ? `<div style="color: #8B0000; font-weight: bold;">GSTIN: ${invoice.clientGst}</div>` : ''}
        </div>
      </div>

      <!-- Items Table -->
      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML || '<tr><td colspan="4" class="no-items">No items added</td></tr>'}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals">
        <div class="total-row">
          <div class="total-label">Subtotal:</div>
          <div class="total-amount">${formatCurrency(invoice.subtotal)}</div>
        </div>
        ${invoice.discountAmount && invoice.discountAmount > 0 ? `
        <div class="total-row">
          <div class="total-label">Discount:</div>
          <div class="total-amount">-${formatCurrency(invoice.discountAmount)}</div>
        </div>
        ` : ''}
        ${invoice.cgstAmount && invoice.cgstAmount > 0 ? `
        <div class="total-row">
          <div class="total-label">CGST (${invoice.cgstRate}%):</div>
          <div class="total-amount">${formatCurrency(invoice.cgstAmount)}</div>
        </div>
        ` : ''}
        ${invoice.sgstAmount && invoice.sgstAmount > 0 ? `
        <div class="total-row">
          <div class="total-label">SGST (${invoice.sgstRate}%):</div>
          <div class="total-amount">${formatCurrency(invoice.sgstAmount)}</div>
        </div>
        ` : ''}
        ${invoice.igstAmount && invoice.igstAmount > 0 ? `
        <div class="total-row">
          <div class="total-label">IGST (${invoice.igstRate}%):</div>
          <div class="total-amount">${formatCurrency(invoice.igstAmount)}</div>
        </div>
        ` : ''}
        <div class="grand-total">
          <div class="grand-total-label">TOTAL:</div>
          <div class="grand-total-amount">${formatCurrency(invoice.totalAmount)}</div>
        </div>
      </div>

      <!-- Payment Status -->
      ${invoice.paidAmount && invoice.paidAmount > 0 ? `
      <div class="payment-status">
        <div class="payment-item">
          <span>Paid:</span>
          <span class="paid">${formatCurrency(invoice.paidAmount)}</span>
        </div>
        <div class="payment-item">
          <span>Balance Due:</span>
          <span class="balance">${formatCurrency(invoice.balanceDue || 0)}</span>
        </div>
      </div>
      ` : ''}

      <!-- Notes -->
      ${invoice.notes ? `
      <div class="notes-section">
        <div class="section-heading">Notes</div>
        <div class="section-content">${invoice.notes}</div>
      </div>
      ` : ''}

      <!-- Terms and Conditions -->
      ${invoice.termsAndConditions || template?.termsAndConditions ? `
      <div class="terms-section">
        <div class="section-heading">Terms & Conditions</div>
        <div class="section-content">${invoice.termsAndConditions || template?.termsAndConditions || ''}</div>
      </div>
      ` : ''}

      <!-- Bank Details -->
      ${template?.showBankDetails && (template?.bankName || template?.bankAccountNumber || company.bankName) ? `
      <div class="bank-section">
        <div class="section-heading">Bank Details</div>
        <div class="section-content">
          ${template?.bankName || company.bankName ? `<div>Bank: ${template?.bankName || company.bankName}</div>` : ''}
          ${template?.bankAccountNumber || company.bankAccountNumber ? `<div>Account No: ${template?.bankAccountNumber || company.bankAccountNumber}</div>` : ''}
          ${template?.bankIfsc || company.bankIfsc ? `<div>IFSC: ${template?.bankIfsc || company.bankIfsc}</div>` : ''}
          ${template?.bankBranch || company.bankBranch ? `<div>Branch: ${template?.bankBranch || company.bankBranch}</div>` : ''}
        </div>
      </div>
      ` : ''}

      <!-- UPI -->
      ${template?.showUpi && (template?.upiId || company.upiId) ? `
      <div style="margin-top: 20px; font-size: 11px; color: #666;">
        UPI: ${template?.upiId || company.upiId}
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      ${template?.footerText || 'Thank you for your business!'}
    </div>
  </div>
</body>
</html>
    `;
  }

  async generatePDFFromHTML(
    htmlContent: string,
    invoiceNumber: string
  ): Promise<Buffer> {
    const browser = await this.initialize();
    if (!browser) throw new Error('Failed to initialize Puppeteer');

    const page = await browser.newPage();
    try {
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.emulateMediaType('print');

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        printBackground: true,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  async generateInvoicePDF(
    invoice: InvoiceData,
    company: CompanyDetails,
    template?: InvoiceTemplate,
    templateStyle: TemplateStyle = 'modernPremium'
  ): Promise<Buffer> {
    const htmlContent = await this.generateHTMLInvoice(invoice, company, template, templateStyle);
    return this.generatePDFFromHTML(htmlContent, invoice.invoiceNumber);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export { InvoicePDFGenerator, InvoiceData, CompanyDetails, InvoiceTemplate, availableTemplates, TemplateStyle };
