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
}

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

export const invoiceTemplates = {
  // Modern Premium Template - Full featured with gradient and gold accents
  modernPremium: (
    invoice: InvoiceData,
    company: CompanyDetails,
    template?: InvoiceTemplate
  ): string => {
    const logoHTML = template?.logoUrl || company.logo 
      ? `<img src="${template?.logoUrl || company.logo}" alt="${company.name}" style="width: 80px; height: 80px; object-fit: contain;" />`
      : '';

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

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; color: #333; }
    .header { background: linear-gradient(135deg, #8B0000 0%, #6B0000 100%); color: white; padding: 40px; display: flex; justify-content: space-between; align-items: start; }
    .header-left { display: flex; gap: 20px; align-items: center; }
    .logo { width: 80px; height: 80px; background: white; border-radius: 8px; padding: 5px; display: flex; align-items: center; justify-content: center; }
    .logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .company-header { display: flex; flex-direction: column; }
    .company-name { font-size: 28px; font-weight: bold; margin-bottom: 5px; color: #D4AF37; }
    .company-tagline { font-size: 12px; color: rgba(255, 255, 255, 0.9); }
    .invoice-title { font-size: 36px; font-weight: bold; color: #D4AF37; margin-bottom: 5px; }
    .invoice-number { font-size: 14px; color: #D4AF37; }
    .divider { height: 3px; background: linear-gradient(90deg, #D4AF37, #8B0000, #D4AF37); margin: 0; }
    .content { padding: 40px; }
    .info-row { display: flex; gap: 80px; margin-bottom: 40px; }
    .info-column { flex: 1; }
    .section-title { font-size: 11px; font-weight: bold; color: #8B0000; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
    .company-details { font-size: 11px; line-height: 1.8; color: #666; }
    .company-details strong { color: #333; }
    .bill-to { margin-bottom: 40px; }
    .bill-to-name { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px; }
    .bill-to-details { font-size: 11px; color: #666; line-height: 1.8; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    thead { background-color: #8B0000; color: #D4AF37; }
    thead th { padding: 15px; text-align: left; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    tbody td { padding: 12px 15px; font-size: 11px; color: #333; }
    .text-right { text-align: right; }
    .totals { margin-bottom: 30px; text-align: right; }
    .total-row { display: flex; justify-content: flex-end; gap: 20px; font-size: 12px; margin-bottom: 8px; padding: 8px 0; }
    .total-label { min-width: 120px; font-weight: 500; color: #666; }
    .total-amount { min-width: 100px; text-align: right; color: #333; }
    .grand-total { background: #8B0000; color: #D4AF37; padding: 15px; margin: 20px 0; display: flex; justify-content: space-between; border-radius: 4px; }
    .grand-total-label { font-size: 14px; font-weight: bold; }
    .grand-total-amount { font-size: 18px; font-weight: bold; }
    .payment-status { display: flex; justify-content: flex-end; gap: 20px; font-size: 12px; margin-top: 20px; }
    .paid { color: #16a34a; font-weight: bold; }
    .balance { color: #dc2626; font-weight: bold; }
    .notes-section, .terms-section, .bank-section { margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
    .section-heading { font-size: 12px; font-weight: bold; color: #333; margin-bottom: 10px; text-transform: uppercase; }
    .section-content { font-size: 11px; color: #666; line-height: 1.6; }
    .footer { text-align: center; font-size: 10px; color: #999; padding: 20px; border-top: 1px solid #e0e0e0; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      ${logoHTML ? `<div class="logo">${logoHTML}</div>` : ''}
      <div class="company-header">
        <div class="company-name">${company.name}</div>
        <div class="company-tagline">Professional Invoice</div>
      </div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-number">${invoice.invoiceNumber}</div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="content">
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
      <div class="info-column" style="text-align: right;">
        <div style="font-size: 11px; color: #666;"><span style="font-weight: bold;">Issue Date:</span> ${formatDate(invoice.issueDate)}</div>
        <div style="font-size: 11px; color: #666;"><span style="font-weight: bold;">Due Date:</span> ${formatDate(invoice.dueDate)}</div>
      </div>
    </div>
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
    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemsHTML || '<tr><td colspan="4" style="text-align: center; color: #999; font-style: italic; padding: 20px;">No items added</td></tr>'}</tbody>
    </table>
    <div class="totals">
      <div class="total-row">
        <div class="total-label">Subtotal:</div>
        <div class="total-amount">${formatCurrency(invoice.subtotal)}</div>
      </div>
      ${invoice.discountAmount && invoice.discountAmount > 0 ? `<div class="total-row"><div class="total-label">Discount:</div><div class="total-amount">-${formatCurrency(invoice.discountAmount)}</div></div>` : ''}
      ${invoice.cgstAmount && invoice.cgstAmount > 0 ? `<div class="total-row"><div class="total-label">CGST (${invoice.cgstRate}%):</div><div class="total-amount">${formatCurrency(invoice.cgstAmount)}</div></div>` : ''}
      ${invoice.sgstAmount && invoice.sgstAmount > 0 ? `<div class="total-row"><div class="total-label">SGST (${invoice.sgstRate}%):</div><div class="total-amount">${formatCurrency(invoice.sgstAmount)}</div></div>` : ''}
      ${invoice.igstAmount && invoice.igstAmount > 0 ? `<div class="total-row"><div class="total-label">IGST (${invoice.igstRate}%):</div><div class="total-amount">${formatCurrency(invoice.igstAmount)}</div></div>` : ''}
      <div class="grand-total">
        <div class="grand-total-label">TOTAL:</div>
        <div class="grand-total-amount">${formatCurrency(invoice.totalAmount)}</div>
      </div>
    </div>
    ${invoice.paidAmount && invoice.paidAmount > 0 ? `<div class="payment-status"><div><span>Paid:</span> <span class="paid">${formatCurrency(invoice.paidAmount)}</span></div><div><span>Balance Due:</span> <span class="balance">${formatCurrency(invoice.balanceDue || 0)}</span></div></div>` : ''}
    ${invoice.notes ? `<div class="notes-section"><div class="section-heading">Notes</div><div class="section-content">${invoice.notes}</div></div>` : ''}
    ${invoice.termsAndConditions || template?.termsAndConditions ? `<div class="terms-section"><div class="section-heading">Terms & Conditions</div><div class="section-content">${invoice.termsAndConditions || template?.termsAndConditions || ''}</div></div>` : ''}
    ${template?.showBankDetails && (template?.bankName || template?.bankAccountNumber || company.bankName) ? `<div class="bank-section"><div class="section-heading">Bank Details</div><div class="section-content">${template?.bankName || company.bankName ? `<div>Bank: ${template?.bankName || company.bankName}</div>` : ''}${template?.bankAccountNumber || company.bankAccountNumber ? `<div>Account No: ${template?.bankAccountNumber || company.bankAccountNumber}</div>` : ''}${template?.bankIfsc || company.bankIfsc ? `<div>IFSC: ${template?.bankIfsc || company.bankIfsc}</div>` : ''}${template?.bankBranch || company.bankBranch ? `<div>Branch: ${template?.bankBranch || company.bankBranch}</div>` : ''}</div></div>` : ''}
    ${template?.showUpi && (template?.upiId || company.upiId) ? `<div style="margin-top: 20px; font-size: 11px; color: #666;">UPI: ${template?.upiId || company.upiId}</div>` : ''}
  </div>
  <div class="footer">${template?.footerText || 'Thank you for your business!'}</div>
</body>
</html>`;
  },

  // Clean Minimal Template - Simple, professional, no frills
  cleanMinimal: (
    invoice: InvoiceData,
    company: CompanyDetails,
    template?: InvoiceTemplate
  ): string => {
    const logoHTML = template?.logoUrl || company.logo
      ? `<img src="${template?.logoUrl || company.logo}" alt="${company.name}" style="width: 70px; height: 70px; object-fit: contain;" />`
      : '';

    const itemsHTML = invoice.items
      ? invoice.items
          .map(
            (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center; width: 80px;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; width: 100px;">${formatCurrency(item.unitPrice)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; width: 100px;">${formatCurrency(item.amount)}</td>
        </tr>
      `
          )
          .join('')
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; color: #333; background: white; }
    .container { padding: 40px; max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #8B0000; padding-bottom: 20px; }
    .header-left { display: flex; gap: 20px; align-items: center; }
    .logo { width: 70px; height: 70px; }
    .logo img { max-width: 100%; height: auto; }
    .company-info h1 { font-size: 24px; color: #8B0000; margin-bottom: 5px; }
    .company-info p { font-size: 10px; color: #666; margin: 2px 0; }
    .invoice-header h2 { font-size: 32px; color: #8B0000; margin-bottom: 5px; }
    .invoice-header p { font-size: 12px; color: #666; }
    .dates { margin-bottom: 40px; }
    .dates p { font-size: 11px; margin: 5px 0; color: #666; }
    .dates strong { color: #333; }
    .row { display: flex; gap: 60px; margin-bottom: 30px; }
    .col { flex: 1; }
    .col h3 { font-size: 11px; font-weight: bold; color: #8B0000; margin-bottom: 8px; text-transform: uppercase; }
    .col p { font-size: 10px; color: #666; line-height: 1.6; margin: 3px 0; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    th { background: #8B0000; color: white; padding: 12px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .totals-section { margin-top: 30px; }
    .total-line { display: flex; justify-content: space-between; font-size: 11px; margin: 8px 0; }
    .total-line strong { color: #333; }
    .grand-total { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; color: white; background: #8B0000; padding: 12px; margin-top: 15px; }
    .footer { font-size: 9px; color: #999; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-left">
        ${logoHTML ? `<div class="logo">${logoHTML}</div>` : ''}
        <div class="company-info">
          <h1>${company.name}</h1>
          ${company.address ? `<p>${company.address}</p>` : ''}
          ${company.phone ? `<p>T: ${company.phone}</p>` : ''}
          ${company.email ? `<p>E: ${company.email}</p>` : ''}
        </div>
      </div>
      <div class="invoice-header">
        <h2>INVOICE</h2>
        <p>${invoice.invoiceNumber}</p>
      </div>
    </div>

    <div class="dates">
      <p><strong>Date:</strong> ${formatDate(invoice.issueDate)}</p>
      <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
    </div>

    <div class="row">
      <div class="col">
        <h3>Bill To</h3>
        <p>${invoice.clientName}</p>
        ${invoice.clientEmail ? `<p>${invoice.clientEmail}</p>` : ''}
        ${invoice.clientPhone ? `<p>${invoice.clientPhone}</p>` : ''}
        ${invoice.clientAddress ? `<p>${invoice.clientAddress}</p>` : ''}
      </div>
      <div class="col">
        ${company.taxId ? `<h3>Company Details</h3><p>GSTIN: ${company.taxId}</p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="width: 80px; text-align: center;">Qty</th>
          <th style="width: 100px; text-align: right;">Price</th>
          <th style="width: 100px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemsHTML || '<tr><td colspan="4" style="text-align: center; color: #999; padding: 20px;">No items</td></tr>'}</tbody>
    </table>

    <div class="totals-section">
      <div class="total-line"><span>Subtotal:</span><strong>${formatCurrency(invoice.subtotal)}</strong></div>
      ${invoice.discountAmount && invoice.discountAmount > 0 ? `<div class="total-line"><span>Discount:</span><strong>-${formatCurrency(invoice.discountAmount)}</strong></div>` : ''}
      ${invoice.cgstAmount && invoice.cgstAmount > 0 ? `<div class="total-line"><span>CGST (${invoice.cgstRate}%):</span><strong>${formatCurrency(invoice.cgstAmount)}</strong></div>` : ''}
      ${invoice.sgstAmount && invoice.sgstAmount > 0 ? `<div class="total-line"><span>SGST (${invoice.sgstRate}%):</span><strong>${formatCurrency(invoice.sgstAmount)}</strong></div>` : ''}
      ${invoice.igstAmount && invoice.igstAmount > 0 ? `<div class="total-line"><span>IGST (${invoice.igstRate}%):</span><strong>${formatCurrency(invoice.igstAmount)}</strong></div>` : ''}
      <div class="grand-total">
        <span>TOTAL:</span>
        <strong>${formatCurrency(invoice.totalAmount)}</strong>
      </div>
    </div>

    ${invoice.notes ? `<div style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;"><h3 style="font-size: 11px; color: #8B0000; margin-bottom: 8px;">Notes</h3><p style="font-size: 10px; color: #666;">${invoice.notes}</p></div>` : ''}

    <div class="footer">${template?.footerText || 'Thank you for your business!'}</div>
  </div>
</body>
</html>`;
  },

  // Corporate Professional Template - Traditional business look
  corporateProfessional: (
    invoice: InvoiceData,
    company: CompanyDetails,
    template?: InvoiceTemplate
  ): string => {
    const logoHTML = template?.logoUrl || company.logo
      ? `<img src="${template?.logoUrl || company.logo}" alt="${company.name}" style="width: 90px; height: 90px; object-fit: contain;" />`
      : '';

    const itemsHTML = invoice.items
      ? invoice.items
          .map(
            (item, idx) => `
        <tr ${idx % 2 === 1 ? 'style="background-color: #f9f9f9;"' : ''}>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatCurrency(item.unitPrice)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right; font-weight: bold;">${formatCurrency(item.amount)}</td>
        </tr>
      `
          )
          .join('')
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; color: #333; background: white; }
    .container { max-width: 850px; margin: 0 auto; padding: 40px; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #333; padding-bottom: 20px; }
    .company-logo-section { display: flex; gap: 20px; }
    .logo { width: 90px; height: 90px; }
    .logo img { max-width: 100%; height: auto; }
    .company-details-text h1 { font-size: 22px; font-weight: bold; color: #333; margin-bottom: 5px; }
    .company-details-text p { font-size: 10px; color: #666; margin: 2px 0; line-height: 1.4; }
    .invoice-info h2 { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 10px; letter-spacing: 2px; }
    .invoice-info p { font-size: 11px; color: #666; margin: 4px 0; }
    .meta-info { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; font-size: 10px; }
    .meta-info p { color: #666; margin: 5px 0; line-height: 1.6; }
    .meta-info strong { color: #333; display: block; font-weight: bold; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
    .party { font-size: 10px; }
    .party h4 { font-size: 11px; font-weight: bold; color: #333; margin-bottom: 8px; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .party p { color: #666; margin: 3px 0; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    thead th { background: #333; color: white; padding: 12px; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
    tbody td { padding: 11px 12px; font-size: 10px; color: #333; border-bottom: 1px solid #e5e5e5; }
    .totals { margin-top: 30px; display: flex; justify-content: flex-end; }
    .totals-box { width: 280px; }
    .total-row { display: flex; justify-content: space-between; font-size: 10px; padding: 8px 0; color: #666; border-bottom: 1px solid #ddd; }
    .total-row.final { font-size: 12px; font-weight: bold; color: #333; border: none; border-top: 2px solid #333; padding-top: 12px; margin-top: 8px; }
    .footer { text-align: center; font-size: 9px; color: #999; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
    .no-items { text-align: center; padding: 20px; color: #999; font-size: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-section">
      <div class="company-logo-section">
        ${logoHTML ? `<div class="logo">${logoHTML}</div>` : ''}
        <div class="company-details-text">
          <h1>${company.name}</h1>
          ${company.address ? `<p>${company.address}</p>` : ''}
          ${company.phone ? `<p>Phone: ${company.phone}</p>` : ''}
          ${company.email ? `<p>Email: ${company.email}</p>` : ''}
          ${company.taxId ? `<p><strong>GSTIN:</strong> ${company.taxId}</p>` : ''}
        </div>
      </div>
      <div class="invoice-info">
        <h2>INVOICE</h2>
        <p>${invoice.invoiceNumber}</p>
      </div>
    </div>

    <div class="meta-info">
      <div>
        <strong>Issue Date</strong>
        <p>${formatDate(invoice.issueDate)}</p>
        <strong>Due Date</strong>
        <p>${formatDate(invoice.dueDate)}</p>
      </div>
      <div></div>
    </div>

    <div class="parties">
      <div class="party">
        <h4>Bill To</h4>
        <p>${invoice.clientName}</p>
        ${invoice.clientEmail ? `<p>${invoice.clientEmail}</p>` : ''}
        ${invoice.clientPhone ? `<p>${invoice.clientPhone}</p>` : ''}
        ${invoice.clientAddress ? `<p>${invoice.clientAddress}</p>` : ''}
        ${invoice.clientGst ? `<p><strong>GSTIN:</strong> ${invoice.clientGst}</p>` : ''}
      </div>
      <div></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="width: 70px; text-align: center;">Quantity</th>
          <th style="width: 100px; text-align: right;">Unit Price</th>
          <th style="width: 100px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML || '<tr><td colspan="4" class="no-items">No items</td></tr>'}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="total-row"><span>Subtotal</span><span>${formatCurrency(invoice.subtotal)}</span></div>
        ${invoice.discountAmount && invoice.discountAmount > 0 ? `<div class="total-row"><span>Discount</span><span>-${formatCurrency(invoice.discountAmount)}</span></div>` : ''}
        ${invoice.cgstAmount && invoice.cgstAmount > 0 ? `<div class="total-row"><span>CGST (${invoice.cgstRate}%)</span><span>${formatCurrency(invoice.cgstAmount)}</span></div>` : ''}
        ${invoice.sgstAmount && invoice.sgstAmount > 0 ? `<div class="total-row"><span>SGST (${invoice.sgstRate}%)</span><span>${formatCurrency(invoice.sgstAmount)}</span></div>` : ''}
        ${invoice.igstAmount && invoice.igstAmount > 0 ? `<div class="total-row"><span>IGST (${invoice.igstRate}%)</span><span>${formatCurrency(invoice.igstAmount)}</span></div>` : ''}
        <div class="total-row final"><span>Total Due</span><span>${formatCurrency(invoice.totalAmount)}</span></div>
      </div>
    </div>

    ${invoice.notes ? `<div style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-left: 3px solid #333;"><p style="font-size: 10px; font-weight: bold; margin-bottom: 5px;">Special Notes</p><p style="font-size: 9px; color: #666;">${invoice.notes}</p></div>` : ''}

    <div class="footer">${template?.footerText || 'Thank you for your business!'}</div>
  </div>
</body>
</html>`;
  },
};

export type TemplateStyle = keyof typeof invoiceTemplates;

export const getTemplate = (style: TemplateStyle = 'modernPremium') => {
  return invoiceTemplates[style];
};

export const availableTemplates = [
  { id: 'modernPremium', name: 'Modern Premium', description: 'Professional with gradient header and gold accents' },
  { id: 'cleanMinimal', name: 'Clean Minimal', description: 'Simple and professional without extra styling' },
  { id: 'corporateProfessional', name: 'Corporate Professional', description: 'Traditional business-style invoice' },
];
