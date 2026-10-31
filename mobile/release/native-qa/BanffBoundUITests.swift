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

    private func scrollModalUpTo(_ label: String) {
        for _ in 0..<6 {
            if element(label).exists && element(label).isHittable { return }
            guard let modal = app.scrollViews.allElementsBoundByIndex.last else {
                XCTFail("Missing native modal scroll view")
                return
            }
            modal.swipeDown()
        }
        XCTFail("Could not scroll the modal back to \(label)")
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
        if app.keyboards.firstMatch.exists {
            // Failure captures establish this paragraph is above the keyboard
            // on both devices. An unhandled in-form tap dismisses the keyboard
            // under the app's keyboardShouldPersistTaps='handled' behavior.
            let paragraph = app.staticTexts.matching(NSPredicate(format: "label CONTAINS 'Everything stays on this device.'")).firstMatch
            XCTAssertTrue(paragraph.isHittable, "Use the visible settings paragraph to dismiss the native keyboard")
            paragraph.tap()
            let dismissed = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: app.keyboards.firstMatch)
            XCTAssertEqual(XCTWaiter.wait(for: [dismissed], timeout: 5), .completed, "Native keyboard must dismiss before Save")
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
        // The existing modal can retain its previous content offset. Read the
        // new guide from its beginning with an ordinary native scroll gesture.
        scrollModalUpTo("THE OFFLINE FIELD NOTES")
        XCTAssertTrue(visible("THE OFFLINE FIELD NOTES").isHittable)
        XCTAssertTrue(visible("Lake Louise essentials").isHittable)
        XCTAssertTrue(visible("Choose the outing").exists, "Bundled guide text must open inside the native app")
        capture("qa-bundled-guide-after-relaunch")
        // OS network state is unchanged. This verifies native saving and bundled
        // reading, not an airplane-mode or external map availability scenario.
    }

    private func visibleID(_ identifier: String, timeout: TimeInterval = 15) -> XCUIElement {
        let target = app.descendants(matching: .any).matching(identifier: identifier).firstMatch
        XCTAssertTrue(target.waitForExistence(timeout: timeout), "Missing native identifier: \(identifier)")
        return target
    }

    private func tapID(_ identifier: String) {
        let target = visibleID(identifier)
        XCTAssertTrue(target.isHittable, "Native control must be tappable: \(identifier)")
        target.tap()
    }

    private func commerceMode(_ label: String, searchID: String) {
        let pill = element(label)
        if !pill.isHittable {
            // Explore's mode pills live in a horizontal native ScrollView. Do
            // not swipe the outer vertical catalogue or invent a direct route.
            let strips = app.scrollViews.allElementsBoundByIndex.filter {
                $0.frame.height < 110 && $0.descendants(matching: .any)
                    .matching(NSPredicate(format: "label == %@ OR identifier == %@", label, label)).firstMatch.exists
            }
            XCTAssertEqual(strips.count, 1, "Expected one real Explore mode strip")
            guard let strip = strips.first else { return }
            for _ in 0..<4 {
                if pill.isHittable { break }
                strip.swipeLeft()
            }
        }
        tap(label)
        XCTAssertTrue(visibleID(searchID).isHittable, "Mode must open its actual searchable catalogue")
    }

    private func commerceSearch(_ identifier: String, query: String, heading: String) {
        scrollTo(identifier)
        let field = app.textFields.matching(identifier: identifier).firstMatch
        XCTAssertTrue(field.waitForExistence(timeout: 10), "Commerce search must be a native editable text field")
        field.tap()
        field.typeText(query + "\n")
        // A single-line native Return normally ends editing. The visible,
        // noninteractive heading is the ordinary ScrollView dismissal fallback.
        if app.keyboards.firstMatch.exists {
            let title = app.staticTexts.matching(NSPredicate(format: "label == %@", heading)).firstMatch
            XCTAssertTrue(title.isHittable, "Need the visible catalogue heading to dismiss its search keyboard")
            title.tap()
        }
        let dismissed = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: app.keyboards.firstMatch)
        XCTAssertEqual(XCTWaiter.wait(for: [dismissed], timeout: 5), .completed, "Search keyboard must dismiss before browsing results")
        XCTAssertEqual(field.value as? String, query, "The public search query must reach the actual catalogue")
    }

    private func attachJSON(_ value: [String: Any], name: String) throws {
        let data = try JSONSerialization.data(withJSONObject: value, options: [.sortedKeys])
        let attachment = XCTAttachment(string: String(decoding: data, as: UTF8.self))
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    func test06TourSearchDisclosureAndNativeBrowserHandoff() throws {
        tab("Explore", heading: "Find your kind of Banff.")
        commerceMode("Tours & tickets", searchID: "commerce-search-tours")
        XCTAssertTrue(visibleID("commerce-card-gyg-256607").exists)
        capture("store-05-tours")

        commerceSearch("commerce-search-tours", query: "Banff Gondola admission", heading: "Tours & experiences")
        scrollTo("commerce-card-gyg-256607")
        tapID("commerce-card-gyg-256607")
        XCTAssertTrue(visible("Banff Gondola admission").exists)
        scrollTo("GetYourGuide")
        XCTAssertTrue(visible("GetYourGuide").isHittable, "Tour detail must show its actual provider")
        scrollTo("Affiliate link. BanffBound may earn a commission if you book.")
        XCTAssertTrue(visible("Affiliate link. BanffBound may earn a commission if you book.").isHittable)
        scrollTo("commerce-cta-gyg-256607-booking")
        tapID("commerce-cta-gyg-256607-booking")

        // SFSafariViewController is observed through the host app on many iOS
        // versions and through Apple's SafariViewService on others. Neither
        // branch accepts a provider app or launches Safari on the test's behalf.
        let service = XCUIApplication(bundleIdentifier: "com.apple.SafariViewService")
        var browser = app!
        var done = app.buttons.matching(NSPredicate(format: "label == 'Done'")).firstMatch
        if !done.waitForExistence(timeout: 20) {
            browser = service
            done = service.buttons.matching(NSPredicate(format: "label == 'Done'")).firstMatch
        }
        XCTAssertTrue(done.waitForExistence(timeout: 15) && done.isHittable, "The real native Safari controller must present its Done control")
        XCTAssertTrue(browser.webViews.firstMatch.waitForExistence(timeout: 15), "Observe the native browser's actual WebView; successful provider loading is separate")

        // Read only domain/address text that the native address UI actually
        // exposes. A hidden query string is never treated as attribution proof.
        let labelledHosts = browser.descendants(matching: .any)
            .matching(NSPredicate(format: "label CONTAINS[c] 'getyourguide.com'")).allElementsBoundByIndex
        let addresses = (labelledHosts + browser.textFields.allElementsBoundByIndex)
            .filter { $0.isHittable && $0.frame.maxY < browser.frame.minY + 180 }
        let observed = addresses.map { element -> String in
            let value = element.value as? String ?? ""
            return String((element.label + " " + value).prefix(800))
        }.filter { $0.lowercased().contains("getyourguide.com") }.prefix(4)
        let addressObservations = Array(observed)
        let exposed = addressObservations.joined(separator: " ")
        capture("qa-commerce-browser-screen")
        done.tap()
        XCTAssertTrue(visibleID("commerce-close-details", timeout: 15).isHittable, "Done must return to the original BanffBound detail")
        XCTAssertTrue(visibleID("commerce-cta-gyg-256607-booking").exists)
        try attachJSON([
            "kind": "native-safari-handoff", "provider": "GetYourGuide", "tourTitle": "Banff Gondola admission",
            "browserAccessibilityBundle": browser === service ? "com.apple.SafariViewService" : "com.banffbound.app",
            "doneButtonObserved": true, "browserWebViewObserved": true, "returnToDetailVerified": true,
            "addressUIObservations": addressObservations,
            "visibleProviderHost": exposed.lowercased().contains("getyourguide.com") ? "getyourguide.com" : NSNull(),
            "partnerIdVisibleInAddressUI": exposed.contains("partner_id=QW960HO"),
            "campaignVisibleInAddressUI": exposed.contains("cmp=banffboundapp"),
            "networkAvailabilityVerified": false, "purchaseAttempted": false,
        ], name: "qa-commerce-browser-observation")
        tapID("commerce-close-details")
    }

    func test07StayAndNonlegacyOnlineGuideSearch() throws {
        tab("Explore", heading: "Find your kind of Banff.")
        commerceMode("Stays", searchID: "commerce-search-stays")
        XCTAssertTrue(visibleID("commerce-card-hotel-fairmont-banff-springs").exists)
        capture("store-06-stays")
        commerceSearch("commerce-search-stays", query: "Fairmont Banff Springs", heading: "Hotels & vacation rentals")
        scrollTo("commerce-card-hotel-fairmont-banff-springs")
        tapID("commerce-card-hotel-fairmont-banff-springs")
        XCTAssertTrue(visible("Fairmont Banff Springs").exists)
        scrollTo("Expedia")
        XCTAssertTrue(visible("Expedia").isHittable)
        scrollTo("Affiliate link. BanffBound may earn a commission if you book.")
        XCTAssertTrue(visible("Affiliate link. BanffBound may earn a commission if you book.").isHittable)
        XCTAssertTrue(visible("Check rooms in browser on Expedia").exists, "Hotel listing must expose its provider-specific room action")
        tapID("commerce-close-details")

        commerceMode("Guides", searchID: "commerce-search-guides")
        XCTAssertTrue(visible("All website guides").exists)
        XCTAssertTrue(visibleID("commerce-card-guide-eating-out-in-banff").exists)
        capture("store-07-guides")
        commerceSearch("commerce-search-guides", query: "concerts show planning", heading: "All website guides")
        scrollTo("commerce-card-guide-banff-live-music")
        tapID("commerce-card-guide-banff-live-music")
        XCTAssertTrue(visible("Live Music in Banff: Pubs, Concerts & Show Planning").exists,
                      "The full website index must include this guide outside the original bundled field notes")
        scrollTo("Read the full guide in browser on BanffBound")
        XCTAssertTrue(visible("Read the full guide in browser on BanffBound").isHittable)
        scrollTo("This guide index is available in the app.")
        XCTAssertTrue(visible("The full website guide opens in your browser and needs a connection.").exists,
                      "The app must distinguish its local index from online article content")
        tapID("commerce-close-details")
    }
}
