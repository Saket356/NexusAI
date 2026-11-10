import PDFDocument from "pdfkit"

// built-in PDF fonts can't draw some characters (e.g. the non-breaking hyphen in your output)
const clean = (text = "") =>
    String(text)
        .replace(/[\u2010-\u2011]/g, "-")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u202F\u00A0]/g, " ")

export const generatePdf = async (data) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: 50,
            info: {
                Author: "NexusAI",
                Title: clean(data.title),
                Creator: "NexusAI"
            }
        })

        const chunks = []
        doc.on("data", (chunk) => chunks.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(chunks)))
        doc.on("error", reject)

        // title
        doc
            .fillColor("#111827")
            .fontSize(28)
            .font("Helvetica-Bold")
            .text(clean(data.title), { align: "center" })

        // subtitle
        if (data.subtitle) {
            doc
                .moveDown(0.5)
                .fillColor("#6B7280")
                .fontSize(13)
                .font("Helvetica")
                .text(clean(data.subtitle), { align: "center" })
        }

        doc.moveDown(1.5)

        // sections
        for (const section of data.sections || []) {
            doc
                .fillColor("#4F46E5")
                .fontSize(18)
                .font("Helvetica-Bold")
                .text(clean(section.heading))

            doc.moveDown(0.4)

            for (const point of section.points || []) {
                doc
                    .fillColor("#374151")
                    .fontSize(12)
                    .font("Helvetica")
                    .text(`•  ${clean(point)}`, { indent: 10, lineGap: 3 })
            }

            doc.moveDown(1)
        }

        doc.end()
    })
}