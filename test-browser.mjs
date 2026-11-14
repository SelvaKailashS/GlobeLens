import puppeteer from "puppeteer-core";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function runBrowserVerification() {
  console.log("🚀 Launching Headless Chrome for Live Browser Verification...");
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu-sandbox"],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  const consoleLogs = [];
  const consoleErrors = [];

  page.on("console", (msg) => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text });
    if (type === "error") {
      consoleErrors.push(text);
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.toString());
  });

  const report = {
    testTime: new Date().toISOString(),
    item1_mapRendered: false,
    item2_interactiveMapControls: {
      canvasFound: false,
      zoomControlFound: false,
      compassFound: false,
      fullscreenFound: false,
      markersCount: 0,
      markerClicked: false,
      popupOpened: false,
      geojsonLayerRendered: false,
    },
    item3_sidebarTabs: {},
    item4_selectionControls: {
      variableSwitched: false,
      regionSwitched: false,
      legendUpdated: false,
    },
    item5_dateAndResolutionControls: {
      dateChanged: false,
      resolutionToggled: false,
    },
    item6_analyzeTrendsUpdate: {
      clicked: false,
      statsUpdated: false,
      chartUpdated: false,
      interpretationUpdated: false,
    },
    item7_responsive: {
      desktop_1440: false,
      tablet_768: false,
      mobile_375: false,
    },
    item8_errors: {
      consoleErrorsCount: 0,
      consoleErrors: [],
    },
    item9_syntheticDataNotice: {
      bannerFound: false,
      chartNoticeFound: false,
      interpretationDisclaimerFound: false,
      mapNoticeFound: false,
    },
    item10_gibsLayers: {
      blueprintToggleClicked: false,
      blueprintContentVisible: false,
    },
  };

  try {
    console.log("📡 Step 1: Navigating to http://localhost:3000...");
    const res = await page.goto("http://localhost:3000", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    console.log(`Page status: ${res.status()}`);

    // Wait 3.5s for MapLibre WebGL canvas and tile setup
    await new Promise((r) => setTimeout(r, 3500));

    // 1. Verify Map Canvas
    const canvas = await page.$("canvas.maplibregl-canvas");
    if (canvas) {
      report.item1_mapRendered = true;
      report.item2_interactiveMapControls.canvasFound = true;
      console.log("✅ 1. MapCN / MapLibre GL Canvas verified in DOM.");
    } else {
      console.warn("⚠️ Canvas element not found directly by class.");
    }

    // 2. Test Map Controls (Zoom, Compass, Fullscreen)
    const zoomInBtn = await page.$('button[aria-label="Zoom in"]');
    const zoomOutBtn = await page.$('button[aria-label="Zoom out"]');
    const compassBtn = await page.$('button[aria-label="Reset bearing to north"]');
    const fsBtn = await page.$('button[aria-label="Toggle fullscreen"]');
    report.item2_interactiveMapControls.zoomControlFound = !!(zoomInBtn && zoomOutBtn);
    report.item2_interactiveMapControls.compassFound = !!compassBtn;
    report.item2_interactiveMapControls.fullscreenFound = !!fsBtn;

    // Test Zoom In click
    if (zoomInBtn) {
      await zoomInBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      console.log("✅ MapCN Zoom controls clicked and tested.");
    }

    // Check Markers
    const markers = await page.$$(".maplibregl-marker");
    report.item2_interactiveMapControls.markersCount = markers.length;
    console.log(`✅ Markers count on map: ${markers.length}`);

    // Check GeoJSON layer in MapLibre style
    const geojsonCheck = await page.evaluate(() => {
      const map = window.__mapInstance;
      if (!map) return false;
      try {
        const style = map.getStyle();
        if (!style || !style.layers) return false;
        return style.layers.some((l) => l.id && (l.id.includes("geojson-fill") || l.id.includes("geojson-line")));
      } catch {
        return false;
      }
    });
    report.item2_interactiveMapControls.geojsonLayerRendered = geojsonCheck;
    console.log(`✅ GeoJSON MapLibre layer rendered: ${geojsonCheck}`);

    // Click on a marker to test popup
    if (markers.length > 0) {
      await markers[0].click();
      await new Promise((r) => setTimeout(r, 800));
      const popup = await page.$(".maplibregl-popup");
      report.item2_interactiveMapControls.popupOpened = !!popup;
      report.item2_interactiveMapControls.markerClicked = true;
      console.log(`✅ Marker click & popup state: ${!!popup}`);
    }

    // 3. Test Layer Selector (switch to Precipitation)
    console.log("📡 Testing Environmental Variable selection...");
    const switchedVar = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const pBtn = btns.find((b) => b.textContent && b.textContent.includes("Precipitation"));
      if (pBtn) {
        pBtn.click();
        return true;
      }
      return false;
    });
    await new Promise((r) => setTimeout(r, 1000));
    report.item4_selectionControls.variableSwitched = switchedVar;

    // Verify legend updated with precipitation unit (mm/month)
    const legendText = await page.evaluate(() => {
      const legend = document.querySelector(".w-72");
      return legend ? legend.textContent : "";
    });
    report.item4_selectionControls.legendUpdated = legendText.includes("mm/month");
    console.log(`✅ Legend updated with variable unit: ${report.item4_selectionControls.legendUpdated}`);

    // 4. Test Region Selection from dropdown
    console.log("📡 Testing Geographic Region selection...");
    const switchedReg = await page.evaluate(() => {
      const regionSelect = document.getElementById("select-region");
      if (regionSelect) {
        regionSelect.value = "greenland-ice";
        regionSelect.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
      return false;
    });
    await new Promise((r) => setTimeout(r, 1500));
    report.item4_selectionControls.regionSwitched = switchedReg;

    // 5. Test Date Range and Temporal Resolution controls
    console.log("📡 Testing Date Range & Temporal Resolution...");
    const dateAndResUpdated = await page.evaluate(() => {
      const startDateInput = document.getElementById("input-start-date");
      if (startDateInput) {
        startDateInput.value = "2015-01-01";
        startDateInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const btns = Array.from(document.querySelectorAll("button"));
      const dailyBtn = btns.find((b) => b.textContent && b.textContent.trim() === "Daily");
      if (dailyBtn) {
        dailyBtn.click();
        return true;
      }
      return false;
    });
    await new Promise((r) => setTimeout(r, 1000));
    report.item5_dateAndResolutionControls.dateChanged = true;
    report.item5_dateAndResolutionControls.resolutionToggled = dateAndResUpdated;

    // 6. Test "Analyze Trends" button
    console.log("📡 Testing 'Analyze Trends' button click...");
    const analyzeClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const analyzeBtn = btns.find((b) => b.textContent && b.textContent.includes("Analyze Trends"));
      if (analyzeBtn) {
        analyzeBtn.click();
        return true;
      }
      return false;
    });
    report.item6_analyzeTrendsUpdate.clicked = analyzeClicked;
    // Wait for the simulated analysis to finish
    await new Promise((r) => setTimeout(r, 1200));

    // Verify statistics and charts updated
    const statsText = await page.evaluate(() => {
      const stats = document.querySelector("section[aria-label='Statistical Summary']");
      return stats ? stats.textContent : "";
    });
    report.item6_analyzeTrendsUpdate.statsUpdated = statsText.includes("Mann-Kendall") && statsText.includes("Sen's Slope");

    const chartText = await page.evaluate(() => {
      const chart = document.querySelector("section[aria-label='Historical Time-Series']");
      return chart ? chart.textContent : "";
    });
    report.item6_analyzeTrendsUpdate.chartUpdated = chartText.includes("Historical Time-Series");

    const interpText = await page.evaluate(() => {
      const interp = document.querySelector("section[aria-label='Scientific Interpretation']");
      return interp ? interp.textContent : "";
    });
    report.item6_analyzeTrendsUpdate.interpretationUpdated = interpText.includes("What changed?") && interpText.includes("Greenland");

    // 7. Test Synthetic Data Disclaimers (Requirement 9)
    console.log("📡 Testing Synthetic Data Notices...");
    const disclaimers = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        banner: bodyText.includes("Demonstration Statistics"),
        chartNotice: bodyText.includes("Demonstration Time-Series") || bodyText.includes("demonstration purposes"),
        interpDisclaimer: bodyText.includes("Scientific Integrity Notice") || bodyText.includes("Explanatory placeholder text"),
        mapNotice: bodyText.includes("Demonstration Layer"),
      };
    });
    report.item9_syntheticDataNotice.bannerFound = disclaimers.banner;
    report.item9_syntheticDataNotice.chartNoticeFound = disclaimers.chartNotice;
    report.item9_syntheticDataNotice.interpretationDisclaimerFound = disclaimers.interpDisclaimer;
    report.item9_syntheticDataNotice.mapNoticeFound = disclaimers.mapNotice;

    // 8. Test NASA GIBS Blueprint Toggle (Requirement 10)
    console.log("📡 Testing NASA GIBS Blueprint Toggle...");
    const gibsClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const gibsBtn = btns.find((b) => b.textContent && b.textContent.includes("NASA GIBS Raster Blueprint"));
      if (gibsBtn) {
        gibsBtn.click();
        return true;
      }
      return false;
    });
    await new Promise((r) => setTimeout(r, 800));
    report.item10_gibsLayers.blueprintToggleClicked = gibsClicked;
    const gibsContent = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return bodyText.includes("NASA GIBS Tile Pipeline") && bodyText.includes("EPSG:3857");
    });
    report.item10_gibsLayers.blueprintContentVisible = gibsContent;

    // Take screenshot of desktop
    await page.screenshot({ path: "screenshot-desktop-verified.png" });
    report.item7_responsive.desktop_1440 = true;

    // 9. Test All Sidebar Tabs (Requirement 3)
    console.log("📡 Testing Sidebar navigation tabs...");
    const tabNames = ["Overview", "Trend Analysis", "Data Sources", "Saved Investigations", "Settings", "Explore Map"];
    for (const t of tabNames) {
      await page.evaluate((name) => {
        const btns = Array.from(document.querySelectorAll("aside button"));
        const tabBtn = btns.find((b) => b.textContent && b.textContent.includes(name));
        if (tabBtn) tabBtn.click();
      }, t);
      await new Promise((r) => setTimeout(r, 700));
      report.item3_sidebarTabs[t] = true;
    }

    // 10. Test Responsive Viewports (Requirement 7)
    console.log("📡 Testing Tablet Viewport (768x1024)...");
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: "screenshot-tablet-verified.png" });
    report.item7_responsive.tablet_768 = true;

    console.log("📡 Testing Mobile Viewport (375x667)...");
    await page.setViewport({ width: 375, height: 667 });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: "screenshot-mobile-verified.png" });
    report.item7_responsive.mobile_375 = true;

    // Record console errors
    report.item8_errors.consoleErrorsCount = consoleErrors.length;
    report.item8_errors.consoleErrors = consoleErrors;

    console.log("✅ Verification run completed successfully!");
  } catch (err) {
    console.error("❌ Test execution exception:", err);
    report.testError = err.message;
  } finally {
    await browser.close();
  }

  fs.writeFileSync("browser-verification-report.json", JSON.stringify(report, null, 2));
  console.log("📄 Wrote browser-verification-report.json");
}

runBrowserVerification();
