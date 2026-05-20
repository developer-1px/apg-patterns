# Bug 008: Carousel preview images have empty alt text while carrying slide content

- Progress: 100 / 100
- Status: Resolved
- Area: carousel preview
- Evidence: `demo/src/patterns/carousel/Carousel.tsx:56`
- Symptom: Slide images render with `alt=""` even though the image is the primary visual content of the slide.
- Impact: Screen reader users hear the slide title/caption but get no indication of the visual subject shown in the preview image.
- Reproduction:
  1. Open the Carousel preview.
  2. Inspect a slide image.
  3. The image is present but explicitly hidden from assistive text alternatives.
- Expected: If the image conveys the slide subject, it should have meaningful alt text or be described by slide content.
- Suggested fix: Add image alt text to carousel data and pass it through the preview.
- Resolution: Carousel slide data now includes `imageAlt`, and `demo/src/patterns/carousel/Carousel.tsx` passes it to each slide image.
