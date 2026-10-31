import XCTest

// These tests drive the compiled native React Native UI on fresh CI simulators.
// No web render, network stubbing, private booking data, or application test hooks.
@MainActor
final class BanffBoundUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        XCUIDevice.shared.orientation = .portrait
        app = XCUIApplication(bundleIdentifier: "com.banffbound.app")
        app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
        app.launch()
        XCTAssertTrue(element("Open trip settings").waitForExistence(timeout: 45), "Embedded Release app must reach its real UI without Metro")
    }

    override func tearDownWithError() throws {
        if (testRun?.failureCount ?? 0) > 0 {
            capture("qa-failure-screen")
            let tree = XCTAttachment(string: String(app.debugDescription.prefix(24000)))
            tree.name = "qa-failure-tree"
            tree.lifetime = .keepAlways
            add(tree)
        }
        if let app, app.state == .runningForeground { app.terminate() }
    }

    private func element(_ label: String) -> XCUIElement {
        let exact = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@ OR identifier == %@", label, label)).firstMatch
        if exact.exists { return exact }
        // Native Pressable labels can include an icon and explanatory child text.
        return app.descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS %@", label)).firstMatch
    }

    private func visible(_ label: String, timeout: TimeInterval = 15) -> XCUIElement {
        let target = element(label)
        XCTAssertTrue(target.waitForExistence(timeout: timeout), "Missing UI: \(label)")
        return target
    }

    private func tap(_ label: String) {
        let target = visible(label)
        XCTAssertTrue(target.isHittable, "UI must be tappable: \(label)")
        target.tap()
    }

    private func tab(_ label: String, heading: String) {
        tap(label)
        XCTAssertTrue(visible(heading).isHittable, "Navigation must display \(heading)")
    }

    private func scrollTo(_ label: String, attempts: Int = 12) {
        for _ in 0..<attempts {
            let target = element(label)
            let keyboard = app.keyboards.firstMatch
            let keyboardTop = keyboard.exists ? keyboard.frame.minY : app.frame.maxY
            if target.exists && target.isHittable && target.frame.maxY < keyboardTop { return }
            // Drag the actual scroll content above the native keyboard, never its
            // keys. This also works for centered iPad modals beside the sidebar.
            let bottom = min(app.frame.minY + app.frame.height * 0.76, keyboardTop - 20)
            let top = max(app.frame.minY + 140, bottom - 240)
            XCTAssertGreaterThan(bottom - top, 40, "Need visible content above the keyboard to scroll")
            let origin = app.coordinate(withNormalizedOffset: CGVector(dx: 0, dy: 0))
            let x = app.frame.width * 0.70
            origin.withOffset(CGVector(dx: x, dy: bottom - app.frame.minY))
                .press(forDuration: 0.05, thenDragTo: origin.withOffset(CGVector(dx: x, dy: top - app.frame.minY)))
        }
        XCTFail("Could not scroll to \(label)")
    }

    private func capture(_ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    private func adultsField() -> XCUIElement {
        let field = app.textFields.matching(NSPredicate(format: "label == 'Adults' OR identifier == 'Adults'")).firstMatch
        XCTAssertTrue(field.waitForExistence(timeout: 15), "Adults must be an editable native text field")
        return field
    }

    func test01CapturePrimaryScreens() throws {
        XCTAssertTrue(visible("Hello, adventure.").isHittable)
        capture("store-01-today")

        tab("Explore", heading: "Find your kind of Banff.")
        XCTAssertTrue(visible("Search places").isHittable)
        XCTAssertTrue(visible("View Lake Louise").isHittable)
        capture("store-02-explore")

        tab("My Trip", heading: "Your trip, your pace.")
        XCTAssertTrue(visible("Edit trip details").isHittable)
        capture("store-03-my-trip")

        tab("Essentials", heading: "The useful little things.")
        scrollTo("Park-pass planner")
        XCTAssertTrue(visible("Park-pass planner").isHittable)
        capture("store-04-essentials")

        tab("Map", heading: "Get your bearings.")
        XCTAssertTrue(app.webViews.firstMatch.waitForExistence(timeout: 25), "Map tab must host the real native WebView; provider availability is a separate check")
    }

    func test02SavedPlaceSurvivesRelaunch() throws {
        tab("Explore", heading: "Find your kind of Banff.")
        tap("View Lake Louise")
        if element("Save this place").exists { tap("Save this place") }
        XCTAssertTrue(visible("Saved to your places").isHittable)
        tap("Close panel")
        XCTAssertTrue(visible("Unsave Lake Louise").exists)

        // Visiting another screen and a saved collection exercises committed UI state.
        tab("Essentials", heading: "The useful little things.")
        scrollTo("Saved places")
        tap("Saved places")
        XCTAssertTrue(visible("Your little collection.").isHittable)
        XCTAssertTrue(visible("Unsave Lake Louise").exists)
        capture("qa-bookmark-before-relaunch")
        app.terminate()
        app.launch()
        XCTAssertTrue(visible("Open trip settings", timeout: 45).exists)
        tab("Explore", heading: "Find your kind of Banff.")
        XCTAssertTrue(visible("Unsave Lake Louise").exists, "Saved place must survive a real process relaunch")
        capture("qa-bookmark-after-relaunch")
    }

    func test03TripDetailsSurviveRelaunch() throws {
        tap("Open trip settings")
        scrollTo("Adults")
        let adults = adultsField()
        adults.tap()
        let current = adults.value as? String ?? ""
        adults.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: current.count) + "3")
        // The form handles button taps while the numeric keyboard is open.
        // Reach its actual Save control using the visible content above it.
        scrollTo("Save trip details")
        tap("Save trip details")
        XCTAssertFalse(element("Close panel").waitForExistence(timeout: 1), "Saving details must close the panel")
        tab("My Trip", heading: "Your trip, your pace.")
        capture("qa-trip-before-relaunch")
        app.terminate()
        app.launch()
        XCTAssertTrue(visible("Open trip settings", timeout: 45).exists)
        tap("Open trip settings")
        scrollTo("Adults")
        XCTAssertEqual(adultsField().value as? String, "3", "Edited party size must survive a real process relaunch")
        capture("qa-trip-after-relaunch")
    }

    private func lakeLouiseVenueRow() -> XCUIElement {
        // The generic default outing is 'Lake Louise lakeshore time'. Require
        // the precise selected venue instead of accepting that default text.
        app.buttons.matching(NSPredicate(format: "label CONTAINS 'Lake Louise' AND NOT (label CONTAINS 'lakeshore time')")).firstMatch
    }

    func test04SpecificVenueStaysOnChosenDayAfterRelaunch() throws {
        tab("Explore", heading: "Find your kind of Banff.")
        tap("View Lake Louise")
        scrollTo("Day 1")
        tap("Day 1")
        XCTAssertTrue(visible("Day 1 · added").isHittable, "The venue must be selected for the specific first day")
        tap("Close panel")
        tab("My Trip", heading: "Your trip, your pace.")
        scrollTo("Lake Louise")
        XCTAssertTrue(lakeLouiseVenueRow().waitForExistence(timeout: 15), "My Trip must show the actual selected venue")
        capture("qa-venue-before-relaunch")

        app.terminate()
        app.launch()
        XCTAssertTrue(visible("Open trip settings", timeout: 45).exists)
        tab("My Trip", heading: "Your trip, your pace.")
        scrollTo("Lake Louise")
        let venue = lakeLouiseVenueRow()
        XCTAssertTrue(venue.waitForExistence(timeout: 15), "Precise venue must survive a real process relaunch")
        XCTAssertTrue(venue.isHittable)
        venue.tap()
        scrollTo("Day 1 · added")
        XCTAssertTrue(visible("Day 1 · added").isHittable, "Reopened venue must still belong to day one")
        capture("qa-venue-after-relaunch")
    }

    func test05OfflinePackAndBundledGuideSurviveRelaunch() throws {
        tab("Essentials", heading: "The useful little things.")
        scrollTo("Ready for offline")
        tap("Ready for offline")
        XCTAssertTrue(visible("A little less signal. A little more freedom.").exists)
        XCTAssertFalse(element("Last saved").exists, "Fresh simulator has not saved an offline pack before this test")
        scrollTo("Save trip for offline")
        tap("Save trip for offline")
        let saved = visible("Last saved", timeout: 30)
        let savedLabel = saved.label
        XCTAssertTrue(savedLabel.contains("Last saved"), "Show saved status only after the native file's write/readback succeeded")
        capture("qa-offline-saved")

        app.terminate()
        app.launch()
        XCTAssertTrue(visible("Open trip settings", timeout: 45).exists)
        tab("Essentials", heading: "The useful little things.")
        scrollTo("Ready for offline")
        tap("Ready for offline")
        XCTAssertEqual(visible("Last saved").label, savedLabel, "Native offline saved status must survive process relaunch")
        tap("Close panel")
        tab("Explore", heading: "Find your kind of Banff.")
        tap("View Lake Louise")
        scrollTo("Read the offline guide")
        tap("Read the offline guide")
        XCTAssertTrue(visible("THE OFFLINE FIELD NOTES").isHittable)
        XCTAssertTrue(visible("Lake Louise essentials").isHittable)
        XCTAssertTrue(visible("Choose the outing").exists, "Bundled guide text must open inside the native app")
        capture("qa-bundled-guide-after-relaunch")
        // OS network state is unchanged. This verifies native saving and bundled
        // reading, not an airplane-mode or external map availability scenario.
    }
}
