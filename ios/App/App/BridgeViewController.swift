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

        // Ensure the web view is using AutoLayout.
        webView.translatesAutoresizingMaskIntoConstraints = false

        // The webView is typically already added by Capacitor, but be defensive.
        if webView.superview !== self.view {
            webView.removeFromSuperview()
            self.view.addSubview(webView)
        }

        // Remove any existing constraints that pin the webView to the full view bounds.
        let superview = self.view!
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

