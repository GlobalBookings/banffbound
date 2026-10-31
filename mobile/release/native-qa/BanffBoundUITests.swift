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

    private func commerceSearch(_ identifier: String, query: String, heading: String) throws {
        scrollTo(identifier)
        let field = app.textFields.matching(identifier: identifier).firstMatch
        XCTAssertTrue(field.waitForExistence(timeout: 10) && field.isHittable, "Commerce search must be a real native editable field")
        let section = identifier.replacingOccurrences(of: "commerce-search-", with: "")
        try nativeSearch(field, query: query, heading: heading, collection: "commerce", section: section)
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

        try commerceSearch("commerce-search-tours", query: "Banff Gondola admission", heading: "Tours & experiences")
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
        try commerceSearch("commerce-search-stays", query: "Fairmont Banff Springs", heading: "Hotels & vacation rentals")
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
        try commerceSearch("commerce-search-guides", query: "concerts show planning", heading: "All website guides")
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

    // Map tests intentionally use the native WebView's actual DOM buttons for
    // marker selection. The ordinary RN list is used only by the facilities test.
    private func mapScrollToTop() {
        for _ in 0..<10 {
            let search = app.textFields.matching(identifier: "map-search").firstMatch
            if search.exists && search.isHittable && element("Get your bearings.").isHittable { return }
            let candidates = app.scrollViews.allElementsBoundByIndex.filter {
                $0.frame.height > 200 && $0.descendants(matching: .any).matching(identifier: "map-search").firstMatch.exists
            }
            guard let content = candidates.max(by: { $0.frame.height < $1.frame.height }) else {
                XCTFail("Map search must belong to its actual native content scroll view")
                return
            }
            content.swipeDown()
        }
        XCTFail("Could not bring the map search and heading into view")
    }

    private func mapSearch(_ query: String) throws {
        mapScrollToTop()
        if element("Clear map search").exists { tap("Clear map search") }
        let field = app.textFields.matching(identifier: "map-search").firstMatch
        XCTAssertTrue(field.waitForExistence(timeout: 10) && field.isHittable, "Map search must be a real native editable field")
        try nativeSearch(field, query: query, heading: "Get your bearings.", collection: "map")
    }

    // One actual native entry/submit path for map and commerce. No character
    // throttling or query retries; both native buffer stages remain mandatory.
    private func nativeSearch(_ field: XCUIElement, query: String, heading: String, collection: String, section: String? = nil) throws {
        field.tap()
        let keyboard = app.keyboards.firstMatch
        let isPhone = app.frame.width < 600
        let keyboardReady = keyboard.waitForExistence(timeout: 10)
        let searchKey = keyboard.buttons.matching(NSPredicate(format: "label ==[c] 'search' OR identifier ==[c] 'search'")).firstMatch
        let keyReadyBeforeTyping = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == true AND hittable == true"), object: searchKey)
        let searchKeyReadyBeforeTyping = isPhone
            ? keyboardReady && XCTWaiter.wait(for: [keyReadyBeforeTyping], timeout: 10) == .completed
            : searchKey.exists && searchKey.isHittable
        var observation: [String: Any] = [
            "kind": "native-\(collection)-input-observation", "query": query,
            "fieldIdentifier": field.identifier,
            "deviceClass": isPhone ? "iphone" : "ipad",
            "entryMethod": "bulk-native-text-without-return", "typedWithoutReturn": false,
            "keyboardReadyBeforeTyping": keyboardReady,
            "searchKeyReadyBeforeTyping": searchKeyReadyBeforeTyping,
            "beforeValue": NSNull(), "afterValue": NSNull(),
            "dismissalMethod": "not-attempted", "headingObserved": false, "headingLabel": NSNull(),
            "dismissalCompleted": false,
        ]
        if let section { observation["section"] = section }
        let slug = query.replacingOccurrences(of: "[^A-Za-z0-9-]+", with: "-", options: .regularExpression)
        let identity = section.map { "\($0)-\(slug)" } ?? slug
        func record(_ phase: String) throws {
            observation["phase"] = phase
            observation["fieldValue"] = (field.value as? String).map { $0 as Any } ?? NSNull()
            observation["keyboardVisible"] = keyboard.exists
            observation["searchKeyExists"] = searchKey.exists
            observation["searchKeyHittable"] = searchKey.exists && searchKey.isHittable
            observation["keyboardButtonLabels"] = keyboard.exists ? Array(keyboard.buttons.allElementsBoundByIndex.suffix(12)).map { String($0.label.prefix(80)) } : []
            let count = collection == "map"
                ? app.staticTexts.matching(identifier: "map-result-count").firstMatch
                : app.staticTexts.matching(NSPredicate(format: "label MATCHES '[0-9]+ results?'")).firstMatch
            observation["resultCountLabel"] = count.exists ? count.label : "unavailable"
            try attachJSON(observation, name: "qa-\(collection)-input-observation-\(identity)-\(phase)")
        }
        if isPhone && (!keyboardReady || !searchKeyReadyBeforeTyping) {
            try record("before")
            XCTAssertTrue(keyboardReady, "The phone must expose its actual native keyboard before bulk typing")
            XCTAssertTrue(searchKeyReadyBeforeTyping, "The phone's actual Search key must be present and hittable before bulk typing")
            return
        }
        // One uninterrupted bulk entry. Submit is a separate, actual native key
        // action so a before/after discrepancy identifies the failing phase.
        field.typeText(query)
        observation["typedWithoutReturn"] = true
        let beforeValue = field.value as? String
        observation["beforeValue"] = beforeValue.map { $0 as Any } ?? NSNull()
        try record("before") // Retain evidence before an assertion can abort this test.
        XCTAssertEqual(beforeValue, query, "The complete bulk query must be visible before any Search or blur action")
        let keyReadyForDismissal = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == true AND hittable == true"), object: searchKey)
        let searchReady = keyboard.exists && XCTWaiter.wait(for: [keyReadyForDismissal], timeout: 10) == .completed
        observation["searchReadyForDismissal"] = searchReady
        if searchReady {
            observation["dismissalMethod"] = "native-search-key"
            searchKey.tap()
        } else if !isPhone {
            let title = app.staticTexts.matching(NSPredicate(format: "label == %@", heading)).firstMatch
            let headingReady = title.exists && title.isHittable
            observation["headingObserved"] = headingReady
            if headingReady { observation["headingLabel"] = title.label }
            if !headingReady { try record("after") }
            XCTAssertTrue(headingReady, "An iPad fallback must use the actually visible native catalogue or map heading")
            observation["dismissalMethod"] = "ipad-visible-heading"
            title.tap()
        } else {
            try record("after")
            XCTAssertTrue(searchReady, "The phone must submit with its actual, hittable native Search key")
            return
        }
        let dismissed = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: keyboard)
        let dismissal = XCTWaiter.wait(for: [dismissed], timeout: 5)
        observation["dismissalCompleted"] = dismissal == .completed
        let afterValue = field.value as? String
        observation["afterValue"] = afterValue.map { $0 as Any } ?? NSNull()
        try record("after")
        XCTAssertEqual(dismissal, .completed, "The native keyboard must dismiss before browsing results")
        XCTAssertEqual(afterValue, query, "The complete native query must survive the explicit Search or iPad dismissal action")
    }

    private func mapCategoryFilter(_ label: String) -> XCUIElement {
        let target = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", label + " (")).firstMatch
        XCTAssertTrue(target.waitForExistence(timeout: 10), "Expected counted category in the expanded map filters: \(label)")
        scrollTo(target.label)
        XCTAssertTrue(target.isHittable, "Map category must be tappable: \(label)")
        return target
    }

    func test08MapDocumentMarkerOpensRestaurantDetail() throws {
        tab("Map", heading: "Get your bearings.")
        let map = app.webViews.firstMatch
        XCTAssertTrue(map.waitForExistence(timeout: 25), "Map discovery must host the real native WebView")
        let fit = map.buttons.matching(NSPredicate(format: "label == 'Fit results'")).firstMatch
        XCTAssertTrue(fit.waitForExistence(timeout: 20), "The real map document must initialize before its overview capture")
        scrollTo("Fit results")
        capture("store-08-map")

        try mapSearch("Bison")
        scrollTo("Fit results")
        XCTAssertTrue(fit.waitForExistence(timeout: 20) && fit.isHittable, "Use the actual document Fit results button")
        fit.tap()
        let pin = map.buttons.matching(NSPredicate(format: "label CONTAINS 'The Bison Restaurant' AND label CONTAINS 'Restaurants'")).firstMatch
        XCTAssertTrue(pin.waitForExistence(timeout: 20) && pin.isHittable, "Require the restaurant's actual WebView marker button, never an RN list fallback")
        let markerLabel = pin.label
        pin.tap()
        let title = visibleID("map-detail-title")
        XCTAssertEqual(title.label, "The Bison Restaurant", "Document selection must bridge the precise known marker into its native detail")
        XCTAssertTrue(title.isHittable)
        scrollTo("Food & drink")
        XCTAssertTrue(visible("Seasonal Canadian").isHittable, "The restaurant detail must include its reviewed cuisine")
        scrollTo("View the venue menu")
        XCTAssertTrue(visible("View the venue menu").isHittable, "The reviewed menu action must be available without attempting a purchase")
        scrollTo("www.thebison.ca")
        XCTAssertTrue(visible("www.thebison.ca").isHittable, "Show the actual reviewed menu destination host")
        capture("store-09-map-details")
        try attachJSON([
            "kind": "native-map-marker-detail", "selectionSurface": "native-webview-document-button",
            "webViewObserved": true, "fitResultsDocumentButtonUsed": true,
            "markerLabel": markerLabel, "restaurantTitle": title.label,
            "nativeDetailOpened": true, "reviewedCuisineObserved": "Seasonal Canadian",
            "menuActionObserved": true, "menuHostObserved": "www.thebison.ca",
            "menuOpened": false, "basemapAvailabilityVerified": false, "locationPermissionRequested": false,
        ], name: "qa-map-marker-observation")
        tapID("map-close-details")
        XCTAssertFalse(element("map-close-details").waitForExistence(timeout: 1), "Closing the native map detail must return to discovery")
    }

    func test09MapCategoriesFacilitiesAndEmptyReset() throws {
        tab("Map", heading: "Get your bearings.")
        XCTAssertTrue(app.webViews.firstMatch.waitForExistence(timeout: 25), "Map is the default discovery view")
        tapID("map-view-list")
        let listView = app.buttons.matching(identifier: "map-view-list").firstMatch
        XCTAssertTrue(listView.isSelected, "Use the actual selected List view for phone facilities and empty results")
        let mapHidden = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: app.webViews.firstMatch)
        XCTAssertEqual(XCTWaiter.wait(for: [mapHidden], timeout: 5), .completed, "List view must hide the interactive map")
        tapID("map-filter-toggle")
        tap("Lake Louise")
        let restaurants = mapCategoryFilter("Restaurants")
        restaurants.tap()
        let toilets = mapCategoryFilter("Toilets")
        toilets.tap()
        XCTAssertTrue(restaurants.isSelected && toilets.isSelected, "Map categories must support two simultaneous selections")
        restaurants.tap()
        XCTAssertFalse(restaurants.isSelected)
        XCTAssertTrue(toilets.isSelected, "Deselecting restaurants must retain the toilet category")
        mapScrollToTop()
        tapID("map-filter-toggle")
        try mapSearch("Public Washrooms")
        // Switching presentation keeps the exact query and chosen facilities filters.
        tapID("map-view-map")
        XCTAssertTrue(app.buttons.matching(identifier: "map-view-map").firstMatch.isSelected)
        XCTAssertEqual(app.textFields.matching(identifier: "map-search").firstMatch.value as? String, "Public Washrooms")
        tapID("map-view-list")
        XCTAssertTrue(listView.isSelected)
        XCTAssertEqual(app.textFields.matching(identifier: "map-search").firstMatch.value as? String, "Public Washrooms")
        XCTAssertEqual(visibleID("map-result-count").label, "1 place", "View switching must retain the chosen area, toilet category and query")
        scrollTo("View map details for Public Washrooms")
        tap("View map details for Public Washrooms")
        XCTAssertEqual(visibleID("map-detail-title").label, "Public Washrooms")
        XCTAssertTrue(visible("TOILETS · LAKE LOUISE").exists, "The actual result must be a toilet record in the chosen area")
        scrollTo("Facilities & access")
        XCTAssertTrue(visible("Facilities & access").isHittable)
        XCTAssertTrue(visible("Access in map data").isHittable, "Show the selected toilet's actual recorded facility field")
        scrollTo("Sources & updates")
        XCTAssertTrue(visible("Sources & updates").isHittable)
        XCTAssertTrue(visible("OpenStreetMap contributors · node/1623434017").isHittable, "The precise facility record must expose its actual source")
        tapID("map-close-details")
        XCTAssertFalse(element("map-close-details").waitForExistence(timeout: 1))

        try mapSearch("zzzz-no-banff-place-qa-9481")
        scrollTo("No places match those filters")
        XCTAssertTrue(visible("No places match those filters").isHittable, "An invalid public query must produce the genuine empty state")
        scrollTo("Reset map filters")
        tap("Reset map filters")
        mapScrollToTop()
        let count = visibleID("map-result-count")
        let restored = XCTNSPredicateExpectation(predicate: NSPredicate(format: "label MATCHES '[1-9][0-9]* places'"), object: count)
        XCTAssertEqual(XCTWaiter.wait(for: [restored], timeout: 5), .completed, "Reset must restore nonempty unfiltered results")
        XCTAssertFalse(element("Clear map search").exists, "Reset must clear the invalid search query")
        XCTAssertTrue(listView.isSelected, "Reset filters must preserve the visitor's selected List view")
        XCTAssertTrue(app.buttons.matching(NSPredicate(format: "label == 'Everything'")).firstMatch.isSelected, "Reset must restore all categories")
        // The collapsed control has its own accessibility label, so verify the
        // selected area through the real expanded area choices.
        tapID("map-filter-toggle")
        let allAreas = app.buttons.matching(NSPredicate(format: "label == 'All areas'")).firstMatch
        XCTAssertTrue(allAreas.waitForExistence(timeout: 10) && allAreas.isHittable && allAreas.isSelected, "Reset must restore the selected All areas chip")
        try attachJSON([
            "kind": "native-map-filter-facilities", "multipleCategoriesSelected": true,
            "listViewSelected": listView.isSelected, "viewMode": "list", "viewSwitchPreservedQueryAndFilters": true,
            "singleCategoryRetainedAfterDeselect": true, "areaObserved": "Lake Louise",
            "searchQuery": "Public Washrooms", "facilityTitle": "Public Washrooms",
            "facilityCategoryObserved": "Toilets", "facilityFieldObserved": "Access in map data",
            "sourceObserved": "OpenStreetMap contributors · node/1623434017", "detailClosed": true,
            "invalidQueryEmptyStateVerified": true, "resetRestoredAllFilters": true,
            "restoredResultCountLabel": count.label, "locationPermissionRequested": false,
        ], name: "qa-map-filter-observation")
    }

}
