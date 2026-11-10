import pptxgen from "pptxgenjs"

export const generatePpt = async (data) => {
    const pptx = new pptxgen()
    pptx.layout = "LAYOUT_WIDE"
    pptx.author = "NexusAI"
    pptx.title = data.title || "Presentation"

    // title slide
    const titleSlide = pptx.addSlide()
    titleSlide.background = { color: "111827" }

    titleSlide.addText(data.title || "", {
        x: 0.8, y: 2.3, w: 11.7, h: 1.5,
        fontSize: 40, bold: true, color: "FFFFFF", align: "center", fontFace: "Calibri"
    })

    if (data.subtitle) {
        titleSlide.addText(data.subtitle, {
            x: 0.8, y: 3.9, w: 11.7, h: 0.8,
            fontSize: 20, color: "A5B4FC", align: "center", fontFace: "Calibri"
        })
    }

    // content slides
    for (const item of data.slides || []) {
        const slide = pptx.addSlide()
        slide.background = { color: "F9FAFB" }

        // header bar
        slide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: 13.33, h: 1.2,
            fill: { color: "4F46E5" }
        })

        slide.addText(item.title || "", {
            x: 0.6, y: 0.15, w: 12.1, h: 0.9,
            fontSize: 28, bold: true, color: "FFFFFF", fontFace: "Calibri"
        })

        slide.addText(
            (item.points || []).map((point) => ({
                text: String(point),
                options: { bullet: true, breakLine: true }
            })),
            {
                x: 0.8, y: 1.6, w: 11.7, h: 5.2,
                fontSize: 20, color: "1F2937", valign: "top",
                paraSpaceAfter: 12, fontFace: "Calibri"
            }
        )
    }

    return await pptx.write({ outputType: "nodebuffer" })
}