const express = require("express");
const fs = require("fs");

const path = require("path");
const PDFDocument = require("pdfkit");

const router = express.Router();

// Endpoint to generate a PDF
router.post("/generate-pdf", (req, res) => {
    const data = req.body;
  
    // Path to the output directory
    const outputDir = path.join(__dirname, "output");
  
    // Ensure the directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  
    // Path to save the generated PDF
    const filePath = path.join(outputDir, "generated.pdf");
  
    // Create a new PDF document
    const doc = new PDFDocument();
  
    // Pipe the PDF stream to a file
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
  
    // Add content to the PDF
    doc.fontSize(16).text(data.title || "Default Title", { align: "center" });
    doc.moveDown();
    doc.text(data.subtitle || "Default Subtitle", { align: "center" });
  
    doc.moveDown();
    data.content?.forEach((section) => {
      doc.fontSize(14).text(section.heading, { underline: true });
      if (section.subheading) {
        doc.moveDown(0.5).fontSize(12).text(section.subheading);
      }
      if (section.text) {
        doc.moveDown(0.5).fontSize(10).text(section.text);
      }
      if (section.links) {
        doc.moveDown(0.5);
        section.links.forEach((link) => {
          doc.fontSize(10).fillColor("blue").text(link.label, { link: link.url });
        });
        doc.fillColor("black");
      }
      doc.moveDown();
    });
  
    // Finalize the PDF
    doc.end();
  
    writeStream.on("finish", () => {
      res.status(201).json({ success: true, message: "PDF generated!", filePath });
    });
  
    writeStream.on("error", (error) => {
      console.error("Error writing PDF:", error);
      res.status(500).json({ success: false, message: "Error generating PDF." });
    });
  });
  

// Endpoint to download the PDF
router.get("/download-pdf", (req, res) => {
    const filePath = path.join(__dirname, "output", "generated.pdf");
  
    // Check if file exists
    if (fs.existsSync(filePath)) {
      res.download(filePath, "generated.pdf", (err) => {
        if (err) {
          console.error("Error downloading PDF:", err);
          res.status(500).json({ success: false, message: "Error downloading PDF." });
        }
      });
    } else {
      res.status(404).json({ success: false, message: "PDF not found." });
    }
  });


module.exports = router;

