import UIKit
import Capacitor

/// Custom bridge VC to ensure the Capacitor WKWebView respects iOS safe areas.
/// This prevents content (and fixed bottom UI) from rendering under the notch/status bar/home indicator.
class BridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        applySafeAreaConstraintsToWebView()
    }

    override func viewSafeAreaInsetsDidChange() {
        super.viewSafeAreaInsetsDidChange()
        applySafeAreaConstraintsToWebView()
    }

    private func applySafeAreaConstraintsToWebView() {
        guard let webView = self.bridge?.webView else { return }

        // If Capacitor is using the WKWebView as the controller's root view, we must wrap it.
        // Otherwise calling `self.view.addSubview(webView)` would try to add a view to itself
        // and crash with "Can't add self as subview".
        if webView === self.view {
            let container = UIView(frame: .zero)
            container.backgroundColor = .clear
            self.view = container
            container.addSubview(webView)
        } else if webView.superview == nil {
            // If it's not in the view hierarchy for some reason, add it.
            self.view.addSubview(webView)
        }

        // Ensure the web view is using AutoLayout.
        webView.translatesAutoresizingMaskIntoConstraints = false

        // Constrain inside whichever superview it's in (root container or existing wrapper).
        guard let superview = webView.superview else { return }

        // Remove any existing constraints that pin the webView to full bounds.
        NSLayoutConstraint.deactivate(
            superview.constraints.filter { c in
                (c.firstItem as AnyObject?) === webView || (c.secondItem as AnyObject?) === webView
            }
        )

        // Constrain to safe area on all sides.
        let guide = superview.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: guide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: guide.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: guide.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: guide.trailingAnchor),
        ])
    }
}

