import PDFDocument from "pdfkit";
import axios from "axios";

export async function generateBagReport(
  bag: any,
  user: any,
  description: string
) {
  return new Promise(async (resolve, reject) => {
    try {
     const doc = new PDFDocument().font('Helvetica').fontSize(24);
      const chunks: Buffer[] = [];

      // Collect PDF data chunks
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Add black bars
      doc.rect(0, 0, doc.page.width, 20).fill("black"); // Top bar
      doc.rect(0, doc.page.height - 20, doc.page.width, 20).fill("black"); // Bottom bar

      // Fetch the image from the URL
      try {
        async function fetchImage(src: string) {
          const image = await axios.get(src, {
            responseType: "arraybuffer",
          });
          return image.data;
        }

        const logo = await fetchImage(
          "https://s3.eu-west-1.amazonaws.com/velocity.static.assets/long_logo.png"
        );

        // Add the image to the PDF
        //@ts-ignore
        doc.image(logo, 50, 5, { width: 100 }); // Adjust size as needed
      } catch (imageError) {
        console.error("Error loading image:", imageError);
      }

      // Add content to PDF
      doc
        .fontSize(20)
        
        .text("Report", { align: "center" });
      doc.moveDown();

      // Bag Details
      doc.fontSize(16).text("Bag Details");
      doc.fontSize(12);
      doc.text(`Name: ${bag.name}`);
      doc.text(`Type: ${bag?.bagType?.name || "N/A"}`);
      doc.text(`Status: ${bag?.status || "N/A"}`);
      doc
        
        .text(
          `Reported At: ${
            bag.reportedAt ? new Date(bag.reportedAt).toLocaleString() : "N/A"
          }`
        );
      doc.text(`Description: ${description}`);
      doc.moveDown();

      // Owner Details
      doc.fontSize(16).text("Owner Details");
      doc.fontSize(12);
      doc.text(`Name: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.moveDown();

      // Tools List
      if (bag.tools && bag.tools.length > 0) {
        doc.fontSize(16).text("Tools");
        doc.fontSize(12);
        bag.tools.forEach((tool: any) => {
          doc
            
            .text(
              `- ${tool.brand} ${tool.type}: ${
                tool.description || "No description"
              }`
            );
        });
      }

      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
}
