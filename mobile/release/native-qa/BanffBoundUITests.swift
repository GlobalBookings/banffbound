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
            if element(label).exists && element(label).isHittable { return }
            // Main content / centered modal, outside the iPad navigation sidebar.
            app.coordinate(withNormalizedOffset: CGVector(dx: 0.70, dy: 0.76))
                .press(forDuration: 0.05, thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.70, dy: 0.30)))
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
        if app.keyboards.firstMatch.exists {
            // Numeric keyboards have no Done key. An unhandled label tap in the
            // modal ScrollView dismisses it before any scrolling or save action.
            let label = app.staticTexts.matching(NSPredicate(format: "label == 'Adults'")).firstMatch
            XCTAssertTrue(label.isHittable, "Adults label must be visible to dismiss the keyboard")
            label.tap()
            let dismissed = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: app.keyboards.firstMatch)
            XCTAssertEqual(XCTWaiter.wait(for: [dismissed], timeout: 5), .completed, "Dismiss the native keyboard before scrolling")
        }
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
}
