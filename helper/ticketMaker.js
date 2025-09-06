const drawTicket = (doc, ticketData, index) => {
    const yOffset = 250 * index;

    const logoPath = 'public/uploads/e-LankaNewFix.png';
    const logoWidth = 100;
    const logoHeight = 40;
    doc.image(logoPath, doc.page.width / 2 - logoWidth / 2, 30 + yOffset, { width: logoWidth });

    doc.strokeColor('#56a54f')
        .lineWidth(2)
        .moveTo(30, 120 + yOffset)
        .lineTo(doc.page.width - 60, 120 + yOffset)
        .stroke();

    doc.image(ticketData.qr_code_base64, 50, 140 + yOffset, { width: 100, height: 100 });

    const detailsX = 170;
    const detailsY = 140 + yOffset;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#333')
    doc.text('ID Ticket', detailsX, detailsY);
    doc.font('Helvetica').fontSize(10).text(ticketData.id_tiket, detailsX, detailsY + 15);

    doc.text('Email', detailsX, detailsY + 35);
    doc.text(ticketData.email_pembeli, detailsX, detailsY + 50);

    doc.text('ID Transaksi', detailsX, detailsY + 70);
    doc.text(ticketData.id_transaksi, detailsX, detailsY + 85);

    doc.font('Helvetica-Bold').fontSize(12).text(`${ticketData.gender} - ${ticketData.umur}`, 50, 250 + yOffset);

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#56a54f').text(
        `Rp. ${ticketData.harga}`,
        doc.page.width - 150,
        250 + yOffset,
        { align: 'right' }
    );

    doc.strokeColor('#56a54f')
        .lineWidth(2)
        .moveTo(30, 275 + yOffset)
        .lineTo(doc.page.width - 60, 275 + yOffset)
        .stroke();
}

module.exports = { drawTicket };
