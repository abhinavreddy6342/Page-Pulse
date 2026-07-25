export function analyzeAccessibility($) {
  const images = $("img");
  const totalImages = images.length;
  let withAlt = 0;
  const missingAltList = [];
  const formats = {};
  images.each((i, el) => {
    const alt = $(el).attr('alt') || '';
    const src = $(el).attr('src') || '';
    if (alt.trim()) withAlt++;
    else missingAltList.push({ src, index: i });
    const extMatch = src.split('?')[0].split('.').pop().toLowerCase();
    if (extMatch) formats[extMatch] = (formats[extMatch] || 0) + 1;
  });
  const altCoverage = totalImages > 0 ? Math.round((withAlt / totalImages) * 100) : 100;

  // Heading analysis
  const headings = {};
  for (let i = 1; i <= 6; i++) {
    headings['h' + i] = $("h" + i).length;
  }
  const h1Count = headings.h1;
  const multipleH1 = h1Count > 1;
  const noH1 = h1Count === 0;

  // Check for skipped heading levels (simple heuristic)
  const skipped = [];
  const levelsPresent = [];
  for (let i = 1; i <= 6; i++) if (headings['h'+i] > 0) levelsPresent.push(i);
  for (let i = 0; i < levelsPresent.length - 1; i++) {
    if (levelsPresent[i+1] - levelsPresent[i] > 1) skipped.push({ from: levelsPresent[i], to: levelsPresent[i+1] });
  }

  // Forms
  const forms = $("form");
  const formsSummary = [];
  forms.each((i, f) => {
    const inputs = $(f).find('input, textarea, select');
    const inputsWithoutLabels = [];
    inputs.each((j, inp) => {
      const id = $(inp).attr('id');
      const hasLabel = id && $(f).find(`label[for="${id}"]`).length > 0;
      const placeholder = $(inp).attr('placeholder') || '';
      if (!hasLabel) inputsWithoutLabels.push({ name: $(inp).attr('name') || null, type: $(inp).attr('type') || 'input', placeholder: placeholder });
    });
    formsSummary.push({ index: i, totalInputs: inputs.length, inputsWithoutLabels: inputsWithoutLabels.length, inputsWithoutLabelsList: inputsWithoutLabels });
  });

  return {
    totalImages,
    imagesWithAlt: withAlt,
    imagesWithoutAlt: missingAltList.length,
    altCoverage,
    formats,
    headings,
    noH1,
    multipleH1,
    skippedHeadings: skipped,
    formsCount: forms.length,
    formsSummary,
  };
}
